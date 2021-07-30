
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

API documentation is automatically generated using Swagger. You can view documention by visiting this [link](http://localhost:8000/swagger).


## Prerequisites

If you are familiar with Docker, then you just need [Docker](https://docs.docker.com/docker-for-mac/install/). If you don't want to use Docker, then you just need Python3 and Postgres installed.


## Local Development

First you need to create an '.env' file. The easiest way is to copy the template file.

```bash
cp .env.dist .env
```

### Development with Docker

To develop with Docker we use Docker-Compose to create and spawn all necessary services.
To start all services use:

```bash
docker-compose up -d
```

This creates following services:

- db: PostgreSQL database

- web: Django server reachable under [http://localhost:8000/](http://localhost:8001/)

- pgadmin: Postgres admin interface reachable under [http://localhost:5050/](http://localhost:5050/).
	- Default user: 'admin@admin.com"
	- Default password: 'root'
		These can be changed inside the .env file

To run a command inside the docker container use:
```bash
docker-compose run --rm [service] [command]

example:
docker-compose run --rm web python migrate.py makemigrations
```


### Development without Docker  

#### Install

We encourage you to create a new python environment.

```bash
python3 -m venv env && source env/bin/activate # create and activate local environment
```

or if you use Anaconda / Miniconda

```bash
conad create -n esid python=3.8 && conda activate esid # activate venv
```

Install all requirements with

```bash
pip install -r requirements/dev.txt # install requirements
```


#### Run dev server

This will run server on [http://localhost:8000](http://localhost:8000)

```bash
python manage.py runserver
```


### Setup database

You need a working PostgreSQL database. Update the database configuration inside '.env' to match your postgresql installation.

Then execute following commands:

```bash
python manage.py migrate 	 # setup django database tables
				 # this will also fill the database with initial data
python manage.py createsuperuser # setup an django admin account
```

or using docker

```bash
docker-compose run --rm web python manage.py migrate
docker-compose run --rm web python manage.py createsuperuser
```


### RKI data

To import the RKI data run

```bash
python manage.py loadrki
```

or

```bash
docker-compose run --rm web python manage.py loadrki
```

### Running Tests

To run all tests with code-coverate report, simple run:

```bash
python manage.py test
```

or

```bash
docker-compose run --rm web python manage.py test
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