FROM node:12.16.3-alpine

RUN mkdir /app

WORKDIR /app

COPY package.json /app/package.json

RUN yarn install

COPY mole_aggregation.js /app/mole_aggregation.js

ENTRYPOINT  yarn start
