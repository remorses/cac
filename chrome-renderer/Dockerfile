FROM --platform=linux/amd64 gcr.io/zenika-hub/alpine-chrome

# USER root
# ENV NODE_ENV=production
# WORKDIR /src

# env CHROMIUM_FLAGS="--no-sandbox --remote-debugging-address=0.0.0.0 --remote-debugging-port=9222"

EXPOSE 9222

CMD ["chrome", "--headless", "--no-sandbox", "--remote-debugging-address=0.0.0.0", "--remote-debugging-port=9222", "--disable-setuid-sandbox", "--force-prefers-reduced-motion"]
# COPY package*.json ./
# RUN npm install

# COPY . .
# EXPOSE 8080
# CMD ["node" , "main.mjs"]
