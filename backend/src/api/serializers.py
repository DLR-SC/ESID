# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: Apache-2.0

from .models import *
from rest_framework import serializers
import json


class DistributionSerializer(serializers.ModelSerializer):
    """
    JSON serializer for a distribution
    """
    class Meta:
        model = Distribution
        fields = ['min', 'max', 'value']


class InterventionSerializer(serializers.ModelSerializer):
    """
    JSON serializer for an intervention
    """
    start = serializers.DateField(source="start_date")
    end = serializers.DateField(source="end_date")

    class Meta:
        model = Intervention
        fields = ['restriction', 'start', 'end', 'contact_rate']


class ScenarioParameterGroupSerializer(serializers.ModelSerializer):
    group = serializers.SlugRelatedField(slug_field="name", read_only=True)
    
    class Meta:
        model = ScenarioParameterGroup
        fields = ['group', 'min', 'max']


class ScenarioParameterSerializer(serializers.ModelSerializer):
    parameter = serializers.SlugRelatedField(slug_field="name", read_only=True)
    groups = ScenarioParameterGroupSerializer(many=True)

    class Meta:
        model = ScenarioParameter
        fields = ['parameter', 'groups']

class ScenarioNodeSerializer(serializers.ModelSerializer):
    """
    JSON serializer for scenario data for a specific node
    """
    node = serializers.SlugRelatedField(slug_field="name", read_only=True)
    parameters = ScenarioParameterSerializer(many=True)
    
    class Meta:
        model = ScenarioNode
        fields = ['node', 'parameters']

class ScenarioSerializerMeta(serializers.HyperlinkedModelSerializer):
    """
    JSON serializer for scenario meta data
    """
    class Meta:
        model = Scenario
        fields = ['id', 'url', 'name', 'description', 'simulation_model', 'number_of_groups', 'number_of_nodes']

class ScenarioSerializerFull(serializers.ModelSerializer):
    """
    JSON serializer for all scenario data with all nodes
    """

    parameters = ScenarioParameterSerializer(many=True)
    nodes = serializers.SlugRelatedField(slug_field="name", read_only=True, many=True)

    class Meta:
        model = Scenario
        fields = ['name', 'description', 'simulation_model', 'number_of_groups', 'number_of_nodes', 'parameters', 'nodes']

class RestrictionSerializer(serializers.ModelSerializer):
    """
    JSON serializer for a restriction
    """
    class Meta:
        model = Restriction
        fields = ['name']


class NodeSerializer(serializers.ModelSerializer):
    """
    JSON serializer for a node
    """
    class Meta:
        model = Node
        fields = ['name', 'metadata']


class ParameterSerializer(serializers.ModelSerializer):
    """
    JSON serializer for a simulation model parameter
    """
    class Meta:
        model = Parameter
        fields = ['name']

class CompartmentsDataEntrySerializer(serializers.ModelSerializer):
    """
    JSON serializer for a simulation model parameter
    """
    class Meta:
        model = DataEntry
        fields = '__all__'

    def to_representation(self, instance):
        serialized = {}
        values = {}

        compartments = self.context.get('compartments', None)
        if compartments is not None:
            for compartment in compartments:
                values[compartment] = instance.data[compartment]
        else:
            values = {**instance.data}

        serialized['compartments'] = values

        if self.context.get('day', None) is None:
            serialized['day'] = instance.day

        if self.context.get('group', None) is None:
            serialized['group'] = instance.group.name

        # serialized['percentile'] = instance.percentile

        return serialized


class SimulationModelSerializerMeta(serializers.ModelSerializer):
    """
    JSON serializer for a simulation model meta data
    """
    class Meta:
        model = SimulationModel
        fields = ['key', 'name']

class SimulationModelSerializerFull(serializers.ModelSerializer):
    """
    JSON serializer for all simulation model data
    """
    parameters = serializers.SlugRelatedField(slug_field='name', read_only=True, many=True)
    compartments = serializers.SlugRelatedField(slug_field='name', read_only=True, many=True)

    class Meta:
        model = SimulationModel
        fields = ['key', 'name', 'description', 'parameters', 'compartments']

class SimulationSerializerMeta(serializers.HyperlinkedModelSerializer):
    """
    JSON serializer simulation meta data
    """

    percentiles = serializers.SerializerMethodField('get_percentiles')

    class Meta:
        model = Simulation
        fields = ['id', 'name', 'description', 'start_day', 'number_of_days', 'scenario', 'percentiles']


    def get_percentiles(self, simulation):
        entries = list(simulation.nodes.first().data.all().distinct("percentile"))
        return [entry.percentile for entry in entries]

class SimulationNodeSerializer(serializers.ModelSerializer):
    """
    JSON serializer for a simulation model parameter
    """

    compartments = serializers.SerializerMethodField('get_compartments')

    class Meta:
        model = SimulationNode
        fields = ['name', 'compartments']

    def get_compartments(self, node):
        queryset = node.data.all()
        many = True

        percentile = self.context.get('percentile', 50)

        queryset = queryset.filter(percentile=percentile)

        if 'group' in self.context:
            queryset = queryset.filter(group__name=self.context['group'])

        if 'day' in self.context:
            queryset = queryset.filter(day=self.context['day']).first()
            many = False
        
        serialized = CompartmentsDataEntrySerializer(instance=queryset, context=self.context, many=many)

        return serialized.data['compartments']

class SimulationDataCompartmentsSerializer(serializers.BaseSerializer):

    def to_representation(self, data):
        compartments = self.context.get('compartments', None)

        serialized = {}
        if compartments is not None and isinstance(compartments, list):
            for compartment in compartments:
                serialized[compartment] = data[compartment]
        else:
            serialized = {**data}

        return serialized

class SimulationDataSerializer(serializers.ModelSerializer):
    """
    JSON serializer for a simulation model parameter
    """

    name = serializers.CharField(source="node_name")
    compartments = serializers.SerializerMethodField('get_compartments')

    class Meta:
        model = SimulationData
        fields = ['name', 'day', 'compartments']

    def get_compartments(self, instance):
        return SimulationDataCompartmentsSerializer(instance=instance.data, context=self.context).data


class DataByDaySerializer(serializers.BaseSerializer):

    def to_representation(self, rows):
        repr = []

        for row in rows:
            print(row)
            repr.append({
                'name': row[0],
                'compartments': json.loads(row[1])
            })

        return repr


class RkiNodeSerializer(serializers.ModelSerializer):
    """
    JSON serializer for a simulation model parameter
    """

    class Meta:
        model = RKINode
        fields = ['name']

    def __init__(self, *args, **kwargs):
        super(RkiNodeSerializer, self).__init__(*args, **kwargs)

    def to_representation(self, node):
        
        queryset = node.data.all()
        many = True

        if self.context.get('group', None) is not None:
            queryset = queryset.filter(group__name=self.context['group'])

        if self.context.get('day', None) is not None:
            queryset = queryset.filter(day=self.context['day']).first()
            many = False
        
        serialized = CompartmentsDataEntrySerializer(instance=queryset, context=self.context, many=many)

        return {'node': node.name, **serialized.data}


class GroupCategorySerializer(serializers.ModelSerializer):
    """
    JSON serializer for a category of groups
    """
    class Meta:
        model = GroupCategory
        fields = ["key", "name", "description"]


class GroupSerializer(serializers.ModelSerializer):
    """
    JSON serializer for a group
    """
    class Meta:
        model = Group
        fields = ["key", "name", "description", "category"]