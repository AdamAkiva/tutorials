#!/bin/sh

# This script is used for the docker start up. It sets up all of the required
# dependencies and start the process as PID 1 as a result of running this script
# using tini. This will allow signals to be forwarded to the application as
# expected

npm install;
npm run generate:openapi;
exec env DEBUG=node-template:* ./node_modules/.bin/nodemon --config ./nodemon.json ./src/main.ts;
