# Stage 1: Base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (better caching — only reinstalls if package.json changes)
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy rest of the backend source code
COPY . .

# Expose the port Express runs on
EXPOSE 8000

# Start the server
CMD ["node", "server.js"]
