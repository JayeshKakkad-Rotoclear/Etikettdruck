@echo off
REM Etikettdrucker Production Startup Script for Windows

echo Starting Etikettdrucker Production Server...

REM Set environment variables
set NODE_ENV=production
set HOST=0.0.0.0
if "%PORT%"=="" set PORT=3000

REM Generate Prisma client
echo Generating Prisma client...
npx prisma generate

REM Setup database (if needed)
echo Setting up database...
npx prisma db push

REM Seed database with initial data (if needed)
echo Seeding database...
npm run db:seed

REM Start the application
echo Starting application on http://%HOST%:%PORT%
node build\index.js
