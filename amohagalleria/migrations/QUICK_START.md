# Migration Documentation

## Quick Start

1. **First-time setup:**

   ```powershell
   cd migrations
   .\setup.ps1
   ```

2. **Configure database:**
   Edit `.env` file with your database credentials

3. **Run migrations:**
   ```powershell
   npm run migrate
   ```

## Commands Reference

| Command                  | Description                           |
| ------------------------ | ------------------------------------- |
| `npm run migrate`        | Run pending migrations                |
| `npm run migrate:status` | Show migration status                 |
| `npm run migrate:reset`  | Reset database and run all migrations |

## Environment Variables

Create a `.env` file in the migrations directory:

```env
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=development
```

## Migration Files Overview

| File                            | Purpose                   |
| ------------------------------- | ------------------------- |
| `00_setup_migrations.sql`       | Migration tracking system |
| `01_create_extensions.sql`      | PostgreSQL extensions     |
| `02_create_enums_and_types.sql` | Custom types and enums    |
| `03_create_tables.sql`          | All application tables    |
| `04_create_functions.sql`       | Database functions        |
| `05_create_indexes.sql`         | Performance indexes       |
| `06_create_triggers.sql`        | Database triggers         |
| `07_insert_seed_data.sql`       | Initial seed data         |
| `08_create_rls_policies.sql`    | Row Level Security        |

## Troubleshooting

### Common Issues

1. **Connection refused**: Check your DATABASE_URL
2. **Permission denied**: Ensure your user has CREATE privileges
3. **Extension errors**: Run as superuser or contact your DB admin

### Reset Database

⚠️ **WARNING: This destroys all data**

```powershell
npm run migrate:reset
```
