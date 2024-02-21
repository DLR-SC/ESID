# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: Apache-2.0

# Create your views here.
from rest_framework import viewsets, permissions, mixins, generics

from django.db.models import Q

from src.api.models import *
from src.api.classes import DataEntryFilterMixin

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


class SimulationDataByNodeView(DataEntryFilterMixin, generics.GenericAPIView):
    
    serializer_class = serializers.SimulationDataSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        simulationId = self.kwargs.get('id')
        nodeId = self.kwargs.get('nodeId')

        simulation = Simulation.objects.get(id=simulationId)
        node = simulation.nodes.get(scenario_node__node__name=nodeId)

        return self.get_filtered_queryset(SimulationData.objects.filter(simulationnode_id=node)).order_by('day')

    def get(self, request, id, nodeId, format=None):
        return self.aggregateBy("day")

    def post(self, request, id, nodeId, format=None):
        return self.aggregateBy("day")


class RkiDataByNodeView(DataEntryFilterMixin, generics.GenericAPIView):
    
    serializer_class = serializers.SimulationDataSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        nodeId = self.kwargs.get('nodeId')
        node = RKINode.objects.get(node__name=nodeId)

        return self.get_filtered_queryset(RKIData.objects.filter(rkinode_id=node)).order_by('day')

    def get(self, request, nodeId, format=None):
        return self.aggregateBy('day')

    def post(self, request, nodeId, format=None):
        return self.aggregateBy('day')


class SimulationDataByDayView(DataEntryFilterMixin, generics.GenericAPIView):
    serializer_class = serializers.SimulationDataSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        simulationId = self.kwargs.get('id')
        nodes = SimulationNode.objects.filter(simulation=simulationId)
        
        return self.get_filtered_queryset(SimulationData.objects.filter(simulationnode_id__in=nodes))

    def get(self, request, id, day, format=None):
        return self.aggregateBy('name')

    def post(self, request, id, day, format=None):
        return self.aggregateBy('name')


class RkiDataByDayView(DataEntryFilterMixin, generics.GenericAPIView):

    serializer_class = serializers.SimulationDataSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return self.get_filtered_queryset(RKIData.objects.all())

    def get(self, request, day, format=None):
        return self.aggregateBy('name')

    def post(self, request, day, format=None):
        return self.aggregateBy('name')


class GroupCategoriesViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Return a list of all available group categories.
    """
    queryset = GroupCategory.objects.all().order_by('name')
    serializer_class = serializers.GroupCategorySerializer
    permission_classes = [permissions.AllowAny]

class GroupsViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Return a list of all available groups.
    """
    queryset = Group.objects.all().order_by('name')
    serializer_class = serializers.GroupSerializer
    permission_classes = [permissions.AllowAny]