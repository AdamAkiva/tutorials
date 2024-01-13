FROM node:lts-alpine

WORKDIR /app

COPY ./package*.json ./tsconfig.json ./
RUN npm install

COPY ./ ./
