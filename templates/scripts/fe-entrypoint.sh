#!/bin/sh

# This script is used for the docker start up. It sets up all of the required
# dependencies and start the process as PID 1 as a result of running this script
# using tini. This will allow signals to be forwarded to the application as
# expected

npm install --legacy-peer-deps;
exec ./node_modules/.bin/vite;