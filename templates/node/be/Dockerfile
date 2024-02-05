FROM node:20.11-alpine as be-base

# Install dependencies
RUN apk update && apk add curl

############################### Development ########################################

FROM be-base as be-dev

# Set the workdir
WORKDIR /home/node/node-template

USER node

# TODO Add more services in the same format for CI/CD Tests and production
