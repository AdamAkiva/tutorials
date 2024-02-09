#!/bin/sh

UID=$(id -u);
GID=$(id -g);

SCRIPT_DIR=$(dirname $(realpath "$0"));
PROJ_ROOT_DIR=$(dirname "$SCRIPT_DIR");
BE_DIR="$PROJ_ROOT_DIR"/be;

DB_DATA_FOLDER=db-dev-data;
ERR_LOG_FILE=compose_err_logs.txt;

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
    printf "Building Application...\n\n" && mkdir -p "$PROJ_ROOT_DIR"/"$DB_DATA_FOLDER";

    printf "Do you wish to recreate the images? (y/n) ";
    read -r opn;
    if [ "${opn:-n}" = "y" ]; then
        if ! UID="$UID" GID="$GID" docker compose build; then
            printf "\nDocker build failed. Solve the errors displayed above and try again\n";
            exit 1;
        fi
    fi

    if ! UID="$UID" GID="$GID" docker compose up --timestamps -d --wait; then
        for service in $(docker compose config --services); do
            health_status=$(docker inspect --format '{{.State.Health.Status}}' "$service");
            if [ "$health_status" != "healthy" ]; then
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

cd "$SCRIPT_DIR" || exit 1;

check_prerequisites;
start;

printf "\nApplication is running\n\n";
