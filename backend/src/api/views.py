# Create your views here.

from rest_framework import viewsets, permissions, mixins, generics

from .models import *
from .classes import DataEntryFilterMixin


import src.api.serializers as serializers

class RestrictionsViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Return a list of all available restrictions.
    """
    queryset = Restriction.objects.all().order_by('name')
    serializer_class = serializers.RestrictionSerializer
    permission_classes = [permissions.AllowAny]


class NodesViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Return a list of all available nodes (e.g. counties)
    """
    queryset = Node.objects.all().order_by('id')
    serializer_class = serializers.NodeSerializer
    permission_classes = [permissions.AllowAny]


class ScenarioViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    retrieve:
    Return all information for the given scenario.

    list:
    Return a list of all available scenarios.
    """
    queryset = Scenario.objects.all().order_by('id')
    permission_classes = [permissions.AllowAny]

    serializers_ = {'list': serializers.ScenarioSerializerMeta, 'retrieve': serializers.ScenarioSerializerFull}

    def get_serializer_class(self):
        return self.serializers_.get(self.action, serializers.ScenarioSerializerMeta)


class SimulationsViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    list:
    Return a list of all available simulations.
    """
    queryset = Simulation.objects.all().order_by('id')
    serializer_class = serializers.SimulationSerializerMeta
    permission_classes = [permissions.AllowAny]


class SimulationModelViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    retrieve:
    Return all information for the given simulation model.

    list:
    Return a list of all available simulation models.
    """
    queryset = SimulationModel.objects.all().order_by('name')
    lookup_field = 'key'

    permission_classes = [permissions.AllowAny]
    serializers_ = {'list': serializers.SimulationModelSerializerMeta, 'retrieve': serializers.SimulationModelSerializerFull}

    def get_serializer_class(self):
        return self.serializers_.get(self.action, serializers.SimulationModelSerializerMeta)


class SimulationDataByNodeView(DataEntryFilterMixin, generics.ListAPIView):
    
    serializer_class = serializers.CompartmentsDataEntrySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        simulationId = self.kwargs.get('id')
        nodeId = self.kwargs.get('nodeId')

        print(simulationId, nodeId)

        simulation = Simulation.objects.get(id=simulationId)
        node = simulation.nodes.get(scenario_node__node__name=nodeId)
        
        return self.get_filtered_queryset(node.data).order_by('day')

class RkiDataByNodeView(DataEntryFilterMixin, generics.ListAPIView):
    
    serializer_class = serializers.CompartmentsDataEntrySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        nodeId = self.kwargs.get('nodeId')
        node = RKINode.objects.get(node__name=nodeId)

        return self.get_filtered_queryset(node.data).order_by('day')

class SimulationDataByDayView(DataEntryFilterMixin, generics.ListAPIView):
    serializer_class = serializers.SimulationDataSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        simulationId = self.kwargs.get('id')
        nodes = SimulationNode.objects.filter(simulation=simulationId)
        
        return self.get_filtered_queryset(SimulationData.objects.filter(simulationnode_id__in=nodes))

    def paginate_queryset(self, queryset):
        if 'all' in self.request.query_params:
            return None

        return super().paginate_queryset(queryset)

class RkiDataByDayView(DataEntryFilterMixin, generics.ListAPIView):

    serializer_class = serializers.SimulationDataSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return self.get_filtered_queryset(RKIData.objects.all())

    def paginate_queryset(self, queryset):
        if 'all' in self.request.query_params:
            return None

        return super().paginate_queryset(queryset)