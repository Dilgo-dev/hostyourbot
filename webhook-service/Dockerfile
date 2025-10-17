FROM node:20-alpine AS base

WORKDIR /app

ARG SERVICE_PATH="webhook-service"

COPY ${SERVICE_PATH}/package*.json ./

FROM base AS development

ARG SERVICE_PATH="webhook-service"

RUN npm install

COPY ${SERVICE_PATH}/ ./
COPY proto ./proto

CMD ["npm", "run", "dev"]

FROM base AS production

ARG SERVICE_PATH="webhook-service"

RUN npm install

COPY ${SERVICE_PATH}/ ./
COPY proto ./proto

RUN npm run build

CMD ["npm", "start"]
