const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });

class MigrationRunner {
    constructor() {
        this.client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        this.migrationsDir = __dirname;
        this.migrationFiles = [
            '00_setup_migrations.sql',
            '01_create_extensions.sql',
            '02_create_enums_and_types.sql',
            '03_create_tables.sql',
            '04_create_functions.sql',
            '05_create_indexes.sql',
            '06_create_triggers.sql',
            '07_insert_seed_data.sql',
            '08_create_rls_policies.sql'
        ];
    }

    async connect() {
        try {
            await this.client.connect();
            console.log('✅ Connected to database');
        } catch (error) {
            console.error('❌ Failed to connect to database:', error.message);
            process.exit(1);
        }
    }

    async disconnect() {
        await this.client.end();
        console.log('📤 Disconnected from database');
    }

    async checkMigrationTable() {
        try {
            const result = await this.client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'migrations_log'
                );
            `);
            return result.rows[0].exists;
        } catch (error) {
            return false;
        }
    }

    async getExecutedMigrations() {
        try {
            const result = await this.client.query(`
                SELECT migration_name 
                FROM public.migrations_log 
                WHERE success = true 
                ORDER BY executed_at;
            `);
            return result.rows.map(row => row.migration_name);
        } catch (error) {
            return [];
        }
    }

    async executeMigration(filename) {
        const filePath = path.join(this.migrationsDir, filename);
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`Migration file not found: ${filename}`);
        }

        const sql = fs.readFileSync(filePath, 'utf8');
        const startTime = Date.now();
        
        try {
            console.log(`🔄 Executing migration: ${filename}`);
            await this.client.query(sql);
            const executionTime = Date.now() - startTime;
            console.log(`✅ Migration completed: ${filename} (${executionTime}ms)`);
            return true;
        } catch (error) {
            const executionTime = Date.now() - startTime;
            console.error(`❌ Migration failed: ${filename} (${executionTime}ms)`);
            console.error(`Error: ${error.message}`);
            
            // Log the failed migration
            try {
                await this.client.query(`
                    INSERT INTO public.migrations_log 
                    (migration_name, executed_at, execution_time_ms, success, error_message) 
                    VALUES ($1, NOW(), $2, false, $3)
                    ON CONFLICT (migration_name) DO UPDATE SET
                    executed_at = NOW(),
                    execution_time_ms = $2,
                    success = false,
                    error_message = $3;
                `, [filename, executionTime, error.message]);
            } catch (logError) {
                console.error('Failed to log migration error:', logError.message);
            }
            
            throw error;
        }
    }

    async runMigrations() {
        await this.connect();
        
        try {
            const hasTable = await this.checkMigrationTable();
            let executedMigrations = [];
            
            if (hasTable) {
                executedMigrations = await this.getExecutedMigrations();
            }

            console.log('📋 Migration Status:');
            console.log('===================');
            
            for (const filename of this.migrationFiles) {
                const isExecuted = executedMigrations.includes(filename);
                console.log(`${isExecuted ? '✅' : '⏸️ '} ${filename}`);
            }
            
            const pendingMigrations = this.migrationFiles.filter(
                filename => !executedMigrations.includes(filename)
            );

            if (pendingMigrations.length === 0) {
                console.log('\n🎉 All migrations are up to date!');
                return;
            }

            console.log(`\n🔄 Running ${pendingMigrations.length} pending migration(s)...`);
            console.log('========================================');

            for (const filename of pendingMigrations) {
                await this.executeMigration(filename);
            }

            console.log('\n🎉 All migrations completed successfully!');
            
        } catch (error) {
            console.error('\n💥 Migration process failed:', error.message);
            process.exit(1);
        } finally {
            await this.disconnect();
        }
    }

    async resetDatabase() {
        await this.connect();
        
        try {
            console.log('⚠️  WARNING: This will delete all data in the database!');
            console.log('🔄 Resetting database...');
            
            // Drop all tables and recreate schema
            await this.client.query(`
                DROP SCHEMA IF EXISTS public CASCADE;
                CREATE SCHEMA public;
                GRANT ALL ON SCHEMA public TO postgres;
                GRANT ALL ON SCHEMA public TO public;
                GRANT ALL ON SCHEMA public TO anon;
                GRANT ALL ON SCHEMA public TO authenticated;
                GRANT ALL ON SCHEMA public TO service_role;
            `);
            
            console.log('✅ Database reset completed');
            console.log('🔄 Running all migrations...');
            
            // Run all migrations
            for (const filename of this.migrationFiles) {
                await this.executeMigration(filename);
            }
            
            console.log('\n🎉 Database reset and migration completed!');
            
        } catch (error) {
            console.error('\n💥 Database reset failed:', error.message);
            process.exit(1);
        } finally {
            await this.disconnect();
        }
    }

    async showStatus() {
        await this.connect();
        
        try {
            const hasTable = await this.checkMigrationTable();
            
            if (!hasTable) {
                console.log('📋 Migration tracking table does not exist');
                console.log('⏸️  No migrations have been run');
                return;
            }

            const executedMigrations = await this.getExecutedMigrations();
            
            console.log('📋 Migration Status:');
            console.log('===================');
            
            for (const filename of this.migrationFiles) {
                const isExecuted = executedMigrations.includes(filename);
                console.log(`${isExecuted ? '✅' : '⏸️ '} ${filename}`);
            }
            
            const pendingCount = this.migrationFiles.length - executedMigrations.length;
            console.log(`\n📊 Summary: ${executedMigrations.length} executed, ${pendingCount} pending`);
            
            if (pendingCount > 0) {
                console.log('\n💡 Run "npm run migrate" to execute pending migrations');
            }
            
        } catch (error) {
            console.error('💥 Failed to get migration status:', error.message);
            process.exit(1);
        } finally {
            await this.disconnect();
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const runner = new MigrationRunner();
    
    if (args.includes('--reset')) {
        await runner.resetDatabase();
    } else if (args.includes('--status')) {
        await runner.showStatus();
    } else {
        await runner.runMigrations();
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('💥 Migration script failed:', error);
        process.exit(1);
    });
}

module.exports = MigrationRunner;
