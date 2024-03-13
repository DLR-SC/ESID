# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: Apache-2.0

from django.core.management.base import BaseCommand, CommandError
import src.api.models as models


class Command(BaseCommand):
    help = 'Delete scenario'

    def add_arguments(self, parser):
        parser.add_argument('scenario_name', type=str)

    def handle(self, *args, **options):
        name = options['scenario_name']
        print(name)
        scenario = models.Scenario.objects.get(name=name)
        if scenario is not None:
            scenario.delete()
        
