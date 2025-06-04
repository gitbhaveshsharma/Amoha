@echo off
echo 🎨 AmohaGalleria Database Migration Setup
echo =======================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js first.
    echo 📥 Download from: https://nodejs.org/
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js found: !NODE_VERSION!
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found
    
    if exist ".env.example" (
        echo 📋 Copying .env.example to .env
        copy ".env.example" ".env" >nul
        echo ✅ .env file created
        echo 📝 Please edit .env file with your database credentials
    ) else (
        echo ❌ .env.example not found
        exit /b 1
    )
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
) else (
    echo ✅ Dependencies installed
)

REM Show available commands
echo.
echo 🚀 Available Commands:
echo ===================
echo npm run migrate         - Run pending migrations
echo npm run migrate:status  - Show migration status
echo npm run migrate:reset   - Reset database and run all migrations

echo.
echo 💡 Next Steps:
echo 1. Edit .env file with your database credentials
echo 2. Run 'npm run migrate:status' to check current status
echo 3. Run 'npm run migrate' to execute migrations

echo.
echo 🎉 Setup completed!
pause
