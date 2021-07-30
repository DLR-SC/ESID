from django.db import models
from django_pandas.managers import DataFrameManager

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


class Group(models.Model):
    """Model definition for a Group (i.e. age_group)."""

    # Fields
    name = models.CharField(max_length=100)
    description = models.TextField()

    class Meta:
        pass

    def __str__(self):
        return 'Group(%s)'.format(self.name)


class Distribution(models.Model):
    """Model definition for Distribution."""
    DistributionTypes = models.TextChoices('Normal', 'Gaussian')

    # Fields
    type = models.CharField(choices=DistributionTypes.choices, max_length=10)
    min = models.FloatField()
    max = models.FloatField()
    mean = models.FloatField()
    deviation = models.FloatField()
    value = models.FloatField()

    class Meta:
        """Meta definition for Distribution."""

        verbose_name = 'Distribution'
        verbose_name_plural = 'Distributions'

    def __str__(self):
        """Unicode representation of Distribution."""
        return 'Distribution(%s, min=%f, max=%f, mean=%f, deviation=%f, value=%f)'


class Restriction(models.Model):
    """Model definition for Restriction."""

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
    """Model definition for Measure."""

    # Fields
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    contact_rate = models.DecimalField(decimal_places=3, max_digits=3)

    restriction = models.ForeignKey(Restriction, on_delete=models.RESTRICT)

    class Meta:
        """Meta definition for Measure."""

        verbose_name = 'Measure'
        verbose_name_plural = 'Measures'

    def __str__(self):
        """Unicode representation of Measure."""
        pass

class Parameter(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    class Meta:
        pass

    def __str__(self):
        return 'Parameter(%s)'.format(self.name)


class Compartment(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    class Meta:
        pass

    def __str__(self):
        return 'Compartment(%s)'.format(self.name)

class SimulationModel(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    parameters = models.ManyToManyField(Parameter)
    compartments = models.ManyToManyField(Compartment)

    class Meta:
        pass

    def __str__(self):
        return 'SimulationModel(%s)'.format(self.name)


class ScenarioParameter(Distribution):
    parameter = models.ForeignKey(Parameter, related_name='parameter', on_delete=models.RESTRICT)

    class Meta:
        pass

    def __str__(self):
        return 'ScenarioParameter'


class ScenarioNode(models.Model):
    """Model definition for a node belonging to a scenario (i.e. counties)."""

    # Fields
    node = models.ForeignKey(Node, on_delete=models.RESTRICT)
    group = models.ForeignKey(Group, on_delete=models.RESTRICT)
    parameters = models.ForeignKey(ScenarioParameter, on_delete=models.RESTRICT)
    interventions = models.ManyToManyField(Intervention)

    class Meta:
        pass

    def __str__(self):
        return 'ScenarioNode(%s)'.format(self.name)


class SimulationCompartment(Distribution):
    compartment = models.ForeignKey(Compartment, on_delete=models.RESTRICT)

    class Meta:
        pass

    def __str__(self):
        return 'SimulationCompartment'

class SimulationNode(models.Model):

    comparments = models.ManyToManyField(SimulationCompartment)
    scenario_node = models.ForeignKey(ScenarioNode, on_delete=models.RESTRICT)

    class Meta:
        pass

    def __str__(self):
        return 'SimulationNode'


class Scenario(models.Model):
    """Model definition for a scenario."""

    # Fields
    name = models.CharField(max_length=100)
    description = models.TextField()
    simulation_model = models.ForeignKey(SimulationModel, related_name='simulation_model', on_delete=models.RESTRICT)
    number_of_groups = models.IntegerField()
    number_of_nodes = models.IntegerField()
    nodes = models.ManyToManyField(ScenarioNode)

    class Meta:
        pass

    def __str__(self):
        return 'Scenario(%s)'.format(self.name)


class Simulation(models.Model):

    # Fields
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


class GenderChoice(models.TextChoices):
    M = 'M', 'Männlich'
    W = 'W', 'Weiblich'
    U = 'U', 'Unbekannt'

class FlagChoice(models.IntegerChoices):
    JA = 1, 'Ja'
    NEIN = 0, 'Nein'
    NA = -9, 'Nein'

class RKIEntry(models.Model):
    id_bundesland = models.CharField(max_length=20)
    id_landkreis = models.CharField(max_length=20)
    bundesland = models.CharField(max_length=100)
    landkreis = models.CharField(max_length=100)
    altersgruppe = models.CharField(max_length=10)
    geschlecht = models.CharField(choices=GenderChoice.choices, max_length=1)
    meldedatum = models.DateField()
    refdatum = models.DateField()
    ist_erkrankungsbeginn = models.IntegerField(choices=FlagChoice.choices)
    neuer_fall = models.IntegerField(choices=FlagChoice.choices)
    neuer_todesfall = models.IntegerField(choices=FlagChoice.choices)
    neu_genesen = models.IntegerField(choices=FlagChoice.choices)
    anzahl_fall = models.IntegerField()
    anzahl_todesfall = models.IntegerField()
    anzahl_genesen = models.IntegerField()

    created = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)


class RKICounty:

    def __init__(self, county, timesteps):
        self.county = county
        self.data = timesteps
        self.count = len(timesteps)


class RKIDay:

    def __init__(self, day, counties):
        self.day = day
        self.data = counties
        self.count = len(counties)