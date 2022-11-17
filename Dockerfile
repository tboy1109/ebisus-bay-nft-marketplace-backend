#####################
### Runtime image ###
#####################

FROM node:16-slim

# Update packages
RUN apt-get update && apt-get install -y git curl procps htop net-tools netcat dnsutils

# Copy the required files from the build step
WORKDIR /usr/src/app

COPY package*.json ./
COPY src ./src
COPY public ./public
COPY dist ./dist

COPY node_modules ./node_modules

# Print Node.js version
RUN node --version

# Enable logging
RUN mkdir -p /var/log/nodejs && touch /var/log/nodejs/nodejs.log && chown -R node:node /var/log/nodejs

# Add startup scripts
# API
COPY start_api.sh /usr/local/bin/start_api.sh
RUN chmod +x /usr/local/bin/start_api.sh && ln -s /usr/local/bin/start_api.sh /
# ADMIN
COPY start_admin.sh /usr/local/bin/start_admin.sh
RUN chmod +x /usr/local/bin/start_admin.sh && ln -s /usr/local/bin/start_admin.sh /

# Harden Image
COPY ./harden.sh .
RUN chmod +x harden.sh && \
    sh harden.sh && \
    rm -f harden.sh

# Force container to run as a non-root user
USER node
