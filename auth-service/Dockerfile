FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

FROM base AS development

RUN apk add --no-cache python3 make g++ libc6-compat

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]

FROM base AS production

RUN apk add --no-cache python3 make g++ libc6-compat

RUN npm ci --only=production

RUN apk del python3 make g++

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
