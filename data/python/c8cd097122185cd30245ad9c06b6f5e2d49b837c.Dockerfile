FROM ubuntu:18.04

WORKDIR /src/build

# have to set this else apt will ask for a config for tzdata
ARG DEBIAN_FRONTEND=noninteractive

# python3.8 is in universal
RUN echo 'deb-src http://archive.ubuntu.com/ubuntu/ bionic-updates universe' >> /etc/apt/sources.list

# need newer cmake for bolts llvm
RUN apt-get update
RUN apt-get install -y apt-transport-https ca-certificates gnupg software-properties-common wget
RUN wget -O - https://apt.kitware.com/keys/kitware-archive-latest.asc 2>/dev/null | gpg --dearmor - | tee /etc/apt/trusted.gpg.d/kitware.gpg >/dev/null
RUN add-apt-repository -y 'deb https://apt.kitware.com/ubuntu/ bionic main'

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y build-essential ninja-build git cmake clang libssl-dev libsqlite3-dev luajit python3.8 zlib1g-dev virtualenv libjpeg-dev linux-tools-common linux-tools-generic
RUN apt-get install -y dh-make dh-exec debhelper patchelf

# we have to set a local else it will use ascii
RUN apt-get install -y locales
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# we want to use gcc 9. Install it and make it the default
RUN apt install -y software-properties-common
RUN add-apt-repository ppa:ubuntu-toolchain-r/test
RUN apt-get install -y gcc-9 g++-9
RUN update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-9 50
RUN update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-9 50

# if we don't install this option packages our build will have way fewer functions
# e.g. no libreadline -> no repl history
RUN apt build-dep -y python3.8

# install dependencies for the test suite
RUN apt-get install -y libwebp-dev libjpeg-dev python3.8-gdbm python3.8-tk python3.8-dev tk-dev libgdbm-dev libgdbm-compat-dev liblzma-dev libbz2-dev nginx

# revert bolt patched llvm and make sure it gets build
RUN git config --global user.email "you@example.com"
RUN git config --global user.name "Your Name"

# copy over whole nitrous dir except of stuff excluded via .dockerignore
COPY . /src/build/

# run this to build the package
#RUN make package
