<!--
SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
SPDX-License-Identifier: CC-BY-4.0
-->

# ESID - Backend Developer Documentation


## Highlights

- Python 3.8+

- Django 3.1+

- Fully dockerized, local development via docker-compose.

- PostgreSQL

- Full test coverage, continuous integration, and continuous deployment.


### Features built-in

- JSON Web Token authentication using [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/en/latest/)

- API Throttling enabled

- Swagger API docs out-of-the-box

- CodeLinter (flake8) and CodeFormatter (yapf)

- Tests (with mocking and factories) with code-coverage support


## API Docs

API documentation is automatically generated using Swagger. You can view documention by visiting this [http://localhost:8000/swagger](http://localhost:8000/swagger).


## Prerequisites

If you are familiar with Docker, you just need [Docker](https://docs.docker.com/desktop/). If you don't want to use Docker, you need Python3 and Postgres installed.


## Local Development

First you need to create an '.env' file. The easiest way is to copy the template file and adapt the values.

```bash
cp .env.template .env
```

### Development with Docker

To develop with Docker we use Docker-Compose to create and spawn all necessary services. 
It is however necessary to create the following three docker volumes in advance:
- postgres-data
- django-data
- pgadmin-data

\
To start the development setup run:

```bash
USER_ID=$(id -u) GROUP_ID=$(id -g) docker-compose -f docker-compose.dev.yml up -d
```
\
This creates following services:

- db: PostgreSQL database

- backend: Django server reachable under the specified **SITE_URL** in the .env-file (default [http://localhost:8000/](http://localhost:8000/))

- pgadmin: Postgres admin interface reachable under [http://localhost:5050/](http://localhost:5050/).
	- Default user: 'admin@admin.com"
	- Default password: 'root'
		These can be changed inside the .env file

To run a command inside the docker container use:
```bash
USER_ID=$(id -u) GROUP_ID=$(id -g) docker-compose -f docker-compose.dev.yml run --rm [service] [command]

example:
USER_ID=$(id -u) GROUP_ID=$(id -g) docker-compose -f docker-compose.dev.yml run --rm backend python migrate.py makemigrations
```


### Development without Docker  

#### Install

We encourage you to create a new python environment.

```bash
python3 -m venv env && source env/bin/activate
```

or if you use Anaconda / Miniconda

```bash
conda create -n esid python=3.8 && conda activate esid
```

Install all requirements with

```bash
pip install -r requirements/dev.txt
```


#### Run dev server

This will run server on [http://localhost:8000](http://localhost:8000)

```bash
python manage.py runserver
```


### Setup database

You need a working PostgreSQL database. Update the database configuration inside '.env' to match your PostgreSQL installation.

Then execute following commands:

1. To setup django database tables. This will also fill the database with initial data
    ```bash
    python manage.py migrate
    ```
2. To setup a django admin account
    ```bash
    python manage.py createsuperuser
    ```

or using docker

```bash
USER_ID=$(id -u) GROUP_ID=$(id -g) docker-compose -f docker-compose.dev.yml run --rm backend python manage.py migrate
USER_ID=$(id -u) GROUP_ID=$(id -g) docker-compose -f docker-compose.dev.yml run --rm backend python manage.py createsuperuser
```


### RKI data

To import the RKI data, run

```bash
python manage.py import_rki <path to folder or zip>
```

or

```bash
USER_ID=$(id -u) GROUP_ID=$(id -g) docker-compose -f docker-compose.dev.yml run --rm backend python manage.py import_rki <path to folder or zip>
```

### Running Tests

To run all tests with code-coverate report, simply run:

```bash
python manage.py test
```

or

```bash
USER_ID=$(id -u) GROUP_ID=$(id -g) docker-compose -f docker-compose.dev.yml run --rm backend python manage.py test
```

## Endpoints

Following endpoints are available:

### Django admin panel
- [http://localhost:8000/admin/](http://localhost:8000/admin/)

### Api
- [http://localhost:8000/api/v1/](http://localhost:8000/api/v1/)

### Authentication
- [http://localhost:8000/api-auth/](http://localhost:8000/api-auth/)
- [http://localhost:8000/api/v1/token/](http://localhost:8000/api/v1/token/)
- [http://localhost:8000/api/v1/token/refresh/](http://localhost:8000/api/v1/token/refresh/)

### Documentation
- [http://localhost:8000/swagger/](http://localhost:8000/swagger/)
- [http://localhost:8000/redoc/](http://localhost:8000/redoc/)
