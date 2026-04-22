# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy the build output to Nginx's serving directory
COPY --from=build /app/dist /usr/share/nginx/html
# Expose port 80 for Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
