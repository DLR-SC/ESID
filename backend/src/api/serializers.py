from .models import *
from rest_framework import serializers
from datetime import datetime


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

class DataEntrySerializer(serializers.ModelSerializer):
    """
    JSON serializer for a simulation model parameter
    """
    class Meta:
        model = DataEntry
        fields = '__all__'

    def to_representation(self, instance):
        serialized = {}
        
        compartments = self.context.get('compartments', None)
        if compartments is not None:
            for compartment in compartments:
                serialized[compartment] = instance.data[compartment]
        else:
            serialized = {**instance.data}

        if self.context.get('day', None) is None:
            serialized['day'] = instance.day

        if self.context.get('group', None) is None:
            serialized['group'] = instance.group.name

        return serialized


class SimulationModelSerializerMeta(serializers.HyperlinkedModelSerializer):
    """
    JSON serializer for a simulation model meta data
    """
    class Meta:
        model = SimulationModel
        fields = ['url', 'name']

class SimulationModelSerializerFull(serializers.ModelSerializer):
    """
    JSON serializer for all simulation model data
    """
    parameters = serializers.SlugRelatedField(slug_field='name', read_only=True, many=True)
    compartments = serializers.SlugRelatedField(slug_field='name', read_only=True, many=True)

    class Meta:
        model = SimulationModel
        fields = ['name', 'description', 'parameters', 'compartments']

class SimulationSerializerMeta(serializers.HyperlinkedModelSerializer):
    """
    JSON serializer simulation meta data
    """

    class Meta:
        model = Simulation
        fields = ['id', 'name', 'description', 'start_day', 'number_of_days', 'scenario']

class SimulationNodeSerializer(serializers.ModelSerializer):
    """
    JSON serializer for a simulation model parameter
    """

    values = serializers.SerializerMethodField('get_values')

    class Meta:
        model = SimulationNode
        fields = ['name', 'values']

    def get_values(self, node):
        queryset = node.data.all()
        many = True

        if 'group' in self.context:
            queryset = queryset.filter(group__name=self.context['group'])

        if 'day' in self.context:
            queryset = queryset.filter(day=self.context['day']).first()
            many = False
        
        serialized = DataEntrySerializer(instance=queryset, context=self.context, many=many)
        return serialized.data


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
        
        serialized = DataEntrySerializer(instance=queryset, context=self.context, many=many)

        if not many:
            return {'node': node.name, 'compartments': serialized.data}
        else:
            return {'node': node.name, 'data': serialized.data}
