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
    'startDay',
    'datasets',
    'compartmentOrder',
]


def create_data_entries(self, start_day, n_days, compartments, dataset, group, node):
    entries = []

    # check if data already exists
    # if node.data.filter(day__gte=start_day, group=group).exists():
        # self.stdout.write('Data for node {} group {} day {} already exist! Skipping.'.format(node.node.name, group.name, date))
    #    return entries
        
    for day in range(0, n_days):
        date = start_day + timedelta(days=day)

        values = dict()
        for index, compartment in enumerate(compartments):
            if compartment == '**ignore**':
                continue

            values[compartment] = dataset[day, index]

        entry = models.DataEntry(day=date, data=values)
        entries.append(entry)

    return entries


def import_node(self, node, h5node, meta, start_day):
    data_entries = []

    [rki_node, flag] = models.RKINode.objects.get_or_create(node=node)
    
    order = meta['compartmentOrder']

    for dataset_name in meta['datasets']:
        group_name = meta['groupMapping'][dataset_name] if 'groupMapping' in meta else dataset_name
        try:
            group = models.Group.objects.get(key=group_name)
        except models.Group.DoesNotExist:
            self.stdout.write(self.style.ERROR('No group for dataset {} found!'.format(group_name)))
            continue

        dataset = h5node[dataset_name]

        [n_days, n_compartments] = dataset.shape

        if n_compartments != len(order):
            self.stdout.write(self.style.ERROR('Compartment mapping must be of the same length as columns in dataset {}!={}'.format(len(order), n_compartments)))
            continue

        # create data entry models
        entries = create_data_entries(self, start_day, n_days, order, dataset, group, rki_node)
        
        # save data entry models
        entries = models.DataEntry.objects.bulk_create(entries)

        # set groups on data entries
        for entry in entries:
            entry.groups.add(group)

        data_entries.extend(entries)
    
    
    rki_node.data.set(data_entries)
    
    return rki_node


class Command(BaseCommand):
    help = 'Import RKI data'

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

        order = meta['compartmentOrder']

        start_day = datetime.strptime(meta['startDay'], "%Y-%m-%d")

        nodes = []
        with h5py.File(os.path.join(path, 'Results.h5'), 'r') as h5:
            node_names = list(h5.keys())
            with tqdm(node_names, total=len(node_names)) as progress:
                for nodeId in progress:
                    progress.set_description('Procressing node {}'.format(nodeId))
                    padded = nodeId.zfill(5)

                    try:
                        node = models.Node.objects.get(name=padded)
                    except models.Node.DoesNotExist:
                        self.stdout.write(self.style.ERROR('Node {} does not exist!'.format(padded)))
                        continue

                    h5node = h5[nodeId]
                    import_node(self, node, h5node, meta, start_day)


        self.stdout.write("Importing Results_sum.h5 as node 00000")
        with h5py.File(os.path.join(path, 'Results_sum.h5'), 'r') as h5:            
            try:
                h5node = h5['0']
                node = models.Node.objects.get(name="00000")
                import_node(self, node, h5node, meta, start_day)
            except models.Node.DoesNotExist:
                self.stdout.write(self.style.ERROR('Node "00000" (Germany) does not exist!'.format(padded)))
        
        if is_zip:
            self.stdout.write('Deleting temporary folder {}'.format(path, temp_dir.name))
            temp_dir.cleanup()
