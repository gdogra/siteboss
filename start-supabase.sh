#!/bin/bash

# SiteBoss Launch Script (Supabase Edition)
echo "🏗️  Starting SiteBoss with Supabase Database..."
echo ""

# Check if environment variables are set
if grep -q "your_supabase_db_password_here" backend/.env; then
    echo "⚠️  Please update your Supabase database password in backend/.env"
    echo "   1. Go to https://supabase.com/dashboard/project/uemujoatttaedhonvrcf"
    echo "   2. Navigate to Settings → Database"
    echo "   3. Copy your database password"
    echo "   4. Replace 'your_supabase_db_password_here' in backend/.env"
    echo ""
    read -p "Press Enter after updating the password..."
fi

echo "📋 Setting up database schema (if needed)..."
echo "   You can run the schema manually in Supabase SQL Editor:"
echo "   https://supabase.com/dashboard/project/uemujoatttaedhonvrcf/sql"
echo ""

# Start backend in background
echo "🔧 Starting Backend Server..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!
cd ..

# Give backend time to start
sleep 3

# Start frontend in background  
echo "🎨 Starting Frontend Server..."
cd frontend
npm install
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🚀 SiteBoss is starting up with Supabase!"
echo ""
echo "📍 Access your application:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔧 Backend API: http://localhost:3001/api"
echo "   📊 Supabase Dashboard: https://supabase.com/dashboard/project/uemujoatttaedhonvrcf"
echo ""
echo "⏹️  Press Ctrl+C to stop both servers"

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Shutting down SiteBoss..."
    if [[ ! -z $BACKEND_PID ]]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [[ ! -z $FRONTEND_PID ]]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "✅ Servers stopped. Goodbye!"
    exit 0
}

# Set up signal handling
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait