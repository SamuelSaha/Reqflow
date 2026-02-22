# Development Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start OrbStack:**
   - Open OrbStack application on your Mac
   - Ensure Docker is running (you should see the OrbStack icon in your menu bar)

3. **Start local services:**
   ```bash
   make up
   # OR
   docker compose up -d
   ```

4. **Initialize the database:**
   ```bash
   npm run db:push
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   - App: http://localhost:3000
   - Drizzle Studio: `npm run db:studio` (http://localhost:4983)

## Docker Services

- **PostgreSQL**: localhost:5432
  - User: postgres
  - Password: postgres
  - Database: reqflow

- **Redis**: localhost:6379
  - No auth (local development only)

## Useful Commands

```bash
# View logs
make logs

# Stop services
make down

# Clean everything (including volumes)
make clean

# Database commands
npm run db:generate  # Generate migration files
npm run db:push      # Push schema to database
npm run db:studio    # Open database GUI

# Type checking
npm run type-check
```

## Troubleshooting

### OrbStack not running
If you see "Cannot connect to Docker daemon":
1. Open OrbStack application
2. Wait for it to fully start
3. Run `make up` again

### Port already in use
If ports 5432 or 6379 are in use:
```bash
# Find and kill the process
lsof -ti:5432 | xargs kill -9
lsof -ti:6379 | xargs kill -9
```

### Database connection issues
```bash
# Check if PostgreSQL is healthy
docker exec reqflow-postgres pg_isready -U postgres

# View PostgreSQL logs
docker logs reqflow-postgres
```
