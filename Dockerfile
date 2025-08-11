# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY build ./build/
COPY static ./static/

# Copy production files
COPY .env.production .env
COPY start-production.sh ./

# Make startup script executable
RUN chmod +x start-production.sh

# Expose port
EXPOSE 3000

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S svelte -u 1001
USER svelte

# Start application
CMD ["./start-production.sh"]
