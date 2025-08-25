#!/bin/bash

# SiteBoss Launch Script
echo "🏗️  Starting SiteBoss Construction Management Platform..."
echo ""

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "⚠️  PostgreSQL is not running. Please start PostgreSQL first:"
    echo "   brew services start postgresql@17"
    echo "   OR"
    echo "   pg_ctl -D /opt/homebrew/var/postgresql@17 start"
    echo ""
    exit 1
fi

# Check if database exists
if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw siteboss; then
    echo "📊 Creating SiteBoss database..."
    createdb -U postgres siteboss
    
    echo "📋 Setting up database schema..."
    psql -U postgres -d siteboss -f backend/src/database/schema.sql
    echo "✅ Database created and schema applied!"
    echo ""
fi

# Function to run backend
start_backend() {
    echo "🔧 Starting Backend Server (Port 3001)..."
    cd backend
    npm install --silent
    npm run dev &
    BACKEND_PID=$!
    cd ..
    echo "✅ Backend server started (PID: $BACKEND_PID)"
    echo ""
}

# Function to run frontend
start_frontend() {
    echo "🎨 Starting Frontend Server (Port 3000)..."
    cd frontend
    npm install --silent
    npm start &
    FRONTEND_PID=$!
    cd ..
    echo "✅ Frontend server started (PID: $FRONTEND_PID)"
    echo ""
}

# Start both servers
start_backend
start_frontend

echo "🚀 SiteBoss is starting up..."
echo ""
echo "📍 Access your application at:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔧 Backend API: http://localhost:3001/api"
echo ""
echo "⏹️  To stop the servers, press Ctrl+C"
echo ""

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Shutting down SiteBoss..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped. Goodbye!"
    exit 0
}

# Set up signal handling
trap cleanup SIGINT SIGTERM

# Wait for servers to start
sleep 5

# Open browser
if command -v open &> /dev/null; then
    echo "🌐 Opening SiteBoss in your browser..."
    open http://localhost:3000
fi

# Keep script running
wait