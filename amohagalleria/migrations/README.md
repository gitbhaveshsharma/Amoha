# Database Migrations

This directory contains database migration files for the AmohaGalleria project using Supabase/PostgreSQL.

## Migration Structure

Migrations are numbered sequentially and should be run in order:

1. **00_setup_migrations.sql** - Sets up the migration tracking system
2. **01_create_extensions.sql** - Creates necessary PostgreSQL extensions
3. **02_create_enums_and_types.sql** - Creates custom types and enums
4. **03_create_tables.sql** - Creates all application tables
5. **04_create_functions.sql** - Creates database functions
6. **05_create_indexes.sql** - Creates database indexes for performance
7. **06_create_triggers.sql** - Creates database triggers
8. **07_insert_seed_data.sql** - Inserts initial seed data
9. **08_create_rls_policies.sql** - Creates Row Level Security policies

## How to Run Migrations

### Option 1: Using Supabase CLI

```bash
supabase db reset
```

### Option 2: Manual SQL Execution

Run each migration file in order through the Supabase dashboard or psql:

```sql
-- Run migrations in order
\i 00_setup_migrations.sql
\i 01_create_extensions.sql
\i 02_create_enums_and_types.sql
\i 03_create_tables.sql
\i 04_create_indexes.sql
\i 05_create_functions.sql
\i 06_create_triggers.sql
\i 07_insert_seed_data.sql
\i 08_create_rls_policies.sql
```

### Option 3: Using the Migration Script (Recommended)

**First-time setup:**

```bash
cd migrations
./setup.ps1        # For Windows PowerShell
# OR
./setup.sh         # For Linux/macOS/WSL
```

**After setup, run migrations:**

```bash
npm run migrate         # Run pending migrations
npm run migrate:status  # Check migration status
npm run migrate:reset   # Reset database and run all migrations (⚠️ Destructive)
```

## Migration Best Practices

1. **Never modify existing migration files** - Create new ones instead
2. **Always backup your database** before running migrations in production
3. **Test migrations** on a development database first
4. **Use transactions** to ensure atomicity
5. **Add appropriate comments** to explain complex operations

## Creating New Migrations

When adding new migrations:

1. Create a new file with the next sequential number
2. Use descriptive names: `09_add_user_preferences_table.sql`
3. Include both UP and DOWN operations if possible
4. Test thoroughly before deploying

## Database Schema Overview

The database includes these main entities:

- **Users & Authentication** (auth.users)
- **User Profile** (profile)
- **Artworks & Categories** (artworks, art_categories)
- **Commerce** (bids, sales, cart, wishlist)
- **Payments** (payment_methods, payout_requests, transactions)
- **Notifications** (notification, notification_messages, events)
- **Support System** (support_tickets, ticket_categories, etc.)
- **Admin & Analytics** (artwork_engagements, artwork_reviews)

## Environment Setup

Make sure you have the following environment variables set:

```env
DATABASE_URL=your_supabase_db_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Troubleshooting

### Common Issues:

1. **Permission Denied**: Ensure you're using a service role key for admin operations
2. **Table Already Exists**: Check if migrations were partially run
3. **Foreign Key Violations**: Ensure dependent tables are created in correct order

### Reset Database:

```sql
-- WARNING: This will delete all data
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

## Migration Tracking

The system tracks which migrations have been run in the `migrations_log` table:

```sql
SELECT * FROM migrations_log ORDER BY executed_at;
```
