# Generated by Django 3.2.3 on 2021-07-12 13:05
from src.api.fixtures.initial_data import COMPARTMENTS, NODES, PARAMETERS, RESTRICTIONS, SIMULATION_MODELS
from django.db import migrations


def fillin_restrictions(apps, schema_editor):
    """Add all currently used restrictions to the database"""
    Restriction = apps.get_model('api', 'Restriction')

    for r in RESTRICTIONS:
        restriction = Restriction(name=r, contact_rate=0.5)
        restriction.save()


def fillin_parameters(apps, schema_editor):
    """Add all currently used parameters to the database"""
    Parameter = apps.get_model('api', 'Parameter')

    for p in PARAMETERS:
        parameter = Parameter(name=p)
        parameter.save()


def fillin_compartments(apps, schema_editor):
    """Add all currently available compartments to the database"""
    Compartment = apps.get_model('api', 'Compartment')

    for c in COMPARTMENTS:
        compartment = Compartment(name=c)
        compartment.save()


def fillin_simulation_models(apps, schema_editor):
    """Add all currently available simulation models to the database"""
    Parameter = apps.get_model('api', 'Parameter')
    Compartments = apps.get_model('api', 'Compartment')
    SimulationModel = apps.get_model('api', 'SimulationModel')

    for s in SIMULATION_MODELS.keys():
        m = SIMULATION_MODELS.get(s)
        parameters = m.get('parameters')
        compartments = m.get('compartments')

        model = SimulationModel(name=s)
        model.save()

        for p in parameters:
            parameter = Parameter.objects.get(name=p)
            model.parameters.add(parameter)

        for c in compartments:
            compartment = Compartments.objects.get(name=c)
            model.compartments.add(compartment)

        model.save()


def fillin_nodes(apps, schema_editor):
    """Add all german counties to the database"""
    Node = apps.get_model('api', 'Node')

    for n in NODES:
        node = Node(name=n.get('label'), metadata=n)
        node.save()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(fillin_nodes),
        migrations.RunPython(fillin_restrictions),
        migrations.RunPython(fillin_parameters),
        migrations.RunPython(fillin_compartments),
        migrations.RunPython(fillin_simulation_models)
    ]
