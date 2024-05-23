FROM node:20.13.1-alpine as dev-base

# Install dependencies
RUN apk update && apk add --no-cache curl && apk add --no-cache tini

################################ Development BE ####################################

FROM dev-base as dev-be

# Set the workdir
WORKDIR /home/node/node-template

# Copy the entrypoint script to a non-volumed folder
COPY ./scripts/be-entrypoint.sh /home/node/entrypoint.sh

# Make tini the entry point of the image
ENTRYPOINT ["/sbin/tini", "-s", "--"]

# Run the script as PID 1
CMD ["/home/node/entrypoint.sh"]

################################ Development FE ####################################

FROM dev-base as dev-fe

# Set the workdir
WORKDIR /home/node/node-template

# Copy the entrypoint script to a non-volumed folder
COPY ./scripts/fe-entrypoint.sh /home/node/entrypoint.sh

# Make tini the entry point of the image
ENTRYPOINT ["/sbin/tini", "-s", "--"]

# Run the script as PID 1
CMD ["/home/node/entrypoint.sh"]
