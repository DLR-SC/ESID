# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: Apache-2.0

from django.core.management.base import BaseCommand, CommandError
import pandas as pd
from datetime import datetime
from src.api.models import RKIEntry
from tqdm import tqdm

fields = {
    'Geschlecht': 'geschlecht',
    'AnzahlFall': 'anzahl_fall',
    'AnzahlGenesen': 'anzahl_genesen',
    'AnzahlTodesfall': "anzahl_todesfall",
    'IdBundesland': 'id_bundesland',
    'Bundesland': 'bundesland',
    'IdLandkreis': 'id_landkreis',
    'Landkreis': 'landkreis',
    'Altersgruppe': 'altersgruppe',
    'IstErkrankungsbeginn': 'ist_erkrankungsbeginn',
    'NeuerFall': 'neuer_fall',
    'NeuGenesen': 'neu_genesen',
    'NeuerTodesfall': 'neuer_todesfall',
    'Meldedatum': 'meldedatum',
    'Refdatum': 'refdatum'
    
}

class Command(BaseCommand):
    help = 'Download and import RKI data'

    def handle(self, *args, **options):
        start = datetime.now()
        print('Downloading data: ...', end='\r')
        df = pd.read_csv('https://opendata.arcgis.com/datasets/dd4580c810204019a7b8eb3e0b329dd6_0.csv')
        
        print('Downloading data: done, took {}'.format(datetime.now() - start))

        print('Preparing data: ...', end='\r')
        df.loc[df.Geschlecht == 'unbekannt', ['Geschlecht']] = 'U'

        for col in ['Meldedatum', 'Refdatum']:
            df[col] = df[col].astype('datetime64[ns]')

        df = df.drop(['Datenstand', 'ObjectId', 'Altersgruppe2'], axis=1)
        df.rename(columns=fields, inplace=True)

        print('Preparing data: done')

        print('Saving data: ...')
        entries = []
        for item in tqdm(df.to_dict('records')):
            entries.append(RKIEntry(**item))
                
        RKIEntry.objects.bulk_create(entries)

        print('Saving data: done')
