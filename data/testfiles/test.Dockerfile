FROM alpine:3.10

ENV MY_NAME="John Doe"
ENV MY_COUNTRY="BELGIUM"
ENV MY_VAR my-value

ARG VERSION=2.12.1
ARG ARCHIVE_NAME=scala-${VERSION}
ARG URL=http://downloads.lightbend.com/scala/${VERSION}/${ARCHIVE_NAME}.tgz
RUN wget ${URL}


