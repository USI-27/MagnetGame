FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["npm", "start"]
