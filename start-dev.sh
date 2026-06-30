#!/bin/bash

# Start AttendSync Application on Unix/Mac/Linux

echo ""
echo "====================================="
echo "  AttendSync - Startup Script"
echo "====================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "Node.js Version: $NODE_VERSION"

echo ""
echo "Starting Backend Server..."
echo ""

# Start backend in background
(cd backend && npm install && npm run dev) &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

echo ""
echo "Starting Frontend Server..."
echo ""

# Start frontend
(cd frontend && npm install && npm run dev)
FRONTEND_PID=$!

echo ""
echo "====================================="
echo "  Servers Started"
echo "====================================="
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""
echo "IMPORTANT:"
echo "- Make sure MongoDB is running"
echo "- Check .env file is configured properly"
echo "- Open http://localhost:5173 in your browser"
echo ""

# Trap to kill both processes on script exit
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

# Wait for both processes
wait
