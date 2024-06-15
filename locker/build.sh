#!/usr/bin/env bash
rm -rf lock && mkdir lock
yarn ts-node src/index.ts
remove_invalid_packages.ts
cd lock
npm i --package-lock-only --legacy-peer-deps --force

