# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: Apache-2.0

from src.config.common import *  # noqa

# Testing
INSTALLED_APPS += (
    'django_nose', # noqa
    'django_extensions',  # for generation db diagrams
    'debug_toolbar',
)

if os.getenv('DJANGO_DEBUG', False):
    import socket  # only if you haven't already imported this
    hostname, _, ips = socket.gethostbyname_ex(socket.gethostname())
    INTERNAL_IPS = [ip[:-1] + '1' for ip in ips] + ['127.0.0.1', '10.0.2.2']


MIDDLEWARE += (
    "debug_toolbar.middleware.DebugToolbarMiddleware",
)

TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'
NOSE_ARGS = ['-s', '--nologcapture', '--with-progressive', '--with-fixture-bundling']
