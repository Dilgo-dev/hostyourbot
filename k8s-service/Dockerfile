FROM node:20-alpine AS base

WORKDIR /app

ARG SERVICE_PATH="k8s-service"

COPY ${SERVICE_PATH}/package*.json ./

FROM base AS development

ARG SERVICE_PATH="k8s-service"

RUN npm install

COPY ${SERVICE_PATH}/ ./
COPY proto ./proto

EXPOSE 3003

CMD ["npm", "run", "dev"]

FROM base AS production

ARG SERVICE_PATH="k8s-service"

RUN npm install

COPY ${SERVICE_PATH}/ ./
COPY proto ./proto

RUN npm run build

EXPOSE 3003

CMD ["npm", "start"]
