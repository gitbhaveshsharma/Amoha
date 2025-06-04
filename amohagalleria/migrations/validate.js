const MigrationRunner = require('./migrate.js');
const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

class MigrationValidator {
    constructor() {
        this.client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
    }

    async connect() {
        try {
            await this.client.connect();
            console.log('✅ Database connection successful');
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    }

    async validateExtensions() {
        try {
            const result = await this.client.query(`
                SELECT extname FROM pg_extension 
                WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm', 'unaccent')
                ORDER BY extname;
            `);
            
            const expectedExtensions = ['pgcrypto', 'pg_trgm', 'unaccent', 'uuid-ossp'];
            const actualExtensions = result.rows.map(row => row.extname);
            
            console.log('\n📦 Extensions Validation:');
            expectedExtensions.forEach(ext => {
                const exists = actualExtensions.includes(ext);
                console.log(`${exists ? '✅' : '❌'} ${ext}`);
            });
            
            return actualExtensions.length === expectedExtensions.length;
        } catch (error) {
            console.error('❌ Extension validation failed:', error.message);
            return false;
        }
    }

    async validateTables() {
        try {
            const result = await this.client.query(`
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name;
            `);
            
            const expectedTables = [
                'art_categories', 'artwork_engagements', 'artwork_reviews', 'artworks',
                'bids', 'cart', 'currencies', 'events', 'exchange_rates',
                'migrations_log', 'notification', 'notification_messages',
                'payment_methods', 'payout_requests', 'profile', 'promo_code_uses',
                'promo_codes', 'sale_audit_log', 'sales', 'sales_taxes',
                'shipping_rules', 'shipping_zone_countries', 'shipping_zones',
                'support_tickets', 'system_locks', 'tax_configurations',
                'tax_types', 'ticket_attachments', 'ticket_categories',
                'ticket_comments', 'ticket_priorities', 'ticket_threads',
                'transactions', 'user_devices', 'wishlist'
            ];
            
            const actualTables = result.rows.map(row => row.table_name);
            
            console.log('\n📋 Tables Validation:');
            expectedTables.forEach(table => {
                const exists = actualTables.includes(table);
                console.log(`${exists ? '✅' : '❌'} ${table}`);
            });
            
            const missingTables = expectedTables.filter(table => !actualTables.includes(table));
            if (missingTables.length > 0) {
                console.log(`\n⚠️  Missing tables: ${missingTables.join(', ')}`);
            }
            
            return missingTables.length === 0;
        } catch (error) {
            console.error('❌ Table validation failed:', error.message);
            return false;
        }
    }

    async validateEnums() {
        try {
            const result = await this.client.query(`
                SELECT typname FROM pg_type 
                WHERE typname LIKE '%_type'
                ORDER BY typname;
            `);
            
            const expectedEnums = [
                'artwork_status_type', 'bid_status_type', 'discount_type',
                'gender_type', 'payment_method_type', 'payout_status_type',
                'processing_status_type', 'sale_status_type', 'shipping_rule_type',
                'tax_applies_to_type', 'ticket_status_type', 'transaction_type',
                'user_role_type', 'verdict_type'
            ];
            
            const actualEnums = result.rows.map(row => row.typname);
            
            console.log('\n🏷️  Enums Validation:');
            expectedEnums.forEach(enumType => {
                const exists = actualEnums.includes(enumType);
                console.log(`${exists ? '✅' : '❌'} ${enumType}`);
            });
            
            const missingEnums = expectedEnums.filter(enumType => !actualEnums.includes(enumType));
            return missingEnums.length === 0;
        } catch (error) {
            console.error('❌ Enum validation failed:', error.message);
            return false;
        }
    }

    async validateIndexes() {
        try {
            const result = await this.client.query(`
                SELECT count(*) as index_count 
                FROM pg_indexes 
                WHERE schemaname = 'public';
            `);
            
            const indexCount = parseInt(result.rows[0].index_count);
            console.log(`\n📇 Indexes Validation:`);
            console.log(`✅ Total indexes created: ${indexCount}`);
            
            return indexCount > 50; // Expect at least 50 indexes
        } catch (error) {
            console.error('❌ Index validation failed:', error.message);
            return false;
        }
    }

    async validateSeedData() {
        try {
            const checks = [
                { table: 'currencies', expected: 10 },
                { table: 'art_categories', expected: 15 },
                { table: 'shipping_zones', expected: 5 },
                { table: 'tax_types', expected: 3 }
            ];
            
            console.log('\n🌱 Seed Data Validation:');
            
            let allValid = true;
            for (const check of checks) {
                const result = await this.client.query(`SELECT count(*) as count FROM ${check.table};`);
                const actualCount = parseInt(result.rows[0].count);
                const isValid = actualCount >= check.expected;
                
                console.log(`${isValid ? '✅' : '❌'} ${check.table}: ${actualCount} records (expected: ${check.expected}+)`);
                
                if (!isValid) allValid = false;
            }
            
            return allValid;
        } catch (error) {
            console.error('❌ Seed data validation failed:', error.message);
            return false;
        }
    }

    async validateRLS() {
        try {
            const result = await this.client.query(`
                SELECT count(*) as policy_count 
                FROM pg_policies 
                WHERE schemaname = 'public';
            `);
            
            const policyCount = parseInt(result.rows[0].policy_count);
            console.log(`\n🔒 RLS Policies Validation:`);
            console.log(`✅ Total RLS policies: ${policyCount}`);
            
            return policyCount > 30; // Expect at least 30 policies
        } catch (error) {
            console.error('❌ RLS validation failed:', error.message);
            return false;
        }
    }

    async validateMigrationLog() {
        try {
            const result = await this.client.query(`
                SELECT migration_name, success 
                FROM public.migrations_log 
                ORDER BY executed_at;
            `);
            
            console.log('\n📜 Migration Log Validation:');
            
            const expectedMigrations = [
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
            
            let allValid = true;
            for (const migration of expectedMigrations) {
                const executed = result.rows.find(row => row.migration_name === migration);
                const isValid = executed && executed.success;
                
                console.log(`${isValid ? '✅' : '❌'} ${migration}`);
                
                if (!isValid) allValid = false;
            }
            
            return allValid;
        } catch (error) {
            console.error('❌ Migration log validation failed:', error.message);
            return false;
        }
    }

    async runFullValidation() {
        console.log('🔍 Running Full Database Validation');
        console.log('==================================');
        
        const connected = await this.connect();
        if (!connected) {
            process.exit(1);
        }
        
        try {
            const results = await Promise.all([
                this.validateMigrationLog(),
                this.validateExtensions(),
                this.validateEnums(),
                this.validateTables(),
                this.validateIndexes(),
                this.validateSeedData(),
                this.validateRLS()
            ]);
            
            const allValid = results.every(result => result === true);
            
            console.log('\n📊 Validation Summary:');
            console.log('=====================');
            
            if (allValid) {
                console.log('🎉 All validations passed! Database is ready for use.');
                console.log('✅ Schema migration completed successfully');
                console.log('✅ All required components are present and functional');
            } else {
                console.log('❌ Some validations failed. Please check the output above.');
                console.log('💡 Try running migrations again: npm run migrate');
            }
            
            return allValid;
            
        } catch (error) {
            console.error('💥 Validation process failed:', error.message);
            return false;
        } finally {
            await this.client.end();
        }
    }
}

// CLI interface
async function main() {
    const validator = new MigrationValidator();
    const success = await validator.runFullValidation();
    process.exit(success ? 0 : 1);
}

if (require.main === module) {
    main().catch(error => {
        console.error('💥 Validation script failed:', error);
        process.exit(1);
    });
}

module.exports = MigrationValidator;
