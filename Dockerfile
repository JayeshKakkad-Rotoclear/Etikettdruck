# -------- builder --------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# OS deps for Prisma
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install deps with schema present (postinstall prisma generate needs it)
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# Copy source, generate SvelteKit files, then build
COPY . .
RUN npm run prepare
RUN npx prisma generate
ENV JWT_SECRET="__build_placeholder__"
RUN npm run build

# -------- runner --------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# OS deps for Prisma runtime
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Prod deps; ensure prisma schema exists before postinstall
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --omit=dev

# Copy built app
COPY --from=builder /app/build ./build

EXPOSE 4000
CMD ["node", "build"]
