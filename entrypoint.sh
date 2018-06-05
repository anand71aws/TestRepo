#!/bin/sh

#if [ -n "$VAULT_GITHUB_TOKEN" ]; then
mkdir -p ssl &&
export VAULT_ADDR=https://dashboard.docker.hpecorp.net:8200 &&
export VAULT_SKIP_VERIFY=1 &&
vault auth -method=github token=15cbb68e0bc44561808e5c255cda4584c7039401 &&
#vault auth -method=github token=$VAULT_GITHUB_TOKEN &&
vault read -field=value secret/global-it-entmon/entmon/dev_engg/sslkey > ./ssl/entmon-workflow-service.key &&
vault read -field=value secret/global-it-entmon/entmon/dev_engg/sslpem > ./ssl/entmon-workflow-service.pem &&
#fi

export NODE_PATH=$PWD
node server.js


