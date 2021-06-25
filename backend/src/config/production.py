import os
from .common import * # noqa


# Site
# https://docs.djangoproject.com/en/2.0/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ["*"]
INSTALLED_APPS += ("gunicorn", "storages",) # noqa

