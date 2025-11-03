@echo off
REM BizManager Deployment Script for Windows

echo [INFO] Starting BizManager deployment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    exit /b 1
)

REM Check Node.js version (must be 20 or higher)
for /f "tokens=2 delims=v." %%a in ('node --version') do (
    set NODE_MAJOR=%%a
)
if %NODE_MAJOR% LSS 20 (
    echo [ERROR] Node.js version 20 or higher is required. Current version: %NODE_MAJOR%
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    exit /b 1
)

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] PM2 is not installed, installing...
    npm install -g pm2
)

echo [INFO] All dependencies are satisfied

REM Create necessary directories
echo [INFO] Creating necessary directories...
mkdir "%USERPROFILE%\.bizmanager" >nul 2>&1

REM Install dependencies
echo [INFO] Installing dependencies...
npm ci --only=production

REM Create .env file if it doesn't exist
if not exist .env (
    echo [WARN] Creating default .env file...
    echo # Database configuration > .env
    echo DATABASE_URL="file:%USERPROFILE%\.bizmanager\bizmanager.db" >> .env
    echo. >> .env
    echo # Authentication secret - CHANGE THIS IN PRODUCTION >> .env
    echo AUTH_SECRET="your-super-secret-auth-key-change-this-in-production" >> .env
    echo. >> .env
    echo # Next.js configuration >> .env
    echo NEXT_PUBLIC_BASE_URL="http://localhost:3000" >> .env
    echo NODE_ENV="production" >> .env
    echo PORT=3000 >> .env
    echo [WARN] Please update the .env file with your production values
)

REM Run database migrations
echo [INFO] Running database migrations...
npx prisma migrate deploy

REM Build the application
echo [INFO] Building the application...
npm run build

echo [INFO] Deployment completed!
echo.
echo [INFO] To start the application, run: pm2 start ecosystem.config.js
echo [INFO] Check status with: pm2 list
echo [INFO] View logs with: pm2 logs bizmanager