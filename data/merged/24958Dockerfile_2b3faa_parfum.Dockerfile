FROM golang:1.13-alpine as builder

ENV GO111MODULE=on

RUN apk add git

ADD . /go/src/github.com/linkpoolio/bridges
RUN cd /go/src/github.com/linkpoolio/bridges/examples/apiaggregator && \
    go get && \
    go build -o apiaggregator

# Copy into a second stage container
FROM alpine:latest

RUN apk add --no-cache ca-certificates
COPY --from=builder /go/src/github.com/linkpoolio/bridges/examples/apiaggregator/apiaggregator /usr/local/bin/

ENTRYPOINT ["apiaggregator"]