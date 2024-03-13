# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: CC0-1.0

FROM python:3.8

ARG REQUIREMENTS_FILE

WORKDIR /app
EXPOSE 80
ENV PYTHONUNBUFFERED 1

RUN set -x && \
	apt-get update && \
	apt -f install	&& \
	apt-get -qy install netcat-traditional && \
	rm -rf /var/lib/apt/lists/* && \
	wget -O /wait-for https://raw.githubusercontent.com/eficode/wait-for/master/wait-for && \
	chmod +x /wait-for

CMD ["sh", "/entrypoint-startup.sh"]
COPY ./docker/entrypoint-startup.sh /

COPY ./.env ./.env
COPY ./requirements ./requirements

RUN pip install numpy scipy pandas tqdm
RUN pip install -r ./requirements/${REQUIREMENTS_FILE}

COPY ./src ./src
COPY ./manage.py ./manage.py

