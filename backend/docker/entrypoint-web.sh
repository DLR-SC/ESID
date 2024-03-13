#!/bin/sh

# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: CC0-1.0

set -e

gunicorn --bind 0.0.0.0:8000 -w 4 --limit-request-line 6094 --access-logfile - src.wsgi:application
