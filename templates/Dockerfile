FROM node:20.11.1-alpine as dev-base

# Install dependencies
RUN apk update && apk add --no-cache curl=8.5.0-r0 && apk add --no-cache tini=0.19.0-r2

################################ Development BE ####################################

FROM dev-base as be-dev

# Set the workdir
WORKDIR /home/node/node-template

# Make tini the entry point of the image
ENTRYPOINT ["/sbin/tini", "-s", "--"]

################################ Development FE ####################################

FROM dev-base as fe-dev

# Set the workdir
WORKDIR /home/node/node-template

# Make tini the entry point of the image
ENTRYPOINT ["/sbin/tini", "-s", "--"]
