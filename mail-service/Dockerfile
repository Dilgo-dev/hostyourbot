FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

FROM base AS development

RUN npm install

COPY . .

EXPOSE 50053

CMD ["npm", "run", "dev"]

FROM base AS production

RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 50053

CMD ["npm", "start"]
