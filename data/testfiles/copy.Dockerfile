FROM ubuntu:trusty  
MAINTAINER Tom <tom@py-co.de>  
  
# Prevent dpkg errors  
ENV TERM=xterm-256color  
  
# Install node.js  
RUN apt-get update && \  
apt-get install curl -y && \  
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash - && \  
apt-get install -y nodejs  
  
COPY . /app  
WORKDIR /app  
  
# Install application dependencies  
RUN npm install -g mocha && \  
npm install  


COPY . /app
WORKDIR app/
RUN python3 pip3 install --upgrade pip
RUN python3 pip3 install -r requirements.txt
RUN python3 pip3 install notebook
  
# Set mocha test runner as entrypoint  
ENTRYPOINT ["mocha"]  