from rest_framework.routers import SimpleRouter
from django.conf.urls import url
from src.api import views

api_router = SimpleRouter()

api_router.register(r'restrictions', views.RestrictionsViewSet, basename='restriction')
api_router.register(r'scenarios', views.ScenarioViewSet, basename='scenario')
api_router.register(r'simulationmodels', views.SimulationModelViewSet, basename='simulationmodel')
api_router.register(r'nodes', views.NodesViewSet, basename="node")
api_router.register(r'simulations', views.SimulationsViewSet, basename="simulation")
# api_router.register(r'rki/county', views.RKIByCountyViewSet, basename="rki-by-county")
# api_router.register(r'rki/day', views.RKIByDayViewSet, basename="rki-by-day")

urlpatterns = [
    url(r'simulation/(?P<id>\d+)/(?P<nodeId>\d+)/(?P<group>[\w.@+-]+)/$', views.SimulationDataByNodeView.as_view()),
    url(r'simulation/(?P<id>\d+)/(?P<day>\d{4}-\d{2}-\d{2})/(?P<group>[\w.@+-]+)/$', views.SimulationDataByDayView.as_view()),
    url(r'rki/(?P<nodeId>\d+)/(?P<group>[\w.@+-]+)/$', views.RkiDataByNodeView.as_view()),
    url(r'rki/(?P<day>\d{4}-\d{2}-\d{2})/(?P<group>[\w.@+-]+)/$', views.RkiDataByDayView.as_view()),
]