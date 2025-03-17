FROM --platform=linux/amd64 node:22-slim

WORKDIR /app

ARG PRISMA_FILE=./build/server/schema.prisma
ARG PRISMA_VERSION=6.2.1

COPY $PRISMA_FILE ./schema.prisma

# install and generate prisma client
RUN apt update && apt install openssl ca-certificates -y \
    && npx --yes prisma@$PRISMA_VERSION generate \
    && rm -rf ~/root/.npm/_npx \
    && rm -rf ~/root/.npm/_cacache \
    && rm -rf ~/root/.cache

COPY docker.package.json ./package.json

COPY ./build /app/build
COPY ./public /app/public


env PORT=8040

EXPOSE $PORT

CMD ["node", "./build/server/index.js"]
