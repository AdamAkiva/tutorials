FROM node:20.11.1-alpine as fe-base

# Install dependencies
RUN apk update && apk add --no-cache curl=8.5.0-r0

############################### Development ########################################

FROM fe-base as fe-dev

# Set the workdir
WORKDIR /home/node/node-template

# TODO Add more services in the same format for CI/CD Tests and production
