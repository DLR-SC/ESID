# Create your views here.
from rest_framework.response import Response
from .serializers import MeasureSerializer, RestrictionSerializer, ScenarioSerializerFull, ScenarioSerializerMeta
from .models import Measure, Restriction, Scenario
from rest_framework import viewsets, permissions, mixins


class ScenarioViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin , viewsets.GenericViewSet):
    queryset = Scenario.objects.all().order_by('id')
    permission_classes = [permissions.IsAuthenticated]

    serializers = {'list': ScenarioSerializerMeta, 'retrieve': ScenarioSerializerFull}

    def get_serializer_class(self):
        return self.serializers.get(self.action, ScenarioSerializerMeta)


class MeasuresViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Measure.objects.all().order_by('start_date')
    serializer_class = MeasureSerializer
    permission_classes = [permissions.IsAuthenticated]


class RestrictionsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Restriction.objects.all().order_by('name')
    serializer_class = RestrictionSerializer
    permission_classes = [permissions.IsAuthenticated]
