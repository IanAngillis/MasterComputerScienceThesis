# Base image
FROM ubuntu:latest

# Update apt-get and install packages
RUN apt-get update && apt-get install -y \
    nginx \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Expose ports
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
