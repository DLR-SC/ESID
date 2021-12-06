from .models import Distribution, Intervention, Node, Parameter, Restriction, Scenario, ScenarioNode, ScenarioParameter, ScenarioParameterGroup, SimulationModel, RKIEntry
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

class RKICountyEntrySerializer(serializers.ModelSerializer):
    """
    Rki data json serializer for one county
    """
    infectious = serializers.IntegerField()
    deaths = serializers.IntegerField()
    recovered = serializers.IntegerField()
    date = serializers.DateField(source="refdatum")

    class Meta:
        model = RKIEntry
        fields = ['date', 'infectious', 'deaths', 'recovered']

    def to_representation(self, instance):
        representation = super(RKICountyEntrySerializer, self).to_representation(instance)
        representation['timestamp'] = int(datetime.combine(instance.refdatum, datetime.min.time()).timestamp() * 1000)

        return representation

class RKIDayEntrySerializer(serializers.ModelSerializer):
    """
    Rki data json serializer for one day
    """
    infectious = serializers.IntegerField()
    deaths = serializers.IntegerField()
    recovered = serializers.IntegerField()
    county = serializers.CharField(source="id_landkreis")

    class Meta:
        model = RKIEntry
        fields = ['county', 'infectious', 'deaths', 'recovered']

class RKICountySerializer(serializers.Serializer):
    """
    Rki data json serializer for one day for all counties
    """
    county = serializers.CharField()
    count = serializers.IntegerField()
    data = RKICountyEntrySerializer(many=True)

class RKIDaySerializer(serializers.Serializer):
    """
    Rki data json serializer for all days for one county
    """
    day = serializers.DateField()
    count = serializers.IntegerField()
    data = RKIDayEntrySerializer(many=True)