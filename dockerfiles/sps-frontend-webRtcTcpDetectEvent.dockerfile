FROM nginx:1.21.6

RUN mkdir www
WORKDIR /www

ADD examples/webRtcTcpDetectEvent/dist/. /www/

RUN rm /etc/nginx/nginx.conf
RUN ln -s /etc/nginx/sps/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
