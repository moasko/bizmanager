@echo off
echo Starting database migration...

REM Check if running on Windows
ver | findstr /i "windows" >nul
if %errorlevel% neq 0 (
    echo This script is intended for Windows systems only.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist or is empty
if not exist "node_modules" (
    echo Installing dependencies...
    npm ci --only=production
    if %errorlevel% neq 0 (
        echo Failed to install dependencies.
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed.
)

REM Check if psql is installed
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo psql could not be found. Please install PostgreSQL client.
    echo You can install PostgreSQL from: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo DATABASE_URL environment variable is not set.
    echo Please set it to your PostgreSQL connection string.
    echo Example: set DATABASE_URL=postgresql://user:password@localhost:5432/database
    echo.
    echo Creating default .env file with PostgreSQL configuration...
    
    REM Create .env file if it doesn't exist
    if not exist .env (
        echo # Database configuration > .env
        echo DATABASE_URL="postgresql://bizmanager:secretpassword@localhost:5432/bizmanager" >> .env
        echo. >> .env
        echo # Authentication secret >> .env
        echo AUTH_SECRET="your-super-secret-auth-key-change-this-in-production" >> .env
        echo. >> .env
        echo # Next.js configuration >> .env
        echo NEXT_PUBLIC_BASE_URL="http://localhost:3000" >> .env
        echo NODE_ENV="production" >> .env
        echo PORT=3000 >> .env
        echo. >> .env
        echo Created default .env file with PostgreSQL configuration. Please review and update with your production values.
        echo.
    )
    
    REM Load environment variables from .env if it exists
    if exist .env (
        echo Loading environment variables from .env file...
        for /f "tokens=*" %%i in (.env) do (
            set "line=%%i"
            if not "!line:~0,1!"=="#" (
                set "%%i"
            )
        )
    )
)

if "%DATABASE_URL%"=="" (
    echo DATABASE_URL is still not set. Cannot proceed without PostgreSQL configuration.
    echo Please set the DATABASE_URL environment variable to your PostgreSQL connection string.
    pause
    exit /b 1
) else (
    echo Database connection string found: %DATABASE_URL%
)

REM Check if DATABASE_URL is for PostgreSQL
echo %DATABASE_URL% | findstr /i "postgresql://" >nul
if %errorlevel% neq 0 (
    echo Error: DATABASE_URL must be a PostgreSQL connection string ^(should start with postgresql://^)
    pause
    exit /b 1
)

REM Generate Prisma client
echo Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 (
    echo Failed to generate Prisma client.
    pause
    exit /b 1
)

REM Run Prisma migrations
echo Running Prisma migrations...
npx prisma migrate deploy

if %errorlevel% equ 0 (
    echo Database migration completed successfully.
) else (
    echo Database migration failed.
    pause
    exit /b 1
)

echo.
echo Database setup complete!
echo To start the application, run: npm run start
echo To start with PM2 (recommended for production): pm2 start ecosystem.config.js

pause