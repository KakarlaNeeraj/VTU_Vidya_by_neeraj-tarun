# Multi-stage Docker build for VTU-Vidya by neeraj&tarun
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and client package definitions
COPY package*.json ./
COPY client/package*.json ./client/

# Install client dependencies
RUN cd client && npm install

# Copy entire source tree
COPY . .

# Build client production bundle
RUN cd client && npm run build

# Production runtime image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY server/package*.json ./server/

# Install production dependencies cleanly without executing postinstall hooks
RUN npm install --omit=dev --ignore-scripts && cd server && npm install --omit=dev --ignore-scripts

# Copy server code and pre-compiled client assets
COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3000

CMD ["node", "server/server.js"]
