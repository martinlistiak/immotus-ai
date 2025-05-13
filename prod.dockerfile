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

# Configure Yarn to use node-modules linker
COPY .yarnrc.yml .yarnrc.yml
# Ensure .yarn directory is copied
COPY .yarn .yarn

# Install dependencies properly for all workspaces
RUN yarn install

# Build all workspaces in the correct order
RUN cd frontend && yarn build && cd .. && cd backend && yarn build && cd ..

CMD ["yarn", "start:prod"]

