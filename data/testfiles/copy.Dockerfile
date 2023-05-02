FROM debian:wheezy

# Install nginx
RUN apt-get install -y nginx && apt-get notinstall -y wget

CMD ["/usr/sbin/nginx"]
