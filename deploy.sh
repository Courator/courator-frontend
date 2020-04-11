#!/usr/bin/env bash

set -eE

export REACT_APP_COURATOR_API_URL=/api/v1

yarn
yarn build
sudo rm -rf /opt/courator
sudo cp -R build/ /opt/courator
sudo chown -R www-data:www-data /opt/courator
echo "Deployed to /opt/courator"

