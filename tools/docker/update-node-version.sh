#!/bin/sh

DOCKER_DIR=$(dirname "$(realpath "$0")");
ROOT_DIR=$(dirname "$SCRIPT_DIR");
IMAGE_TAG=adamakiva14/node:$1

####################################################################################

if [ -z "$1" ]; then
    printf "Missing image tag (only the version number, no need for prefix)\n";
    exit 1;
fi

cd "$DOCKER_DIR" || exit 1;

docker build . -t "$IMAGE_TAG" &&
docker push "$IMAGE_TAG" &&
docker image rm "$IMAGE_TAG";

printf "\nNew image "$IMAGE_TAG" uploaded successfully\n\n";
