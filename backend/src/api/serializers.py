from .models import Distribution, Intervention, Node, Parameter, Restriction, Scenario, ScenarioNode, SimulationModel, RKIEntry
from rest_framework import serializers
from datetime import datetime


class DistributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Distribution
        fields = ['min', 'max', 'value']


class InterventionSerializer(serializers.ModelSerializer):
    start = serializers.DateField(source="start_date")
    end = serializers.DateField(source="end_date")

    class Meta:
        model = Intervention
        fields = ['restriction', 'start', 'end', 'contact_rate']


class ScenarioSerializerMeta(serializers.ModelSerializer):
    class Meta:
        model = Scenario
        fields = ['id', 'name', 'description', 'simulation_model', 'number_of_groups', 'number_of_nodes']


class ScenarioNodeSerializer(serializers.ModelSerializer):
    node = serializers.SlugRelatedField(slug_field="name", read_only=True)
    group = serializers.SlugRelatedField(slug_field="name", read_only=True)
    interventions = InterventionSerializer(many=True)

    class Meta:
        model = ScenarioNode
        fields = '__all__'


class ScenarioSerializerFull(serializers.ModelSerializer):
    nodes = ScenarioNodeSerializer(many=True)

    class Meta:
        model = Scenario
        fields = ['name', 'description', 'simulation_model', 'number_of_groups', 'number_of_nodes', 'nodes']


class RestrictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restriction
        fields = ['name']


class NodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = ['name', 'metadata']


class ParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parameter
        fields = ['name']


class SimulationModelSerializerMeta(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = SimulationModel
        fields = ['url', 'name']

class SimulationModelSerializerFull(serializers.ModelSerializer):
    parameters = serializers.SlugRelatedField(slug_field='name', read_only=True, many=True)
    compartments = serializers.SlugRelatedField(slug_field='name', read_only=True, many=True)

    class Meta:
        model = SimulationModel
        fields = ['name', 'description', 'parameters', 'compartments']

class RKIEntrySerializer(serializers.ModelSerializer):
    infectious = serializers.IntegerField()
    deaths = serializers.IntegerField()
    recovered = serializers.IntegerField()
    date = serializers.DateField(source="refdatum")
    #county = serializers.CharField(source="id_landkreis")

    class Meta:
        model = RKIEntry
        fields = ['date', 'infectious', 'deaths', 'recovered']

    def to_representation(self, instance):
        representation = super(RKIEntrySerializer, self).to_representation(instance)
        representation['timestamp'] = int(datetime.combine(instance.refdatum, datetime.min.time()).timestamp() * 1000)

        return representation

class RKICountySerializer(serializers.Serializer):
    county = serializers.CharField()
    count = serializers.IntegerField()
    data = RKIEntrySerializer(many=True)

