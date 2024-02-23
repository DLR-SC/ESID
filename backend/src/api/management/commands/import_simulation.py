# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: Apache-2.0

from django.core.management.base import BaseCommand, CommandError
from datetime import datetime, timedelta
from tqdm import tqdm
import src.api.models as models
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


def create_data_entries(start_day, n_days, compartments, dataset, group, percentile):
    entries = []

    # skip first data entry, because it only contains the initial rki data
    for day in range(1, n_days):
        date = start_day + timedelta(days=day)

        values = dict()
        for index, compartment in enumerate(compartments):
            if compartment == '**ignore**':
                continue

            values[compartment] = dataset[day, index]

        entry = models.DataEntry(day=date, data=values, percentile=percentile)
        entries.append(entry)

    return entries


def process_node(self, meta, h5node, compartments, order, start_day, percentile, simulation_node):
    data_entries = []
    group_mapping = []
    for dataset_name in meta['datasets']:
        group_name = meta['groupMapping'][dataset_name] if 'groupMapping' in meta else dataset_name
        try:
            group = models.Group.objects.get(key=group_name)
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

        # create data entry models
        entries = create_data_entries(start_day, n_days, order, dataset, group, percentile)
        
        # save data entry models
        entries = models.DataEntry.objects.bulk_create(entries)

        # set groups on data entries
        for entry in entries:
            entry.groups.add(group)

        data_entries.extend(entries)
    
    simulation_node.data.set(list(simulation_node.data.all()) + data_entries)
    simulation_node.save()


def process_percentile(self, path, percentile, meta, simulation, scenario, compartments, order, start_day):
    self.stdout.write("Processing percentile {}".format(percentile))

    files = os.listdir(path)

    if "Results.h5" not in files:
        raise CommandError('No Results.h5 found in data folder!')

    if "Results_sum.h5" not in files:
        raise CommandError('No Results_sum.h5 found in data folder!')

    scenario_nodes = scenario.nodes.all()
    scenario_node_names = list(map(lambda n: n.name, scenario_nodes))

    self.stdout.write("Processing GraphNode files")
    node_files = list(filter(lambda f: 'GraphNode' in f, files))

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

                    scenario_node = scenario_nodes.get(node__name=padded)

                    try:
                        simulation_node = simulation.nodes.get(scenario_node=scenario_node)
                    except models.SimulationNode.DoesNotExist:
                        simulation_node = models.SimulationNode(scenario_node=scenario_node)
                        simulation_node.save()
                        simulation.nodes.add(simulation_node)

                    process_node(self, meta, h5node, compartments, order, start_day, percentile, simulation_node)


    self.stdout.write("Importing Results_sum.h5 as node 00000")
    with h5py.File(os.path.join(path, 'Results_sum.h5'), 'r') as h5:            
        h5node = h5['0']

        scenario_node = scenario_nodes.get(node__name='00000')

        try:
            simulation_node = simulation.nodes.get(scenario_node=scenario_node)
        except models.SimulationNode.DoesNotExist:
            simulation_node = models.SimulationNode(scenario_node=scenario_node)
            simulation_node.save()
            simulation.nodes.add(simulation_node)
        
        process_node(self, meta, h5node, compartments, order, start_day, percentile, simulation_node)
        
    simulation.save()      


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

        print(files)

        percentiles = list(map(lambda p: int(p) if p.isnumeric() else int(p[1:]), filter(lambda f: os.path.isdir(os.path.join(path, f)), files)))

        print(percentiles)
        if len(percentiles) == 0:
            raise CommandError('No percentiles found to import!')


        with open(os.path.join(path, 'metadata.json')) as metafile:
            meta = json.load(metafile)


        # check mandatory keys
        for key in MANDATORY:
            if key not in meta:
                raise CommandError('Mandatory key "{}" is missing in metadata file!'.format(key))

        try:
            scenario = models.Scenario.objects.get(key=meta['scenario'])
        except models.Scenario.DoesNotExist:
            raise CommandError('Scenario {} does not exist!'.format(meta['scenario']))

        compartments = scenario.compartments.all()
        order = meta['compartmentOrder']

        for compartment in compartments:
            try:
                index = order.index(compartment.name)
            except ValueError:
                raise CommandError(self.style.ERROR('Compartment {} not found in mapping'.format(compartment.name)))

        simulation = None

        try:
            simulation = models.Simulation.objects.get(key=meta['key'])
            
            self.stdout.write('Simulation {} already exists! \n What do you want to do?'.format(meta['name']))
            action = input("(1) replace simulation, (2) append simulation data \n")

            if action == '1':
                simulation.delete()
                simulation = None
            elif action == '2':
                pass
            else:
                raise CommandError(self.style.ERROR('Unrecognized input {}!'.format(action)))

        except models.Simulation.DoesNotExist:
            pass

        start_day = datetime.strptime(meta['startDay'], "%Y-%m-%d")

        if simulation is None:
            simulation = models.Simulation( \
                key=meta['key'], \
                name=meta['name'], \
                description=meta['description'], \
                scenario=scenario, \
                start_day=start_day, 
                number_of_days=meta['numberOfDays'] )

            simulation.save()


        for percentile in percentiles:
            process_percentile(self, os.path.join(path, str(percentile)), percentile, meta, simulation, scenario, compartments, order, start_day)

        
        if is_zip:
            self.stdout.write('Deleting temporary folder {}'.format(path, temp_dir.name))
            temp_dir.cleanup()
