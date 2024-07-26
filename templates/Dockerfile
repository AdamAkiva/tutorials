FROM node:20.16.0-alpine AS base

RUN apk add --no-cache curl tini

################################ Development BE ####################################

FROM base AS dev-be

# Set the workdir
WORKDIR /home/node/node-template

# Copy the entrypoint script to a non-volumed folder
COPY ./scripts/be-entrypoint.sh /home/node/entrypoint.sh

# Make tini the entry point of the image
ENTRYPOINT ["/sbin/tini", "-s", "--"]

# Run the script as PID 1
CMD ["/home/node/entrypoint.sh"]

################################ Development FE ####################################

FROM base AS dev-fe

# Set the workdir
WORKDIR /home/node/node-template

# Copy the entrypoint script to a non-volumed folder
COPY ./scripts/fe-entrypoint.sh /home/node/entrypoint.sh

# Make tini the entry point of the image
ENTRYPOINT ["/sbin/tini", "-s", "--"]

# Run the script as PID 1
CMD ["/home/node/entrypoint.sh"]
