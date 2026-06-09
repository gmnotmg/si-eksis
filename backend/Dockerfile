# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Production image
FROM node:20-alpine
WORKDIR /app

# Buat folder untuk data & uploads
RUN mkdir -p /app/data /app/uploads

# Copy dependencies & source
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package*.json ./

# Expose port
EXPOSE 5000

# Jalankan init DB lalu start server
CMD ["node", "src/index.js"]
