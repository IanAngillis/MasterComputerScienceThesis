FROM ubuntu:trusty  
MAINTAINER Tom <tom@py-co.de>  
  
# Prevent dpkg errors  
ENV TERM=xterm-256color  
  
COPY . /app
WORKDIR app/
RUN apt-get install python
  
# Set mocha test runner as entrypoint  
ENTRYPOINT ["mocha"]  