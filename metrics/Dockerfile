FROM node:lts-slim

COPY /library /library
COPY /examples/typescript /www

WORKDIR /library
RUN npm ci
RUN npm run build-dev

WORKDIR /www
RUN npm ci
RUN npm link /library

EXPOSE 8080

WORKDIR /www
CMD npm run serve-dev

