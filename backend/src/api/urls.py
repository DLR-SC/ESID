# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: Apache-2.0

from rest_framework.routers import SimpleRouter
from django.conf.urls import url
from src.api import views

api_router = SimpleRouter()

api_router.register(r'groupcategories', views.GroupCategoriesViewSet, basename='groupcategory')
api_router.register(r'groups', views.GroupsViewSet, basename='group')
api_router.register(r'restrictions', views.RestrictionsViewSet, basename='restriction')
api_router.register(r'scenarios', views.ScenarioViewSet, basename='scenario')
api_router.register(r'simulationmodels', views.SimulationModelViewSet, basename='simulationmodel')
api_router.register(r'nodes', views.NodesViewSet, basename="node")
api_router.register(r'simulations', views.SimulationsViewSet, basename="simulation")


urlpatterns = [
    url(r'simulation/(?P<id>\d+)/(?P<nodeId>\d+)/$', views.SimulationDataByNodeView.as_view()),
    url(r'simulation/(?P<id>\d+)/(?P<day>\d{4}-\d{2}-\d{2})/$', views.SimulationDataByDayView.as_view()),
    url(r'rki/(?P<nodeId>\d+)/$', views.RkiDataByNodeView.as_view()),
    url(r'rki/(?P<day>\d{4}-\d{2}-\d{2})/$', views.RkiDataByDayView.as_view()),
]