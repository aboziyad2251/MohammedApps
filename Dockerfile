# Use Node.js 18 as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to optimize build speed
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the application (standard for React/Vite)
RUN npm run build

# Install a simple server to serve the static build
RUN npm install -g serve

# Expose the port (3000 is common for React apps)
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
