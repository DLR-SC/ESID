from django.core.management.base import BaseCommand, CommandError
from datetime import datetime, timedelta
from tqdm import tqdm
from datetime import datetime
import src.api.models as models
import pandas as pd
import zipfile
import os
import tempfile
import json
import h5py

MANDATORY = [
    'name',
    'description',
    'startDay',
    'numberOfDays',
    'scenario',
    'datasets',
    'compartmentOrder',
]


def create_data_entries(start_day, n_days, compartments, dataset, group):
    entries = []

    # skip first data entry, because it only contains the inital rki data
    for day in range(1, n_days):
        date = start_day + timedelta(days=day)

        values = dict()
        for index, compartment in enumerate(compartments):
            if compartment == '**ignore**':
                continue

            values[compartment] = dataset[day, index]

        entry = models.DataEntry(day=date, group=group, data=values)
        entries.append(entry)

    return entries


def process_node(self, meta, h5node, compartments, order, start_day, scenario_node):
    data_entries = []

    for dataset_name in meta['datasets']:
        group_name = meta['groupMapping'][dataset_name] if 'groupMapping' in meta else dataset_name
        try:
            group = models.Group.objects.get(name=group_name)
        except models.Group.DoesNotExist:
            self.stdout.write(self.style.ERROR('No group for dataset {} found!'.format(group_name)))
            continue

        dataset = h5node[dataset_name]

        [n_days, n_compartments] = dataset.shape

        if n_days - 1 != meta['numberOfDays']:
            self.stdout.write(self.style.ERROR('Number of days {} in dataset {} does not match the expected number of days for simulation {}!'.format(n_days, dataset_name, meta['numberOfDays'])))
            continue

        if n_compartments != len(order):
            self.stdout.write(self.style.ERROR('Compartment mapping must be of the same length as columns in dataset {}!={}'.format(len(order), n_compartments)))
            continue

        entries = create_data_entries(start_day, n_days, order, dataset, group)
        data_entries.extend(entries)

    models.DataEntry.objects.bulk_create(data_entries)
                        
    simulation_node = models.SimulationNode(scenario_node=scenario_node)
    simulation_node.save()
    simulation_node.data.set(data_entries)

    return simulation_node


class Command(BaseCommand):
    help = 'Download and import RKI data'

    def add_arguments(self, parser):
        parser.add_argument('data_path', type=str)

    def handle(self, *args, **options):
        
        path = options['data_path']
        if not path:
            raise CommandError('No path to data provided!')


        if not os.path.exists(path):
            raise CommandError('Could not find path {}!'.format(path))

        is_folder = os.path.isdir(path)
        is_zip = zipfile.is_zipfile(path)

        if not (is_zip or is_folder):
            raise CommandError('Path must be a folder or Zip file {}!'.format(path))

        if is_zip:
            temp_dir = tempfile.TemporaryDirectory()
            self.stdout.write('Extracting zip file "{}" to temporary folder {}'.format(path, temp_dir.name))
            with zipfile.ZipFile(path,"r") as zip:
                zip.extractall(temp_dir.name)

            path = temp_dir.name

        files = os.listdir(path)
        
        if "metadata.json" not in files:
            raise CommandError('No metadata.json found in data folder!')

        if "Results.h5" not in files:
            raise CommandError('No Results.h5 found in data folder!')

        if "Results_sum.h5" not in files:
            raise CommandError('No Results_sum.h5 found in data folder!')

        with open(os.path.join(path, 'metadata.json')) as metafile:
            meta = json.load(metafile)


        # check mandatory keys
        for key in MANDATORY:
            if key not in meta:
                raise CommandError('Mandatory key "{}" is missing in metadata file!'.format(key))

        try:
            scenario = models.Scenario.objects.get(name=meta['scenario'])
        except models.Scenario.DoesNotExist:
            raise CommandError('Scenario {} does not exist!'.format(meta['scenario']))

        compartments = scenario.compartments.all()
        order = meta['compartmentOrder']

        for compartment in compartments:
            try:
                index = order.index(compartment.name)
            except ValueError:
                raise CommandError(self.style.ERROR('Compartment {} not found in mapping'.format(compartment.name)))

        try:
            simulation = models.Simulation.objects.get(name=meta['name'])
            simulation.delete()
        except models.Simulation.DoesNotExist:
            pass

        start_day = datetime.strptime(meta['startDay'], "%Y-%m-%d")
        simulation = models.Simulation( \
            name=meta['name'], \
            description=meta['description'], \
            scenario=scenario, \
            start_day=start_day, 
            number_of_days=meta['numberOfDays'] )

        simulation.save()


        scenario_nodes = scenario.nodes.all()
        scenario_node_names = list(map(lambda n: n.name, scenario_nodes))

        self.stdout.write("Processing all GraphNode files")
        node_files = list(filter(lambda f: 'GraphNode' in f, files))
        nodes = []
        with h5py.File(os.path.join(path, 'Results.h5'), 'r') as h5:
            with tqdm(node_files, total=len(node_files)) as progress:
                for node_file in progress:
                    progress.set_description('Procressing node file {}'.format(node_file))
                    with open(os.path.join(path, node_file)) as handle:
                        node = json.load(handle)
                        nodeId = str(node['NodeId'])
                        padded = nodeId.zfill(5)

                        if not padded in scenario_node_names:
                            self.stdout.write(self.style.ERROR('Node {} not part of scenario {}'.format(padded, scenario.name)))

                        if not h5[nodeId]:
                            self.stdout.write(self.style.ERROR('No data found for node {}'.format(padded, scenario.name)))

                        h5node = h5[nodeId]

                        
                        simulation_node = process_node(self, meta, h5node, compartments, order, start_day, scenario_nodes.get(node__name=padded))
                        nodes.append(simulation_node)


        self.stdout.write("Importing Results_sum.h5 as node 00000")
        with h5py.File(os.path.join(path, 'Results_sum.h5'), 'r') as h5:            
            h5node = h5['0']
            simulation_node = process_node(self, meta, h5node, compartments, order, start_day, scenario_nodes.get(node__name='00000'))
            nodes.append(simulation_node)


        simulation.nodes.set(nodes)
        simulation.save()      

        
        if is_zip:
            self.stdout.write('Deleting temporary folder {}'.format(path, temp_dir.name))
            temp_dir.cleanup()
