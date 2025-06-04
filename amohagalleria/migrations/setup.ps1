# AmohaGalleria Database Migration Setup
# PowerShell script for Windows

Write-Host "🎨 AmohaGalleria Database Migration Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "📥 Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found" -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Write-Host "📋 Copying .env.example to .env" -ForegroundColor Blue
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created" -ForegroundColor Green
        Write-Host "📝 Please edit .env file with your database credentials" -ForegroundColor Yellow
    } else {
        Write-Host "❌ .env.example not found" -ForegroundColor Red
        exit 1
    }
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
try {
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Show available commands
Write-Host ""
Write-Host "🚀 Available Commands:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "npm run migrate         - Run pending migrations" -ForegroundColor White
Write-Host "npm run migrate:status  - Show migration status" -ForegroundColor White
Write-Host "npm run migrate:reset   - Reset database and run all migrations" -ForegroundColor White

Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file with your database credentials"
Write-Host "2. Run 'npm run migrate:status' to check current status"
Write-Host "3. Run 'npm run migrate' to execute migrations"

Write-Host ""
Write-Host "🎉 Setup completed!" -ForegroundColor Green
