# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy source code (including all package.json files for workspace resolution)
COPY . .

# Create optional directories if they don't exist
RUN mkdir -p themes extensions config translations

# Install dependencies
RUN npm ci --workspaces --include-workspace-root && npm cache clean --force

# Compile TypeScript and build
RUN npm run compile
RUN npm run compile:db
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages
COPY --from=builder --chown=nodejs:nodejs /app/themes ./themes
COPY --from=builder --chown=nodejs:nodejs /app/extensions ./extensions
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/config ./config
COPY --from=builder --chown=nodejs:nodejs /app/translations ./translations
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Switch to non-root user
USER nodejs

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "run", "start"]
