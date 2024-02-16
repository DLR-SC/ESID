# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: Apache-2.0

from django.db import models

# Create your models here.
class Node(models.Model):
    """Model definition for a Node (i.e. counties)."""

    # Fields
    name = models.CharField(max_length=100)
    description = models.TextField()
    metadata = models.JSONField()

    class Meta:
        pass

    def __str__(self):
        return 'Node(%s)'.format(self.name)


class GroupCategory(models.Model):
    """RKI gender choice definition."""
    key = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=50)
    description = models.TextField()

    class Meta:
        pass

    def __str__(self):
        return 'GroupCategory(%s)'.format(self.key)


class Group(models.Model):
    """Model definition for a Group (i.e. age_group)."""

    # Fields
    key = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=50)
    description = models.TextField()
    category = models.ForeignKey(GroupCategory, on_delete=models.DO_NOTHING)

    class Meta:
        pass

    def __str__(self):
        return 'Group(%s)'.format(self.key)


class Distribution(models.Model):
    """Model definition for a Distribution."""
    DistributionTypes = models.TextChoices('Normal', 'Gaussian')

    # Fields
    type = models.CharField(choices=DistributionTypes.choices, max_length=10)
    min = models.FloatField(default=0.0)
    max = models.FloatField(default=0.0)
    mean = models.FloatField(default=0.0)
    deviation = models.FloatField(default=0.0)
    value = models.FloatField(default=0.0)

    class Meta:
        """Meta definition for Distribution."""

        verbose_name = 'Distribution'
        verbose_name_plural = 'Distributions'

    def __str__(self):
        """Unicode representation of Distribution."""
        return 'Distribution(%s, min=%f, max=%f, mean=%f, deviation=%f, value=%f)'


class Restriction(models.Model):
    """Model definition for a Restriction."""

    key = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=50)
    contact_rate = models.FloatField()

    class Meta:
        """Meta definition for Restriction."""

        verbose_name = 'Restriction'
        verbose_name_plural = 'Restrictions'

    def __str__(self):
        """Unicode representation of Restriction."""
        pass


class Intervention(models.Model):
    """Model definition for a Intervention."""

    # Fields
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    contact_rate = models.DecimalField(decimal_places=3, max_digits=3)

    restriction = models.ForeignKey(Restriction, on_delete=models.RESTRICT)

    class Meta:
        """Meta definition for a Intervention."""

        verbose_name = 'Intervention'
        verbose_name_plural = 'Interventions'

    def __str__(self):
        """Unicode representation of Intervention."""
        pass

class Parameter(models.Model):
    """Model definition for a Simulation Parameter."""
    key = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField()

    class Meta:
        pass

    def __str__(self):
        return 'Parameter(%s)'.format(self.key)


class Compartment(models.Model):
    """Model definition for a Simulation Compartment."""
    key = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField()

    class Meta:
        pass

    def __str__(self):
        return 'Compartment(%s)'.format(self.name)


class DataEntry(models.Model):
    day = models.DateField()
    data = models.JSONField()
    percentile = models.IntegerField(default=50)

    groups = models.ManyToManyField(Group) 

    class Meta:
        pass


class SimulationModel(models.Model):
    """Model definition for a Simulation Model."""
    key = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    parameters = models.ManyToManyField(Parameter)
    compartments = models.ManyToManyField(Compartment)

    class Meta:
        pass

    def __str__(self):
        return 'SimulationModel(%s)'.format(self.key)


class ScenarioParameterGroup(models.Model):
    distribution = models.ForeignKey(Distribution, related_name='distribution', on_delete=models.RESTRICT)
    groups = models.ManyToManyField(Group)
    
    @property
    def min(self):
        return self.distribution.min

    @property
    def max(self):
        return self.distribution.max


class ScenarioParameter(models.Model):
    """Model definition for a parameter belonging to a scenario."""
    parameter = models.ForeignKey(Parameter, related_name='parameter', on_delete=models.RESTRICT)
    groups = models.ManyToManyField(ScenarioParameterGroup)
    
    class Meta:
        pass

    def __str__(self):
        return 'ScenarioParameter'


class ScenarioNode(models.Model):
    """Model definition for a node belonging to a scenario (i.e. counties)."""

    # Fields
    node = models.ForeignKey(Node, on_delete=models.RESTRICT)
    parameters = models.ManyToManyField(ScenarioParameter)
    interventions = models.ManyToManyField(Intervention)

    @property
    def name(self):
        return self.node.name

    class Meta:
        pass

    def __str__(self):
        return 'ScenarioNode'

    def delete(self, *args, **kwargs):
        for parameter in self.parameters.all():
            parameter.delete()
        
        self.parameters.clear()
        super().delete(*args, **kwargs)


class Scenario(models.Model):
    """Model definition for a scenario."""

    # Fields
    key = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    simulation_model = models.ForeignKey(SimulationModel, related_name='simulation_model', on_delete=models.RESTRICT)
    number_of_groups = models.IntegerField()
    number_of_nodes = models.IntegerField()
    nodes = models.ManyToManyField(ScenarioNode)

    class Meta:
        pass

    @property
    def parameters(self):
        return self.nodes.all()[0].parameters.all()

    @property
    def compartments(self):
        return self.simulation_model.compartments.all()

    def __str__(self):
        return 'Scenario(%s)'.format(self.name)

    def delete(self, *args, **kwargs):
        for node in self.nodes.all():
            node.delete()
        
        self.nodes.clear()
        super().delete(*args, **kwargs)


class SimulationCompartment(Distribution):
    """Model definition for a compartment belonging to a simulation."""
    compartment = models.ForeignKey(Compartment, on_delete=models.RESTRICT)

    class Meta:
        pass

    def __str__(self):
        return 'SimulationCompartment'


class SimulationNode(models.Model):
    """Model definition for a node belonging to a simulation (i.e. counties)."""

    scenario_node = models.ForeignKey(ScenarioNode, on_delete=models.RESTRICT)
    data = models.ManyToManyField(DataEntry)

    class Meta:
        pass

    @property
    def name(self):
        return self.scenario_node.name

    def __str__(self):
        return 'SimulationNode'


class Simulation(models.Model):
    """Model definition for a simulation."""

    # Fields
    key = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    start_day = models.DateField()
    number_of_days = models.IntegerField()

    scenario = models.ForeignKey(Scenario, on_delete=models.RESTRICT)
    nodes = models.ManyToManyField(SimulationNode)

    class Meta:
        pass

    def __str__(self):
        return 'Simulation(%s)'.format(self.name)


class SimulationData(models.Model):
    simulationnode = models.ForeignKey(SimulationNode, on_delete=models.DO_NOTHING)
    node = models.ForeignKey(Node, on_delete=models.DO_NOTHING)
    node_name = models.TextField()
    groups = models.TextField()
    day = models.DateField()
    percentile = models.IntegerField()
    data = models.JSONField()

    class Meta:
        managed = False
        db_table = 'api_simulationdata'

class RKINode(models.Model):
    """Model definition for one rki data entry."""
    node = models.ForeignKey(Node, on_delete=models.RESTRICT)
    data = models.ManyToManyField(DataEntry)

    class Meta:
        pass

    @property
    def name(self):
        return self.node.name


class RKIData(models.Model):
    rkinode = models.ForeignKey(RKINode, on_delete=models.DO_NOTHING)
    node = models.ForeignKey(Node, on_delete=models.DO_NOTHING)
    node_name = models.TextField()
    groups = models.TextField()
    day = models.DateField()
    percentile = models.IntegerField()
    data = models.JSONField()

    class Meta:
        managed = False
        db_table = 'api_rkidata'
