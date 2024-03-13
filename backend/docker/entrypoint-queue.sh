#!/bin/sh

# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: CC0-1.0

set -e

celery -A src.config worker --loglevel=debug --concurrency=4
