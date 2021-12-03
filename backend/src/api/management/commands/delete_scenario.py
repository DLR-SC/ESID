from django.core.management.base import BaseCommand, CommandError
import pandas as pd
from datetime import datetime
import src.api.models as models
from tqdm import tqdm


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
        
