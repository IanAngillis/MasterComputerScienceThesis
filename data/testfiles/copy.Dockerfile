FROM debian:wheezy

# Install nginx
RUN apt-get install -y nginx && apt-get clean && rm -rf /

CMD ["/usr/sbin/nginx"]
