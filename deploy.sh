#!/bin/bash

# BizManager Deployment Script

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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_error "This script should not be run as root"
    exit 1
fi

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_VERSION" -lt "20" ]; then
        log_error "Node.js version 20 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v pm2 &> /dev/null; then
        log_warn "PM2 is not installed, installing..."
        npm install -g pm2
    fi
    
    log_info "All dependencies are satisfied"
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    
    # Create app directory
    sudo mkdir -p /var/www/bizmanager
    sudo chown $USER:$USER /var/www/bizmanager
    
    # Create database directory
    sudo mkdir -p /var/lib/bizmanager
    sudo chown $USER:$USER /var/lib/bizmanager
    
    # Create logs directory
    mkdir -p /var/www/bizmanager/logs
}

# Deploy application
deploy_app() {
    log_info "Deploying application..."
    
    # Copy files to deployment directory
    rsync -av --exclude node_modules --exclude .git . /var/www/bizmanager/
    
    # Change to app directory
    cd /var/www/bizmanager
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --only=production
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        log_warn "Creating default .env file..."
        cat > .env << EOF
# Database configuration
DATABASE_URL="file:/var/lib/bizmanager/bizmanager.db"

# Authentication secret - CHANGE THIS IN PRODUCTION
AUTH_SECRET="your-super-secret-auth-key-change-this-in-production"

# Next.js configuration
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="production"
PORT=3000
EOF
        log_warn "Please update the .env file with your production values"
    fi
    
    # Run database migrations
    log_info "Running database migrations..."
    npx prisma migrate deploy
    
    # Build the application
    log_info "Building the application..."
    npm run build
}

# Start application with PM2
start_app() {
    log_info "Starting application with PM2..."
    
    cd /var/www/bizmanager
    
    # Check if app is already running
    if pm2 list | grep -q "bizmanager"; then
        log_info "Restarting existing application..."
        pm2 restart bizmanager
    else
        log_info "Starting new application..."
        pm2 start ecosystem.config.js
    fi
    
    # Save PM2 configuration
    pm2 save
}

# Setup Nginx (optional)
setup_nginx() {
    log_info "Setting up Nginx configuration..."
    
    # Check if Nginx is installed
    if ! command -v nginx &> /dev/null; then
        log_warn "Nginx is not installed, skipping Nginx setup"
        return
    fi
    
    # Create Nginx config
    sudo tee /etc/nginx/sites-available/bizmanager > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/bizmanager /etc/nginx/sites-enabled/
    
    # Test configuration
    if sudo nginx -t; then
        sudo systemctl reload nginx
        log_info "Nginx configuration updated successfully"
    else
        log_error "Nginx configuration test failed"
    fi
}

# Main deployment process
main() {
    log_info "Starting BizManager deployment..."
    
    check_dependencies
    create_directories
    deploy_app
    start_app
    setup_nginx
    
    log_info "Deployment completed!"
    echo
    log_info "Application is now running with PM2"
    log_info "Check status with: pm2 list"
    log_info "View logs with: pm2 logs bizmanager"
}

# Run main function
main "$@"