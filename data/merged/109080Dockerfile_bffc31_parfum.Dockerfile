# This file is automatically generated. Do not edit directly. #
FROM golang:1.15 AS builder

RUN if [ $(uname -m) = "x86_64" ]; then mailhog_arch="amd64"; else mailhog_arch="arm64"; fi \
    && wget -O mhsendmail.tar.gz https://github.com/mailhog/mhsendmail/archive/refs/tags/v0.2.0.tar.gz \
    && tar -xf mhsendmail.tar.gz \
    && mkdir -p ./src/github.com/mailhog/ \
    && mv ./mhsendmail-0.2.0 ./src/github.com/mailhog/mhsendmail \
    && cd ./src/github.com/mailhog/mhsendmail/ \
    && go get . \
    && GOOS=linux GOARCH=${mailhog_arch} go build -o mhsendmail .

FROM php:7.2-fpm

ARG MAGENTO_ROOT=/app

ENV PHP_MEMORY_LIMIT 2G
ENV PHP_VALIDATE_TIMESTAMPS 1
ENV DEBUG false
ENV MAGENTO_RUN_MODE production
ENV UPLOAD_MAX_FILESIZE 64M
ENV SENDMAIL_PATH /dev/null
ENV PHPRC ${MAGENTO_ROOT}/php.ini

ENV PHP_EXTENSIONS bcmath bz2 calendar exif gd gettext intl mysqli opcache pdo_mysql redis soap sockets sodium sysvmsg sysvsem sysvshm xsl zip pcntl

# Install dependencies
RUN apt-get update \
  && apt-get upgrade -y \
  && apt-get install -y --no-install-recommends \
  apt-utils \
  sendmail-bin \
  sendmail \
  sudo \
  iproute2 \
  git \
  gnupg2 \
  ca-certificates \
  lsb-release \
  software-properties-common \
  libbz2-dev \
  libjpeg62-turbo-dev \
  libpng-dev \
  libfreetype6-dev \
  libgeoip-dev \
  wget \
  libgmp-dev \
  libgpgme11-dev \
  libmagickwand-dev \
  libmagickcore-dev \
  libc-client-dev \
  libkrb5-dev \
  libicu-dev \
  libldap2-dev \
  libpspell-dev \
  librecode0 \
  librecode-dev \
  libssh2-1 \
  libssh2-1-dev \
  libtidy-dev \
  libxslt1-dev \
  libyaml-dev \
  libzip-dev \
  zip \
  && rm -rf /var/lib/apt/lists/*

# Install MailHog
COPY --from=builder /go/src/github.com/mailhog/mhsendmail/mhsendmail /usr/local/bin/
RUN sudo chmod +x /usr/local/bin/mhsendmail

# Configure the gd library
RUN docker-php-ext-configure \
  gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/
RUN docker-php-ext-configure \
  imap --with-kerberos --with-imap-ssl
RUN docker-php-ext-configure \
  opcache --enable-opcache
RUN docker-php-ext-configure \
  zip --with-libzip

# Install required PHP extensions
RUN docker-php-ext-install -j$(nproc) \
  bcmath \
  bz2 \
  calendar \
  exif \
  gd \
  gettext \
  gmp \
  imap \
  intl \
  mysqli \
  opcache \
  pdo_mysql \
  pspell \
  recode \
  shmop \
  soap \
  sockets \
  sysvmsg \
  sysvsem \
  sysvshm \
  tidy \
  xmlrpc \
  xsl \
  zip \
  pcntl

RUN pecl install -o -f \
  geoip-1.1.1 \
  gnupg \
  igbinary \
  imagick \
  mailparse \
  msgpack \
  oauth \
  pcov \
  propro \
  raphf \
  redis \
  ssh2-1.1.2 \
  xdebug-3.1.2 \
  yaml

RUN curl -L https://packages.blackfire.io/gpg.key | gpg --dearmor > blackfire.io-archive-keyring.gpg \
  && install -o root -g root -m 644 blackfire.io-archive-keyring.gpg /etc/apt/trusted.gpg.d/ \
  && echo "deb http://packages.blackfire.io/debian any main" | tee /etc/apt/sources.list.d/blackfire.list \
  && apt-get update \
  && apt-get install blackfire-php \
  && rm -rf /var/lib/apt/lists/*
RUN if [ $(uname -m) = "x86_64" ]; then ldap_arch="x86_64-linux-gnu"; else ldap_arch="aarch64-linux-gnu"; fi \
  && docker-php-ext-configure ldap --with-libdir=lib/${ldap_arch}
RUN mkdir -p /tmp/zoo \
  && cd /tmp/zoo \
  && git clone https://github.com/php-zookeeper/php-zookeeper.git \
  && curl -LO https://archive.apache.org/dist/zookeeper/zookeeper-3.4.14/zookeeper-3.4.14.tar.gz \
  && tar -xf zookeeper-3.4.14.tar.gz \
  && cp zookeeper-3.4.14/zookeeper-client/zookeeper-client-c/generated/zookeeper.jute.h zookeeper-3.4.14/zookeeper-client/zookeeper-client-c/include \
  && cd zookeeper-3.4.14/zookeeper-client/zookeeper-client-c \
  && ./configure \
  && sed -i 's/CFLAGS = -g -O2 -D_GNU_SOURCE/CFLAGS = -g -O2 -D_GNU_SOURCE -Wno-error=format-overflow -Wno-error=stringop-truncation/g' Makefile \
  && make \
  && make install \
  && ldconfig \
  && cd /tmp/zoo/php-zookeeper \
  && phpize \
  && ./configure --with-libzookeeper-dir=../zookeeper-3.4.14/zookeeper-client/zookeeper-client-c \
  && make \
  && make install
RUN rm -f /usr/local/etc/php/conf.d/*sodium.ini \
  && rm -f /usr/local/lib/php/extensions/*/*sodium.so \
  && apt-get remove libsodium* -y \
  && mkdir -p /tmp/libsodium \
  && curl -sL https://github.com/jedisct1/libsodium/archive/1.0.18-RELEASE.tar.gz | tar xzf - -C  /tmp/libsodium \
  && cd /tmp/libsodium/libsodium-1.0.18-RELEASE/ \
  && ./configure \
  && make && make check \
  && make install \
  && cd / \
  && rm -rf /tmp/libsodium \
  && pecl install -o -f libsodium
