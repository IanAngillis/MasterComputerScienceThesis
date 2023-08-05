FROM ubuntu:trusty  

COPY . /app  
WORKDIR /app  
  
# Install application dependencies  
RUN npm install