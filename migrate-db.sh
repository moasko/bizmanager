#!/bin/bash

# Database Migration Script with Dependency Installation and VPS Setup

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if running on Unix/Linux
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    log_error "This script is intended for Unix/Linux systems. Please use migrate-db.bat instead."
    exit 1
fi

log_info "Starting database migration..."

# Install dependencies if node_modules doesn't exist or is empty
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
    log_info "Installing dependencies..."
    npm ci --only=production
    if [ $? -ne 0 ]; then
        log_error "Failed to install dependencies."
        exit 1
    fi
else
    log_info "Dependencies already installed."
fi

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    log_error "psql could not be found. Please install PostgreSQL client."
    log_info "On Ubuntu/Debian: sudo apt install postgresql-client"
    log_info "On CentOS/RHEL: sudo yum install postgresql"
    log_info "On macOS: brew install libpq"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    log_warn "DATABASE_URL environment variable is not set."
    log_info "Please set it to your PostgreSQL connection string."
    log_info "Example: export DATABASE_URL=postgresql://user:password@localhost:5432/database"
    echo
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        log_warn "Creating default .env file with PostgreSQL configuration..."
        cat > .env << EOF
# Database configuration
DATABASE_URL="postgresql://bizmanager:secretpassword@localhost:5432/bizmanager"

# Authentication secret
AUTH_SECRET="your-super-secret-auth-key-change-this-in-production"

# Next.js configuration
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="production"
PORT=3000
EOF
        log_info "Created default .env file with PostgreSQL configuration. Please review and update with your production values."
        echo
    fi
    
    # Load environment variables from .env if it exists
    if [ -f .env ]; then
        log_info "Loading environment variables from .env file..."
        export $(grep -v '^#' .env | xargs)
    fi
fi

if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL is still not set. Cannot proceed without PostgreSQL configuration."
    log_info "Please set the DATABASE_URL environment variable to your PostgreSQL connection string."
    exit 1
else
    log_info "Database connection string found: $DATABASE_URL"
fi

# Check if DATABASE_URL is for PostgreSQL
if [[ "$DATABASE_URL" != postgresql://* ]]; then
    log_error "DATABASE_URL must be a PostgreSQL connection string (should start with postgresql://)"
    exit 1
fi

# Generate Prisma client
log_info "Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    log_error "Failed to generate Prisma client."
    exit 1
fi

# Run Prisma migrations
log_info "Running Prisma migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    log_success "Database migration completed successfully."
else
    log_error "Database migration failed."
    exit 1
fi

echo
log_info "Database setup complete!"
log_info "To start the application, run: npm run start"
log_info "To start with PM2 (recommended for production): pm2 start ecosystem.config.js"