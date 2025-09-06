# # Dockerfile for an Express.js application

# FROM node:22-alpine
# # Create app directory
# WORKDIR ~/Assessment1/music-platform/app

# # Install app dependencies
# COPY package*.json ./

# RUN npm install

# # Bundle app source
# COPY . .

# EXPOSE 3000

# CMD [ "node", "index.js" ]

# Dockerfile for an Express.js application
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install app dependencies
RUN npm ci --only=production

# Copy all source code
COPY . .

EXPOSE 3000

CMD [ "node", "app.js" ]