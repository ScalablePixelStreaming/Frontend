
FROM timbru31/node-alpine-git:16 as builder

ARG VERSION=v1.0.0

RUN git clone https://github.com/ScalablePixelStreaming/Frontend.git -b $VERSION

RUN (cd Frontend && cd ./&& npm install && npm run build)

RUN mkdir www

RUN cp -a ./Frontend/dist/. www

FROM nginx:1.21.6

RUN mkdir www
WORKDIR /www

COPY --from=builder www ./

RUN rm /etc/nginx/nginx.conf
RUN ln -s /etc/nginx/sps/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80