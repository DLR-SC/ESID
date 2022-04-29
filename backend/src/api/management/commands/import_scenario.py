from django.core.management.base import BaseCommand, CommandError
from tqdm import tqdm
import src.api.models as models
import json 

MANDATORY = [
    "name",
    "numberOfGroups",
    "groups",
    "numberOfNodes",
    "nodes",
    "simulationModel",
    "parameters"
]

class Command(BaseCommand):
    help = 'Import a new scenario'

    def add_arguments(self, parser):
        parser.add_argument('config', type=str)

    def handle(self, *args, **options):
        self.stdout.write('Importing scenario from file "{}"'.format(options['config']))

        with open(options['config']) as file:
            config = json.load(file)
        
        # check mandatory keys
        for key in MANDATORY:
            if key not in config:
                raise CommandError('Mandatory key "{}" is missing!'.format(key))

        
        scenario = models.Scenario()
        scenario.key = config['name']
        scenario.name = config['name']
        scenario.description = config.get('description', '')
        scenario.number_of_groups = config['numberOfGroups']
        scenario.number_of_nodes = config['numberOfNodes']
        
        # select simulation model
        try:
            simulation_model = models.SimulationModel.objects.get(name=config['simulationModel'])
        except models.SimulationModel.DoesNotExist:
            raise CommandError('Simulation model "{}" does not exist'.format(config['simulationModel']))

        scenario.simulation_model = simulation_model

        scenario.save()

        # select group models and create if neccessary
        groups = []
        for group_info in tqdm(config['groups'], total=len(config['groups']), desc="Creating groups"):
            [group, created] = models.Group.objects.get_or_create(key=group_info['name'])
            groups.append(group)

        nodes = config['nodes']
        parameters = list(simulation_model.parameters.values_list('name', flat=True))

        # create scenario nodes
        for node_key in tqdm(nodes, total=len(nodes), desc="Creating scenario nodes"):
            # select reference node
            try:
                node = models.Node.objects.get(metadata__key=node_key)
            except models.Node.DoesNotExist:
                raise CommandError('Node "{}" does not exist'.format(node_key))

            scenario_node = models.ScenarioNode()
            scenario_node.node = node
            scenario_node.save()
            
            # create parameters for node
            with tqdm(total=len(groups) * len(parameters), leave=False, desc="Creating node parameters") as progress:
                for parameter_name in parameters:
                    if parameter_name not in config['parameters']:
                        raise CommandError('Values for parameter "{}" are missing '.format(parameter_name))

                    parameter_info = config['parameters'][parameter_name]
                    parameter = models.Parameter.objects.get(name=parameter_name)
                    scenario_parameter = models.ScenarioParameter(parameter=parameter)
                    scenario_parameter.save()

                    group_parameters = []

                    for i, group in enumerate(groups):
                        # if group specific values exist use them, otherwise use global values
                        [min_value, max_value] = parameter_info['groups'][i] if 'groups' in parameter_info else parameter_info['value']
                        [distribution, created] = models.Distribution.objects.get_or_create(min=min_value, max=max_value, type='Normal', value=0.0)
                        group_parameter = models.ScenarioParameterGroup(group=group, distribution=distribution)
                        group_parameters.append(group_parameter)
                        progress.update()

                    models.ScenarioParameterGroup.objects.bulk_create(group_parameters)

                    scenario_parameter.groups.set(group_parameters)
                    scenario_parameter.save()
                    scenario_node.parameters.add(scenario_parameter)

            scenario_node.save()
            scenario.nodes.add(scenario_node)

        scenario.save()
        self.stdout.write(self.style.SUCCESS('Successfully imported scenario "{}"'.format(scenario.name)))

