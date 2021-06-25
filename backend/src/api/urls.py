from rest_framework.routers import SimpleRouter

from src.api import views

api_router = SimpleRouter()

api_router.register(r'restrictions', views.RestrictionsViewSet, basename='restriction')
api_router.register(r'measures', views.MeasuresViewSet, basename='measure')
api_router.register(r'scenarios', views.ScenarioViewSet, basename='scenario')
