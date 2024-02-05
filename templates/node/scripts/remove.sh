#!/bin/sh

DB_DATA_FOLDER=../db-dev-data;
TEST_COVERAGE_FOLDER=../be/__tests__/coverage;
FE_MODULES_FOLDER=../fe/node_modules;
BE_MODULES_FOLDER=../be/node_modules;

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

remove() {
    if ! UID="$UID" GID="$GID" docker compose down; then
        printf "\nDocker removal failed, solve the error/s and try again\n\n";
        exit 1;
    fi

    return 0;
}

remove_test_coverage() {
    printf "Do you wish to remove tests coverage folder? (y/n) ";
    read -r opn;
    if [ "${opn:-n}" = "y" ]; then
        rm -rf "$TEST_COVERAGE_FOLDER";
    fi

    return 0;
}

remove_node_modules() {
    printf "Do you wish to remove node_modules folder? (y/n) ";
    read -r opn;
    if [ "${opn:-n}" = "y" ]; then
        rm -rf "$FE_MODULES_FOLDER" "$BE_MODULES_FOLDER";
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

cd "$(dirname "$0")" || exit 1;

check_prerequisites;
remove;

remove_test_coverage;
remove_node_modules;
remove_database;

printf '\nRemoved Application\n\n';