FROM alpine:3.10

ARG VERSION=2.12.1
ARG ARCHIVE_NAME=scala-${VERSION}
ARG URL=http://downloads.lightbend.com/scala/${VERSION}/${ARCHIVE_NAME}.tgz
RUN wget ${URL}


