#!/bin/sh

####################################################################################

UID=$(id -u);
GID=$(id -g);

SCRIPT_DIR=$(dirname "$(realpath "$0")");
PROJ_ROOT_DIR=$(dirname "$SCRIPT_DIR");
DB_DATA_FOLDER="$PROJ_ROOT_DIR"/db-dev-data;

BE_DIR="$PROJ_ROOT_DIR"/be;
BE_MODULES_FOLDER="$BE_DIR"/node_modules;

FE_DIR="$PROJ_ROOT_DIR"/fe;
FE_MODULES_FOLDER="$FE_DIR"/node_modules;

####################################################################################

check_prerequisites() {
    if ! docker --version 1> /dev/null 2> /dev/null; then
        printf "\nDocker engine not installed, you may follow this: https://docs.docker.com/engine/install";
        printf "\n\n";
        exit 1;
    fi
    if ! docker compose version 1> /dev/null 2> /dev/null; then
        printf "\nDocker compose not installed, you may follow this: https://docs.docker.com/compose/install/linux/#install-the-plugin-manually";
        printf "\n\n";
        exit 1;
    fi

    return 0;
}

remove() {
    if ! UID="$UID" GID="$GID" docker compose down; then
        printf "\nDocker removal failed, solve the error/s and try again\n\n";
        exit 1;
    fi

    return 0;
}

remove_node_modules() {
    printf "Do you wish to remove node_modules folder? (y/n) ";
    read -r opn;
    if [ "${opn:-n}" = "y" ]; then
        rm -rf "$BE_MODULES_FOLDER" "$FE_MODULES_FOLDER";
    fi

    return 0;
}

remove_database() {
    printf "Do you wish to remove database folder? (y/n) ";
    read -r opn;
    if [ "${opn:-n}" = "y" ]; then
        rm -rf "$DB_DATA_FOLDER";
    fi

    return 0;
}

####################################################################################

cd "$SCRIPT_DIR" || exit 1;

check_prerequisites;
remove;

remove_node_modules;
remove_database;

printf '\nRemoved Application\n\n';
