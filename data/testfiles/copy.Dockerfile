FROM ubuntu:trusty  

COPY . /app  
WORKDIR /app  
  
# Install application dependencies  
RUN apt-get install --no-install-recommends -y python=2