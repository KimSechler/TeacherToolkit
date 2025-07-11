#!/bin/bash

echo "🗄️  TeacherToolkit Database Setup"
echo "=================================="

# Check if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL is already set"
    echo "Current value: ${DATABASE_URL:0:20}..."
else
    echo "❌ DATABASE_URL is not set"
    echo ""
    echo "Please choose a database option:"
    echo ""
    echo "1. Neon (Recommended - Free, Serverless)"
    echo "   - Go to https://neon.tech"
    echo "   - Sign up and create a project"
    echo "   - Copy the connection string"
    echo ""
    echo "2. Supabase (Alternative - Free)"
    echo "   - Go to https://supabase.com"
    echo "   - Sign up and create a project"
    echo "   - Go to Settings > Database"
    echo "   - Copy the connection string"
    echo ""
    echo "3. Local PostgreSQL"
    echo "   - Install PostgreSQL locally"
    echo "   - Create database: createdb teachertoolkit"
    echo "   - Use: postgresql://localhost/teachertoolkit"
    echo ""
    echo "After getting your connection string, run:"
    echo "export DATABASE_URL='your-connection-string'"
    echo ""
    echo "Or create a .env file:"
    echo "echo 'DATABASE_URL=your-connection-string' > .env"
    echo ""
    exit 1
fi

echo ""
echo "🔧 Setting up database..."

# Run database migrations
echo "📦 Running database migrations..."
npm run db:push

if [ $? -eq 0 ]; then
    echo "✅ Database setup complete!"
    echo ""
    echo "🚀 Starting server..."
    echo "The server will now use the real database instead of mock data."
    echo ""
    echo "Test the setup:"
    echo "curl http://localhost:3000/api/classes"
    echo ""
else
    echo "❌ Database setup failed!"
    echo "Please check your DATABASE_URL and try again."
    exit 1
fi 