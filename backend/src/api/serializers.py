from django.db.models import fields
from .models import Distribution, Measure, Restriction, Scenario, ScenarioNode
from rest_framework import serializers


class DistributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Distribution
        fields = ['type', 'min', 'max', 'value']


class ScenarioSerializerMeta(serializers.ModelSerializer):
    class Meta:
        model = Scenario
        fields = ['name', 'description', 'simulation_model', 'number_of_groups', 'number_of_nodes']




class ScenarioNodeSerializer(serializers.ModelSerializer):
    group = serializers.CharField(source="name")

    class Meta:
        model = ScenarioNode
        fields = ['group']

class ScenarioSerializerFull(serializers.ModelSerializer):
    nodes = [ScenarioNodeSerializer()]
    class Meta:
        model = Scenario
        depth = 2
        fields = ['name', 'description', 'simulation_model', 'number_of_groups', 'number_of_nodes', 'nodes']

class MeasureSerializer(serializers.ModelSerializer):
    start = serializers.DateField(source="start_date")
    end = serializers.DateField(source="end_date")

    class Meta:
        model = Measure
        fields = ['restriction', 'start', 'end', 'contact_rate']


class RestrictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restriction
        fields = ['name']
