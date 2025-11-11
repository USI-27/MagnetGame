FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Don't prune - keep all dependencies for runtime
# (esbuild bundles with --packages=external which requires deps at runtime)

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["npm", "start"]
