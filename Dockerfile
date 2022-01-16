FROM node:16-alpine

ENV SITE_ADDRESS "$SITE_ADDRESS"

RUN echo $SITE_ADDRESS

RUN export SITE_ADDRESS=$SITE_ADDRESS

ADD package.json /tmp/package.json

ADD yarn.lock /tmp/yarn.lock

RUN rm -rf build

RUN cd /tmp && yarn install

ADD ./ /src

RUN rm -rf src/node_modules && cp -a /tmp/node_modules /src/

WORKDIR /src

RUN yarn build

CMD ["node", "build/src/app.js"]