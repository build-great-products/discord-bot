FROM node:20.14.0-alpine AS base
WORKDIR /app
RUN npm install --global pnpm

FROM base AS builder
ENV PNPM_HOME=/app/.pnpm
ENV PATH=$PNPM_HOME:$PATH
COPY package.json pnpm-lock.yaml ./
RUN set -e; \
  mkdir -p $PNPM_HOME; \
  pnpm install
COPY . ./
RUN pnpm run build

FROM base as runner
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod
COPY --from=builder /app/dist /app/dist/
WORKDIR /app/dist
CMD node index.js
