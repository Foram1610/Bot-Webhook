FROM node:18-alpine

WORKDIR /atom-server-app
COPY ./ ./
COPY package.json ./

ENV NODE_ENV="develop"
ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true \
NEW_RELIC_LOG=stdout
# etc.

RUN npm install
# install datadog npm package
RUN npm install dd-trace --save

RUN npm rebuild node-sass
#RUN npm run build

#RUN rm -r node_modules/ public/ src/ tests/

# Copy the files from our build step
#COPY --from=build /home/app/ /home/app/

#WORKDIR /atom-ui-app

EXPOSE 8443
CMD ["npm","start"]
