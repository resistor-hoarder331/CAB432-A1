# Dockerfile for Music Platform Express.js application
FROM node:22-alpine

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Create app directory inside container (NOT ~/Assessment1/music-platform)
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Make sure src directory exists
RUN ls -la src/ || echo "src directory not found"

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]