RUN cd /tmp \
  && if [ $(uname -m) = "x86_64" ]; then ioncube_arch="x86-64"; else ioncube_arch="aarch64"; fi \
  && curl -O https://downloads.ioncube.com/loader_downloads/ioncube_loaders_lin_${ioncube_arch}.tar.gz \
  && tar zxvf ioncube_loaders_lin_${ioncube_arch}.tar.gz \
  && export PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;") \
  && export PHP_EXT_DIR=$(php-config --extension-dir) \
  && cp "./ioncube/ioncube_loader_lin_${PHP_VERSION}.so" "${PHP_EXT_DIR}/ioncube.so" \
  && rm -rf ./ioncube \
  && rm ioncube_loaders_lin_${ioncube_arch}.tar.gz

COPY etc/php-fpm.ini /usr/local/etc/php/conf.d/zz-magento.ini
COPY etc/php-xdebug.ini /usr/local/etc/php/conf.d/zz-xdebug-settings.ini
COPY etc/php-pcov.ini /usr/local/etc/php/conf.d/zz-pcov-settings.ini
COPY etc/mail.ini /usr/local/etc/php/conf.d/zz-mail.ini
COPY etc/php-fpm.conf /usr/local/etc/
COPY etc/php-gnupg.ini /usr/local/etc/php/conf.d/gnupg.ini

RUN groupadd -g 1000 www && useradd -g 1000 -u 1000 -d ${MAGENTO_ROOT} -s /bin/bash www

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN ["chmod", "+x", "/docker-entrypoint.sh"]

RUN mkdir -p ${MAGENTO_ROOT}

VOLUME ${MAGENTO_ROOT}

RUN chown -R www:www /usr/local /var/www /var/log /usr/local/etc/php/conf.d ${MAGENTO_ROOT}

ENTRYPOINT ["/docker-entrypoint.sh"]

WORKDIR ${MAGENTO_ROOT}

USER root

CMD ["php-fpm", "-R"]
