#!/bin/bash

# Etikettdrucker Production Startup Script
echo "Starting Etikettdrucker Production Server..."

# Set environment variables
export NODE_ENV=production
export HOST=0.0.0.0
export PORT=${PORT:-3000}

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Setup database (if needed)
echo "Setting up database..."
npx prisma db push

# Seed database with initial data (if needed)
echo "Seeding database..."
npm run db:seed

# Start the application
echo "Starting application on http://$HOST:$PORT"
node build/index.js
