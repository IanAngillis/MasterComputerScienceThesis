FROM ubuntu:20.04 AS base

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get -yqq update && \
    apt-get install -yq --no-install-recommends ca-certificates expat libgomp1 && \
    apt-get autoremove -y && \
    apt-get clean -y

FROM base as build

ARG NGINX_VERSION=1.18.0
ARG VOD_MODULE_VERSION=1.28
ARG SECURE_TOKEN_MODULE_VERSION=1.4
ARG RTMP_MODULE_VERSION=1.2.1

RUN cp /etc/apt/sources.list /etc/apt/sources.list~ \
    && sed -Ei 's/^# deb-src /deb-src /' /etc/apt/sources.list \
    && apt-get update

RUN apt-get -yqq build-dep nginx

RUN apt-get -yqq install --no-install-recommends curl \
    && mkdir /tmp/nginx \
    && curl -sL https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz | tar -C /tmp/nginx -zx --strip-components=1 \
    && mkdir /tmp/nginx-vod-module \
    && curl -sL https://github.com/kaltura/nginx-vod-module/archive/refs/tags/${VOD_MODULE_VERSION}.tar.gz | tar -C /tmp/nginx-vod-module -zx --strip-components=1 \
    # Patch MAX_CLIPS to allow more clips to be added than the default 128
    && sed -i 's/MAX_CLIPS (128)/MAX_CLIPS (1080)/g' /tmp/nginx-vod-module/vod/media_set.h \
    && mkdir /tmp/nginx-secure-token-module \
    && curl -sL https://github.com/kaltura/nginx-secure-token-module/archive/refs/tags/${SECURE_TOKEN_MODULE_VERSION}.tar.gz | tar -C /tmp/nginx-secure-token-module -zx --strip-components=1 \
    && mkdir /tmp/nginx-rtmp-module \
    && curl -sL https://github.com/arut/nginx-rtmp-module/archive/refs/tags/v${RTMP_MODULE_VERSION}.tar.gz | tar -C /tmp/nginx-rtmp-module -zx --strip-components=1

WORKDIR /tmp/nginx

RUN ./configure --prefix=/usr/local/nginx \
    --with-file-aio \
    --with-http_sub_module \
    --with-http_ssl_module \
    --with-threads \
    --add-module=../nginx-vod-module \
    --add-module=../nginx-secure-token-module \
    --add-module=../nginx-rtmp-module \
    --with-cc-opt="-O3 -Wno-error=implicit-fallthrough"

RUN make && make install
RUN rm -rf /usr/local/nginx/html /usr/local/nginx/conf/*.default

FROM base
COPY --from=build /usr/local/nginx /usr/local/nginx
ENTRYPOINT ["/usr/local/nginx/sbin/nginx"]
CMD ["-g", "daemon off;"]