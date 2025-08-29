#!/bin/bash

echo "🚀 Starting Smart Document Q&A Assistant..."
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "📋 Creating environment file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please add your GEMINI_API_KEY to backend/.env file"
    echo ""
fi

# Check if node_modules exist
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install --legacy-peer-deps
    cd ..
fi

echo "🏗️  Starting development servers..."
echo ""
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both backend and frontend
npm run dev
