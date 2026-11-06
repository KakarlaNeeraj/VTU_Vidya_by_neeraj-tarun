# Multi-stage Docker build for VTU-Vidya by neeraj&tarun
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and client manifests
COPY package*.json ./
COPY client/package*.json ./client/

# Install client dependencies and build
RUN cd client && npm install

# Copy source files
COPY . .

# Build client production bundle
RUN cd client && npm run build

# Production runtime image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

COPY package*.json ./
COPY server/package*.json ./server/

# Install production dependencies
RUN npm install --omit=dev && cd server && npm install --omit=dev

# Copy server and built frontend
COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5001

CMD ["node", "server/server.js"]
