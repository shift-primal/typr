# syntax=docker/dockerfile:1
# Typr production image (spec 0001). Holds no secrets: varlock resolves them from
# Bitwarden at start, using BWS_ACCESS_TOKEN and APP_ENV set by Coolify.

FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# Self contained env schema with the Bitwarden plugin vendored, so starting never needs npm.
RUN pnpm build && \
	pnpm exec varlock flatten --vendor-plugins --out-dir .env-flat

FROM node:24-bookworm-slim AS varlock
ARG VARLOCK_VERSION=1.21.1
RUN apt-get update \
	&& apt-get install -y --no-install-recommends curl ca-certificates \
	&& curl -sSfL https://varlock.dev/install.sh | sh -s -- --version=${VARLOCK_VERSION} --dir=/usr/local/bin --force-no-brew

FROM node:24-bookworm-slim AS runtime
ARG APP_VERSION=dev
ENV NODE_ENV=production \
	APP_ENV=production \
	APP_VERSION=${APP_VERSION} \
	PORT=3000
WORKDIR /app
COPY --from=varlock /usr/local/bin/varlock /usr/local/bin/varlock
COPY --from=build --chown=node:node /app/.output ./.output
COPY --from=build --chown=node:node /app/.env-flat/ ./
USER node
EXPOSE 3000
CMD ["varlock", "run", "--", "node", ".output/server/index.mjs"]
