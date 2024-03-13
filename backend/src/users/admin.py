# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: Apache-2.0

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

from src.users.models import User


@admin.register(User)
class UserAdmin(UserAdmin):
    fieldsets = ((None, {
        'fields': ('username', 'password')
    }), (_('Personal info'), {
        'fields': (
            'first_name',
            'last_name',
            'email',
        )
    }), (_('Permissions'), {
        'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
    }), (_('Important dates'), {
        'fields': ('last_login', 'date_joined')
    }))
