#!/bin/bash

# AmohaGalleria Database Migration Setup
# Bash script for Unix-like systems (Linux, macOS, WSL)

echo "🎨 AmohaGalleria Database Migration Setup"
echo "======================================="

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js first."
    echo "📥 Download from: https://nodejs.org/"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    
    if [ -f ".env.example" ]; then
        echo "📋 Copying .env.example to .env"
        cp .env.example .env
        echo "✅ .env file created"
        echo "📝 Please edit .env file with your database credentials"
    else
        echo "❌ .env.example not found"
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
if npm install; then
    echo "✅ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Show available commands
echo ""
echo "🚀 Available Commands:"
echo "==================="
echo "npm run migrate         - Run pending migrations"
echo "npm run migrate:status  - Show migration status"
echo "npm run migrate:reset   - Reset database and run all migrations"

echo ""
echo "💡 Next Steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Run 'npm run migrate:status' to check current status"
echo "3. Run 'npm run migrate' to execute migrations"

echo ""
echo "🎉 Setup completed!"
