# Used to upload an image to docker-hub with curl and tini embedded in it

FROM node:20.14.0-alpine as dev-base

# Install dependencies
RUN apk update && apk add --no-cache curl && apk add --no-cache tini
