FROM node:18-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install system dependencies required for native modules
RUN apt-get update && apt-get install -y \
    libudev-dev \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./
COPY pnpm-workspace.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install system dependencies required for native modules
RUN apt-get update && apt-get install -y \
    libudev-dev \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create public directory if it doesn't exist
RUN mkdir -p public

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
# Note: We're not using environment variables during build time
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install system dependencies required for runtime
RUN apt-get update && apt-get install -y \
    libudev1 \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Add environment variables that will be available at runtime
# These will be overridden by Railway environment variables
ENV NEXT_PUBLIC_HELIUS_API_KEY=""

# Create a script to start the application with environment variables
RUN echo '#!/bin/sh\n\
echo "Starting server with environment variables:"\n\
echo "NEXT_PUBLIC_HELIUS_API_KEY: ${NEXT_PUBLIC_HELIUS_API_KEY:-Not set}"\n\
exec node server.js\n\
' > /app/start.sh && chmod +x /app/start.sh

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public directory from builder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["/app/start.sh"] 