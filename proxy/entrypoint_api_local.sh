#!/bin/sh
#
# This script launches nginx and the NGINX Amplify Agent.
#
# Unless already baked in the image, a real AMPLIFY_API_KEY is required for the
# NGINX Amplify Agent to be able to connect to the backend.
#
# If AMPLIFY_IMAGENAME is set, the script will use it to generate
# the 'imagename' to put in the /etc/amplify-agent/agent.conf
#
# If several instances use the same imagename, the metrics will
# be aggregated into a single object in Amplify. Otherwise NGINX Amplify
# will create separate objects for monitoring (an object per instance).
#

# Variables
agent_conf_file="/etc/amplify-agent/custom/agent.conf"
agent_log_file="/var/log/amplify-agent/agent.log"
api_key=""
amplify_imagename=""

cp /etc/amplify-agent/agent.conf /etc/amplify-agent/custom/agent.conf

# Launch nginx
echo "starting nginx ..."
nginx -g "daemon off;" &

nginx_pid=$!

# Simulate running AWS version
echo "i-11111111111111111" > /etc/amplify-agent/custom/instance_id
echo "local" > /etc/amplify-agent/custom/environment

# Application name
AMPLIFY_IMAGENAME=api-nginx

# Get Docker Host instance id
INSTANCE_ID=`cat /etc/amplify-agent/custom/instance_id`

# Get environment
ENVIRONMENT=`cat /etc/amplify-agent/custom/environment`

test -n "${AMPLIFY_API_KEY}" && \
    api_key=${AMPLIFY_API_KEY}

test -n "${AMPLIFY_IMAGENAME}" && \
    amplify_imagename=${ENVIRONMENT}-${AMPLIFY_IMAGENAME}-${INSTANCE_ID}

test -n "${ENVIRONMENT}" && \
    tags=${ENVIRONMENT}

if [ -n "${api_key}" -o -n "${amplify_imagename}" -o -n "${tags}" ]; then
    echo "updating ${agent_conf_file} ..."

    test -n "${api_key}" && \
    echo " ---> using api_key = ${api_key}" && \
    sh -c "sed -i.old -e 's/api_key.*$/api_key = $api_key/' \
    ${agent_conf_file}"

    test -n "${amplify_imagename}" && \
    echo " ---> using imagename = ${amplify_imagename}" && \
    sh -c "sed -i.old -e 's/imagename.*$/imagename = $amplify_imagename/' \
    ${agent_conf_file}"

    test -n "${tags}" && \
    echo " ---> using tag = ${tags}" && \
    sh -c "sed -i.old -e '9s/tags.*$/tags = $tags/' \
    ${agent_conf_file}"

    rm -f ${agent_conf_file}.old

    test -f "${agent_conf_file}" && \
    chmod 644 ${agent_conf_file} && \
    chown nginx ${agent_conf_file} > /dev/null 2>&1

fi

if ! grep '^api_key.*=[ ]*[[:alnum:]].*' ${agent_conf_file} > /dev/null 2>&1; then
    echo "no api_key found in ${agent_conf_file}! exiting."
fi

echo "starting amplify-agent ..."
service amplify-agent start > /dev/null 2>&1 < /dev/null

if [ $? != 0 ]; then
    echo "couldn't start the agent, please check ${agent_log_file}"
fi

wait ${nginx_pid}

echo "nginx master process has stopped, exiting."
