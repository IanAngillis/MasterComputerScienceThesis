FROM debian:wheezy

# Install nginx
RUN apt-get install nodejs

CMD ["/usr/sbin/nginx"]
