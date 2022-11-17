#!/bin/sh
#
# This script launches NGINX
#

# Launch nginx
echo "starting nginx ..."
nginx -g "daemon off;" &

nginx_pid=$!

wait ${nginx_pid}

echo "nginx master process has stopped, exiting."
