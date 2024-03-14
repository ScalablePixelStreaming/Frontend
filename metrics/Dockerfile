FROM node:lts

COPY /library /library
COPY /examples/typescript /www

WORKDIR /library
RUN npm ci
RUN npm run build-dev

WORKDIR /www
RUN npm ci
RUN npm link /library

#RUN rm /etc/nginx/nginx.conf
#RUN ln -s /etc/nginx/sps/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

WORKDIR /www
CMD npm run serve-dev

