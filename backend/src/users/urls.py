# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: Apache-2.0

from rest_framework.routers import SimpleRouter

from src.users.views import UserViewSet

users_router = SimpleRouter()

users_router.register(r'users', UserViewSet)
