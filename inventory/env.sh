#!/bin/bash


ENV="NONE"
HOST=`hostname`

case "$HOST" in
    hc4t02629)
        ENV=bud;
        ;;
    hc4t02356)
        ENV=dev_engg;
        ;;
    hc4t04397)
        ENV=dev_engg;
        ;;
    hc4t03805)
        ENV=dev_engg;
        ;;
    *)
        echo "This server $HOST is not found in environment list"
        ;;
esac

