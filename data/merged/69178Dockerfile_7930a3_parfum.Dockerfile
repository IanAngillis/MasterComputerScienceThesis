FROM centos:7
LABEL maintainer "Takuya Takeuchi <takuya.takeuchi.dev@gmail.com>"

# install package to build
RUN yum update -y && yum install -y \
    ca-certificates
RUN yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
RUN yum update -y && yum install -y \
    libX11-devel \
 && yum clean all