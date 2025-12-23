#! /usr/bin/env bash

curl -L https://raw.githubusercontent.com/modrinth/code/refs/heads/main/apps/docs/public/openapi.yaml -o ./src/modrinth/openapi/openapi.yml
pnpm dlx openapi-typescript ./src/modrinth/openapi/openapi.yml -o ./src/modrinth/openapi/types.ts -t


curl -L https://raw.githubusercontent.com/aternosorg/php-curseforge-api/refs/heads/master/openapi.yaml -o ./src/curseforge/openapi/openapi.yml
pnpm dlx openapi-typescript ./src/curseforge/openapi/openapi.yml -o ./src/curseforge/openapi/types.ts --enum --dedupe-enums -t --properties-required-by-default
