FROM --platform=linux/amd64 node:24-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY docker.package.json ./package.json

RUN npm install

COPY ./build /app/build
COPY ./public /app/public

ENV PORT=8040

EXPOSE 8040

CMD ["node", "./build/server/server.js"]
