from rest_framework.routers import SimpleRouter

from src.api import views

api_router = SimpleRouter()

api_router.register(r'restrictions', views.RestrictionsViewSet, basename='restriction')
api_router.register(r'scenarios', views.ScenarioViewSet, basename='scenario')
api_router.register(r'simulationmodels', views.SimulationModelViewSet, basename='simulationmodel')
api_router.register(r'nodes', views.NodesViewSet, basename="node")
api_router.register(r'rki/county', views.RKIByCountyViewSet, basename="rki-by-county")
api_router.register(r'rki/day', views.RKIByDayViewSet, basename="rki-by-day")
