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

# Use the correct Yarn version as defined in package.json
RUN corepack enable
RUN corepack prepare yarn@4.9.1 --activate

# Install dependencies with proper workspace setup
RUN yarn install --immutable
# Build all workspaces
RUN yarn build
CMD ["yarn", "start:prod"]

