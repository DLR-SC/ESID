# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: CC0-1.0

# Get the latest alpine image from node registry
FROM node:20-alpine AS build-stage
LABEL stage=build

# Set the working directory
WORKDIR /app

# Copy all the folder contents from local to container
COPY . .

COPY ./.env ./.env

# Run command npm install to install packages
RUN npm ci

# Create a react production build
RUN npm run build

# Get the latest alpine image from nginx registry
FROM nginx:alpine

# We copy the output from first stage that is our react build
# Into nginx html directory where it will serve our index file
COPY --from=build-stage /app/dist/ /usr/share/nginx/html
COPY --from=build-stage /app/nginx.conf /etc/nginx/templates/default.conf.template

CMD ["nginx", "-g", "daemon off;"]
