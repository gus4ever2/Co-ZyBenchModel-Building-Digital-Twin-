# Compile the Vite frontend and bake its API addresses into the static bundle.
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/api
ARG VITE_BUILDING_DT_API_BASE_URL=/api/building-dt/components
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_BUILDING_DT_API_BASE_URL=$VITE_BUILDING_DT_API_BASE_URL

RUN npm run build

# Nginx serves the static bundle and forwards client-side routes to index.html.
FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
