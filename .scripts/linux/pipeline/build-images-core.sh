#!/usr/bin/env bash

# The version we're building, defaults to dev
VERSION=0.0.0-devel
CLOUD_PROVIDER=local

# Read the version flag if given
num=0
for var in "$@"
do
    eval flag="\$$num"

    if [[ $flag == "--provider" ]]; then
        ((num=num+1))
        eval CLOUD_PROVIDER="\$$num"
    fi

    if [[ $flag == "--version" ]]; then
        ((num=num+1))
        eval VERSION="\$$num"
    fi

    ((num=num+1))

done

# Define our base images
IMG_HTTP_SERVER="tensorworks/sps-http-server"

# Build all our core containers as background tasks
echo -e '*\n!bin/linux/amd64/*' > .dockerignore
docker build -t "$IMG_HTTP_SERVER:$VERSION-$CLOUD_PROVIDER" -f dockerfiles/http-server.dockerfile .

# push them containers to docker (3 at a time)
docker push "$IMG_HTTP_SERVER:$VERSION-$CLOUD_PROVIDER"