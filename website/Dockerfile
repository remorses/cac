FROM --platform=linux/amd64 node:18-slim

WORKDIR /app

ARG PRISMA_FILE=./build/schema.prisma
ARG PRISMA_VERSION=5.13.0

COPY $PRISMA_FILE ./schema.prisma

# install and generate prisma client
RUN apt update && apt install openssl ca-certificates -y \
    && npx --yes prisma@$PRISMA_VERSION generate \
    && rm -rf ~/root/.npm/_npx \
    && rm -rf ~/root/.npm/_cacache \
    && rm -rf ~/root/.cache

COPY docker.package.json ./package.json

RUN npm install -g remix-serve-but-not-shit@0.0.6 && npm install

COPY ./build /app/build

env PORT=8040

EXPOSE $PORT



CMD ["remix-serve-but-not-shit", "./build/server/index.js"]
