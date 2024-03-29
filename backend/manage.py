#!/usr/bin/env python

# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: CC0-1.0

import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "src.config.local")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?") from exc
        raise
    execute_from_command_line(sys.argv)
