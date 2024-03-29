FROM maven:3.8.3-openjdk-11-slim AS builder
WORKDIR /app
COPY . /app
ARG mvn_arg="clean package -DskipTests"

RUN target=/root/.m2 mvn -f /app/pom.xml $mvn_arg

FROM openjdk:11-jre-slim

# Override the docker maven jar with user supplied one, else default to docker-maven's one.
ARG JAR_FILE=/app/target/booksapi*.jar
ARG PROFILE
ENV profile_env ${PROFILE}

ARG DB_HOSTNAME
ENV db_hostname_env ${DB_HOSTNAME}
ARG DB_PORT
ENV db_port_env ${DB_PORT}
ARG DB_NAME
ENV db_name_env ${DB_NAME}
ARG DB_USERNAME
ENV db_username_env ${DB_USERNAME}
ARG DB_PASSWORD
ENV db_password_env ${DB_PASSWORD}

# COPY ${JAR_PATH} app.jar
WORKDIR /opt/booksapi/

COPY --from=builder $JAR_FILE app.jar
ARG UID=1001
ARG GID=1001
RUN groupadd --gid $GID booksapiuser
RUN useradd --system --create-home --shell /usr/sbin/nologin --uid $UID --gid $GID booksapiuser
USER booksapiuser
EXPOSE 8082

CMD ["java", "-jar", "-Dspring.profiles.active=${profile_env}", "-Dspring.datasource.url=jdbc:postgresql://${db_hostname_env}:${db_port_env}/${db_name_env}", "-Dspring.datasource.username=${db_username_env}", "-Dspring.datasource.password=${db_password_env}", "app.jar"]
