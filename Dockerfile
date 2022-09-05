FROM node:14.18.0

ARG BUILD_CONTEXT
ENV WORKSPACE $BUILD_CONTEXT

WORKDIR /microservices

# Copy yarn workspaces stuff
COPY package.json .
COPY yarn.lock .

# Copy the current build context
COPY ./modules modules
COPY ./microservices/$BUILD_CONTEXT microservices/$BUILD_CONTEXT

# Install dependencies
RUN yarn

# Run build for the current workspace
RUN yarn workspace $BUILD_CONTEXT build

# Clean up image
RUN rm -rf microservices/$BUILD_CONTEXT/src
RUN rm -rf microservices/$BUILD_CONTEXT/.eslintrc.json
RUN rm -rf microservices/$BUILD_CONTEXT/tsconfig.json

# Expose the port and start the server
EXPOSE 80
CMD yarn workspace ${WORKSPACE} start
