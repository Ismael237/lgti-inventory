FROM guergeiro/pnpm:22-9-slim AS base

WORKDIR /app
COPY . /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

ARG VITE_DIRECTUS_URL
ARG VITE_CREATE_SNAPSHOT_FLOW_ID

ENV VITE_DIRECTUS_URL=$VITE_DIRECTUS_URL
ENV VITE_CREATE_SNAPSHOT_FLOW_ID=$VITE_CREATE_SNAPSHOT_FLOW_ID 

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile


FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build


FROM base AS development
WORKDIR /app

COPY --from=base /app .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

CMD ["pnpm", "run", "dev"]


FROM nginx:1.28-bookworm-otel AS production
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]