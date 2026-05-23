FROM node:20-alpine

WORKDIR /app

# Kopiraj package fajlove prvo (cache layer za npm install)
COPY package*.json ./
RUN npm ci --only=production

# Kopiraj ostatak projekta
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
