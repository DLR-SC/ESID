# Create your views here.
from rest_framework.response import Response
from .serializers import InterventionSerializer, NodeSerializer, RestrictionSerializer, ScenarioSerializerFull, ScenarioSerializerMeta, SimulationModelSerializerFull, SimulationModelSerializerMeta
from .models import Intervention, Node, Restriction, Scenario, SimulationModel
from rest_framework import viewsets, permissions, mixins

class RestrictionsViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Restriction.objects.all().order_by('name')
    serializer_class = RestrictionSerializer
    permission_classes = [permissions.IsAuthenticated]

class NodesViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Node.objects.all().order_by('id')
    serializer_class = NodeSerializer
    permission_classes = [permissions.IsAuthenticated]

class ScenarioViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Scenario.objects.all().order_by('id')
    permission_classes = [permissions.IsAuthenticated]

    serializers = {'list': ScenarioSerializerMeta, 'retrieve': ScenarioSerializerFull}

    def get_serializer_class(self):
        return self.serializers.get(self.action, ScenarioSerializerMeta)


class SimulationModelViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = SimulationModel.objects.all().order_by('name')
    permission_classes = [permissions.IsAuthenticated]

    serializers = {'list': SimulationModelSerializerMeta, 'retrieve': SimulationModelSerializerFull}

    def get_serializer_class(self):
        return self.serializers.get(self.action, ScenarioSerializerMeta)
