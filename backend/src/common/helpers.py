# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: Apache-2.0

from django.conf import settings

def build_absolute_uri(path):
    return f'{settings.SITE_URL}{path}'
