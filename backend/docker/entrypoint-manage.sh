#!/bin/bash

# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: CC0-1.0

set -e

./manage.py migrate
./manage.py collectstatic --noinput

exec tail -f /dev/null
