ARG ANKISYNCD_ROOT=/opt/ankisyncd
ARG PYTHONUSERBASE=/opt/venv

# -- BUILDER --
FROM library/python:3.9-buster as builder

ARG ANKISYNCD_ROOT
WORKDIR ${ANKISYNCD_ROOT}

COPY bin/download-release.sh ./bin/download-release.sh

ARG PYTHONUSERBASE
RUN sh ./bin/download-release.sh && \
	pip3 install --upgrade pip && \
    pip3 install --user -r ./release/requirements.txt

# -- DEPLOYER --
FROM python:3.9-slim-buster

# Copy Python dependencies
ARG PYTHONUSERBASE
ENV PYTHONUSERBASE=${PYTHONUSERBASE}
COPY --from=builder ${PYTHONUSERBASE} ${PYTHONUSERBASE}

# Copy Anki Sync Server release and scripts
ARG ANKISYNCD_ROOT
COPY --from=builder ${ANKISYNCD_ROOT}/release ${ANKISYNCD_ROOT}
WORKDIR ${ANKISYNCD_ROOT}

# Create data volume.
ARG ANKISYNCD_DATA_ROOT=/srv/ankisyncd
VOLUME ${ANKISYNCD_DATA_ROOT}

# Set default environment variables.
ARG ANKISYNCD_PORT=27701
ARG ANKISYNCD_BASE_URL=/sync/
ARG ANKISYNCD_BASE_MEDIA_URL=/msync/
ARG ANKISYNCD_AUTH_DB_PATH=./auth.db
ARG ANKISYNCD_SESSION_DB_PATH=./session.db

ENV ANKISYNCD_HOST=0.0.0.0 \
	ANKISYNCD_PORT=${ANKISYNCD_PORT} \
	ANKISYNCD_DATA_ROOT=${ANKISYNCD_DATA_ROOT} \
	ANKISYNCD_BASE_URL=${ANKISYNCD_BASE_URL} \
	ANKISYNCD_BASE_MEDIA_URL=${ANKISYNCD_BASE_MEDIA_URL} \
	ANKISYNCD_AUTH_DB_PATH=${ANKISYNCD_AUTH_DB_PATH} \
	ANKISYNCD_SESSION_DB_PATH=${ANKISYNCD_SESSION_DB_PATH}

COPY bin/entrypoint.sh ./bin/entrypoint.sh

EXPOSE ${ANKISYNCD_PORT}

# TODO: Change to ENTRYPOINT. Currently CMD to allow shell access if needed.
CMD ["/bin/sh", "./bin/entrypoint.sh"]

HEALTHCHECK --interval=60s --timeout=3s CMD python -c "import requests; requests.get('http://127.0.0.1:${ANKISYNCD_PORT}/')"
