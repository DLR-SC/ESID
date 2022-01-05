from src.config.common import *  # noqa

# Testing
INSTALLED_APPS += (
    'django_nose', # noqa
    'django_extensions',  # for generation db diagrams
)  
TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'
NOSE_ARGS = ['-s', '--nologcapture', '--with-progressive', '--with-fixture-bundling']
