#!/bin/sh

DB_DATA_FOLDER=../db-dev-data;
ERR_LOG_FILE=compose_err_logs.txt;

UID=$(id -u);
GID=$(id -g);

####################################################################################

check_prerequisites() {
    if ! docker --version 1> /dev/null 2> /dev/null; then
        printf "\nDocker engine not installed, you may follow this: https://docs.docker.com/engine/install\n\n";
        exit 1;
    fi
    if ! docker compose version 1> /dev/null 2> /dev/null; then
        printf "\nDocker compose not installed, you may follow this: https://docs.docker.com/compose/install/linux/#install-the-plugin-manually\n\n";
        exit 1;
    fi

    return 0;
}

start() {
    printf "Building Application...\n\n" && mkdir -p "$DB_DATA_FOLDER";

    printf "Do you wish to recreate the images? (y/n) ";
    read -r opn;
    if [ "${opn:-n}" = "y" ]; then
        if ! UID="$UID" GID="$GID" docker -D compose build; then
            printf "\nDocker build failed. Solve the errors displayed above and try again\n";
            exit 1;
        fi
    fi

    run_docker && return 0;
}

run_docker() {
    if ! UID="$UID" GID="$GID" docker -D compose up --timestamps -d --wait; then
        for service in $(docker compose config --services); do
            status=$(docker inspect --format '{{.State.Health.Status}}' "$service");
            if [ "$status" != "healthy" ]; then
                docker compose logs --no-color "$service" >> "$ERR_LOG_FILE" 2>&1;
            fi
        done
        cat "$ERR_LOG_FILE";
        printf "\n\nDocker run failed. The logs are displayed above. Use them to solve the issue(s) and try again\n\n";
        exit 1;
    fi

    rm "$ERR_LOG_FILE" 1> /dev/null 2> /dev/null;

    return 0;
}

####################################################################################

cd "$(dirname "$0")" || exit 1;

check_prerequisites;
start;

printf "\nApplication is running\n\n";
