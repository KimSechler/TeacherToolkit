#!/bin/bash

echo "🚀 TeacherToolkit Vercel Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    print_warning "Please log in to Vercel..."
    vercel login
fi

# Check environment variables
print_status "Checking environment variables..."

# Check if .env file exists
if [ -f ".env" ]; then
    print_status "Found .env file"
else
    print_warning "No .env file found. Make sure to set environment variables in Vercel dashboard."
fi

# Check required environment variables
required_vars=("DATABASE_URL" "VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "SESSION_SECRET")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_warning "$var is not set in current environment"
    else
        print_status "$var is set"
    fi
done

# Build the project
print_status "Building project..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed. Please fix the errors and try again."
    exit 1
fi

print_status "Build completed successfully!"

# Check if dist/public directory exists
if [ ! -d "dist/public" ]; then
    print_error "Build output directory 'dist/public' not found!"
    print_error "Check your vite.config.ts build configuration."
    exit 1
fi

print_status "Build output verified!"

# Deploy to Vercel
print_status "Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    print_status "Deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set up environment variables in Vercel dashboard"
    echo "2. Test your application"
    echo "3. Configure your domain (optional)"
    echo ""
    echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"
    echo "📖 Environment Setup Guide: VERCEL_ENVIRONMENT_SETUP.md"
else
    print_error "Deployment failed. Check the error messages above."
    exit 1
fi 