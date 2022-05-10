import os
from django.conf import settings
from django.urls import path, re_path, include, reverse_lazy
from django.conf.urls.static import static
from django.conf.urls import url
from django.contrib import admin
from django.views.generic.base import RedirectView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from src.users.urls import users_router
from src.api.urls import api_router, urlpatterns as api_urlpatterns

schema_view = get_schema_view(
    openapi.Info(title="Pastebin API", default_version='v1'),
    public=False,
)

router = DefaultRouter()

router.registry.extend(users_router.registry)
router.registry.extend(api_router.registry)

urlpatterns = []

if os.getenv('DJANGO_SETTINGS_MODULE', 'src.config.local') == 'src.config.local':
    from django.urls import include, path
    urlpatterns += [path('__debug__/', include('debug_toolbar.urls'))]

urlpatterns += [
    # admin panel
    path('admin/', admin.site.urls),

    # api
    path('api/v1/', include(router.urls + api_urlpatterns)),

    # auth
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # swagger docs
    url(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    url(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    url(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # the 'api-root' from django rest-frameworks default router
    re_path(r'^$', RedirectView.as_view(url=reverse_lazy('api-root'), permanent=False)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
