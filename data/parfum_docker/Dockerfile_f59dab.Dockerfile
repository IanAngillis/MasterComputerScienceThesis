FROM debian:bullseye

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update

RUN apt install -y libglbinding2
RUN apt install -y libglbinding-dev
