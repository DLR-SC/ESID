# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: Apache-2.0

from django.core.management.base import BaseCommand, CommandError
from tqdm import tqdm
import src.api.models as models
import json 

MANDATORY = [
    "name",
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
        scenario.key = config['key']
        scenario.name = config['name']
        scenario.description = config.get('description', '')
        scenario.number_of_groups = len(config['groups'])
        scenario.number_of_nodes = config['numberOfNodes']
        
        # select simulation model
        try:
            simulation_model = models.SimulationModel.objects.get(key=config['simulationModel'])
        except models.SimulationModel.DoesNotExist:
            raise CommandError('Simulation model "{}" does not exist'.format(config['simulationModel']))

        scenario.simulation_model = simulation_model

        scenario.save()

        # select group models and create if neccessary
        all_groups = []
        for group_info in tqdm(config['groups'], total=len(config['groups']), desc="Creating groups"):
            group = None

            try:
                group = models.Group.objects.get(key=group_info['key'])
            except models.Group.DoesNotExist:
                if all(key in group_info for key in ['key', 'name', 'description', 'category']):
                    group = models.Group.objects.create(key=group_info['key'], category=models.GroupCategory.objects.get(key=group_info['category']), name=group_info['name'], description=group_info['description'])
            
            if group is not None:
                all_groups.append(group)

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
            with tqdm(total=len(parameters), leave=False, desc="Creating node parameters") as progress:
                for parameter_name in parameters:
                    if parameter_name not in config['parameters']:
                        raise CommandError('Values for parameter "{}" are missing '.format(parameter_name))

                    parameter_info = config['parameters'][parameter_name]
                    parameter = models.Parameter.objects.get(name=parameter_name)
                    scenario_parameter = models.ScenarioParameter.objects.create(parameter=parameter)

                    group_parameters = []

                    for i, parameter_group in enumerate(parameter_info):
                        # if group specific values exist use them, otherwise use global values
                        [min_value, max_value] = parameter_group['value']

                        if 'category' in parameter_group:
                            # select all groups for given category
                            groups = list(models.Group.objects \
                                        .filter(category=models.GroupCategory.objects.get(key=parameter_group['category'])) \
                                        .only("key") \
                                        .values_list("key", flat=True))
                        else:
                            groups = parameter_group['groups']

                        for group in groups:
                            [distribution, created] = models.Distribution.objects.get_or_create(min=min_value, max=max_value, type='Normal', value=0.0)
                            group_parameter = models.ScenarioParameterGroup.objects.create(distribution=distribution)
                            
                            sub_groups = group.split(",")
                            for sb in sub_groups:
                                group_parameter.groups.add(list(filter(lambda g: g.key == sb, all_groups))[0])

                            group_parameter.save()
                            group_parameters.append(group_parameter)

                    progress.update()

                    scenario_parameter.groups.set(group_parameters)
                    scenario_parameter.save()
                    scenario_node.parameters.add(scenario_parameter)

            scenario_node.save()
            scenario.nodes.add(scenario_node)

        scenario.save()
        self.stdout.write(self.style.SUCCESS('Successfully imported scenario "{}"'.format(scenario.name)))

