FROM node:latest
WORKDIR /usr/src/app
COPY . /usr/src/app

ARG ELEVENLABS_API_KEY
ARG ANTHROPIC_API_KEY
ARG DB_NAME
ARG DB_HOST
ARG DB_PORT
ARG DB_USERNAME
ARG DB_PASS
ARG TZ
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG AUTH_SECRET
ARG FRONTEND_URL
ARG VITE_API_URL

# Make sure we use a compatible node linker strategy
RUN yarn config set nodeLinker node-modules

# Install root dependencies
RUN yarn install

# Install workspace dependencies individually to ensure proper node_modules setup
WORKDIR /usr/src/app/frontend
RUN yarn install
RUN yarn build

WORKDIR /usr/src/app/backend
RUN yarn install
RUN yarn build

# Return to app root for starting the application
WORKDIR /usr/src/app
CMD ["yarn", "start:prod"]

