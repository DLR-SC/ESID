from django.db import models

# Create your models here.


class Node(models.Model):
    """Model definition for a Node (i.e. counties)."""

    # Fields
    name = models.CharField(max_length=30)

    class Meta:
        pass

    def __str__(self):
        return 'Node(%s)'.format(self.name)


class Group(models.Model):
    """Model definition for a Group (i.e. age_group)."""

    # Fields
    name = models.CharField(max_length=30)

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

    class Meta:
        """Meta definition for Restriction."""

        verbose_name = 'Restriction'
        verbose_name_plural = 'Restrictions'

    def __str__(self):
        """Unicode representation of Restriction."""
        pass


class Measure(models.Model):
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


class StageTimes(models.Model):
    """Model definition for a node belonging to a scenario (i.e. counties)."""

    # Fields
    incubation = models.ForeignKey(Distribution, related_name='incubation', on_delete=models.RESTRICT)
    infectious_mild = models.ForeignKey(Distribution, related_name='infectious_mild', on_delete=models.RESTRICT)
    serial_interval = models.ForeignKey(Distribution, related_name='serial_interval', on_delete=models.RESTRICT)
    hospitalized_to_recovered = models.ForeignKey(Distribution,
                                                  related_name='hospitalized_to_recovered',
                                                  on_delete=models.RESTRICT)
    infectious_to_hospitalized = models.ForeignKey(Distribution,
                                                   related_name='infectious_to_hospitalized',
                                                   on_delete=models.RESTRICT)
    infectious_asympt = models.ForeignKey(Distribution, related_name='infectious_asympt', on_delete=models.RESTRICT)
    hospitalized_to_icu = models.ForeignKey(Distribution, related_name='hospitalized_to_icu', on_delete=models.RESTRICT)
    icu_to_recovered = models.ForeignKey(Distribution, related_name='icu_to_recovered', on_delete=models.RESTRICT)
    icu_to_dead = models.ForeignKey(Distribution, related_name='icu_to_dead', on_delete=models.RESTRICT)

    class Meta:
        pass

    def __str__(self):
        return 'StageTimes'


class Probabilities(models.Model):
    """Model definition for a node belonging to a scenario (i.e. counties)."""

    # Fields
    infected_from_contact = models.ForeignKey(Distribution, related_name='infected_from_contact', on_delete=models.RESTRICT)
    carrier_infectability = models.ForeignKey(Distribution, related_name='carrier_infectability', on_delete=models.RESTRICT)
    asymp_per_infectious = models.ForeignKey(Distribution, related_name='asymp_per_infectious', on_delete=models.RESTRICT)
    risk_from_symptotic = models.ForeignKey(Distribution, related_name='risk_from_symptotic', on_delete=models.RESTRICT)
    dead_per_icu = models.ForeignKey(Distribution, related_name='dead_per_icu', on_delete=models.RESTRICT)
    hospitalized_per_infectious = models.ForeignKey(Distribution,
                                                    related_name='hospitalized_per_infectious',
                                                    on_delete=models.RESTRICT)
    icu_per_hospitalized = models.ForeignKey(Distribution, related_name='icu_per_hospitalized', on_delete=models.RESTRICT)

    risk_from_symptomatic = models.ForeignKey(Distribution, related_name='risk_from_symptomatic', on_delete=models.RESTRICT)

    class Meta:
        pass

    def __str__(self):
        return 'Probabilities'


class Population(models.Model):
    total = models.IntegerField()
    dead = models.IntegerField()
    exposed = models.ForeignKey(Distribution, related_name='exposed', on_delete=models.RESTRICT)
    carrier = models.ForeignKey(Distribution, related_name='carrier', on_delete=models.RESTRICT)
    infectious = models.ForeignKey(Distribution, related_name='infectious', on_delete=models.RESTRICT)
    hospitalized = models.ForeignKey(Distribution, related_name='hospitalized', on_delete=models.RESTRICT)
    icu = models.ForeignKey(Distribution, related_name='icu', on_delete=models.RESTRICT)
    recovered = models.ForeignKey(Distribution, related_name='recovered', on_delete=models.RESTRICT)

    class Meta:
        pass

    def __str__(self):
        return 'Population'


class ScenarioNode(models.Model):
    """Model definition for a node belonging to a scenario (i.e. counties)."""

    # Fields
    node = models.ForeignKey(Node, on_delete=models.RESTRICT)
    group = models.ForeignKey(Group, on_delete=models.RESTRICT)
    stage_times = models.ForeignKey(StageTimes, on_delete=models.RESTRICT)
    probabilities = models.ForeignKey(Probabilities, on_delete=models.RESTRICT)
    measures = models.ManyToManyField(Measure)

    class Meta:
        pass

    def __str__(self):
        return 'ScenarioNode(%s)'.format(self.name)


class SimulationNode(ScenarioNode):

    population = models.ForeignKey(Population, on_delete=models.RESTRICT)

    class Meta:
        pass

    def __str__(self):
        return 'SimulationNode'


class Scenario(models.Model):
    """Model definition for a scenario."""

    # Fields
    name = models.CharField(max_length=30)
    description = models.TextField()
    simulation_model = models.CharField(max_length=10)
    number_of_groups = models.IntegerField()
    number_of_nodes = models.IntegerField()
    nodes = models.ManyToManyField(ScenarioNode)

    class Meta:
        pass

    def __str__(self):
        return 'Scenario(%s, %s)'.format(self.name, self.simulation_model)


class Simulation(models.Model):

    # Fields
    name = models.CharField(max_length=30)
    description = models.TextField()
    start_day = models.DateField()
    number_of_days = models.IntegerField()

    scenario = models.ForeignKey(Scenario, on_delete=models.RESTRICT)
    nodes = models.ManyToManyField(SimulationNode)

    class Meta:
        pass

    def __str__(self):
        return 'Simulation(%s)'.format(self.name)
