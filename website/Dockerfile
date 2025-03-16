FROM --platform=linux/amd64 node:22-slim

WORKDIR /app

ARG PRISMA_FILE=./build/schema.prisma
ARG PRISMA_VERSION=6.2.1

COPY $PRISMA_FILE ./schema.prisma

COPY docker.package.json ./package.json

RUN npm install -g remix-serve-but-not-shit@0.0.7 && npm install

COPY ./build /app/build
COPY ./public /app/public


env PORT=8040

EXPOSE $PORT


CMD ["remix-serve-but-not-shit", "./build/server/index.js"]
