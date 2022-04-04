# Generated by Django 3.2.3 on 2022-03-28 14:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='RKIData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('node_name', models.TextField()),
                ('group', models.TextField()),
                ('day', models.DateField()),
                ('percentile', models.IntegerField()),
                ('data', models.JSONField()),
            ],
            options={
                'db_table': 'api_rkidata',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='SimulationData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('node_name', models.TextField()),
                ('group', models.TextField()),
                ('day', models.DateField()),
                ('percentile', models.IntegerField()),
                ('data', models.JSONField()),
            ],
            options={
                'db_table': 'api_simulationdata',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Compartment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='DataEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('day', models.DateField()),
                ('data', models.JSONField()),
                ('percentile', models.IntegerField(default=50)),
            ],
        ),
        migrations.CreateModel(
            name='Distribution',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(choices=[('Gaussian', 'Gaussian')], max_length=10)),
                ('min', models.FloatField(default=0.0)),
                ('max', models.FloatField(default=0.0)),
                ('mean', models.FloatField(default=0.0)),
                ('deviation', models.FloatField(default=0.0)),
                ('value', models.FloatField(default=0.0)),
            ],
            options={
                'verbose_name': 'Distribution',
                'verbose_name_plural': 'Distributions',
            },
        ),
        migrations.CreateModel(
            name='Group',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Intervention',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_date', models.DateField()),
                ('end_date', models.DateField(blank=True, null=True)),
                ('contact_rate', models.DecimalField(decimal_places=3, max_digits=3)),
            ],
            options={
                'verbose_name': 'Intervention',
                'verbose_name_plural': 'Interventions',
            },
        ),
        migrations.CreateModel(
            name='Node',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('metadata', models.JSONField()),
            ],
        ),
        migrations.CreateModel(
            name='Parameter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Restriction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True)),
                ('contact_rate', models.FloatField()),
            ],
            options={
                'verbose_name': 'Restriction',
                'verbose_name_plural': 'Restrictions',
            },
        ),
        migrations.CreateModel(
            name='Scenario',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField()),
                ('number_of_groups', models.IntegerField()),
                ('number_of_nodes', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='ScenarioNode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('interventions', models.ManyToManyField(to='api.Intervention')),
                ('node', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='api.node')),
            ],
        ),
        migrations.CreateModel(
            name='SimulationNode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('data', models.ManyToManyField(to='api.DataEntry')),
                ('scenario_node', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='api.scenarionode')),
            ],
        ),
        migrations.CreateModel(
            name='SimulationModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField()),
                ('compartments', models.ManyToManyField(to='api.Compartment')),
                ('parameters', models.ManyToManyField(to='api.Parameter')),
            ],
        ),
        migrations.CreateModel(
            name='Simulation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField()),
                ('start_day', models.DateField()),
                ('number_of_days', models.IntegerField()),
                ('nodes', models.ManyToManyField(to='api.SimulationNode')),
                ('scenario', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='api.scenario')),
            ],
        ),
        migrations.CreateModel(
            name='ScenarioParameterGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('distribution', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='distribution', to='api.distribution')),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='group', to='api.group')),
            ],
        ),
        migrations.CreateModel(
            name='ScenarioParameter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('groups', models.ManyToManyField(to='api.ScenarioParameterGroup')),
                ('parameter', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='parameter', to='api.parameter')),
            ],
        ),
        migrations.AddField(
            model_name='scenarionode',
            name='parameters',
            field=models.ManyToManyField(to='api.ScenarioParameter'),
        ),
        migrations.AddField(
            model_name='scenario',
            name='nodes',
            field=models.ManyToManyField(to='api.ScenarioNode'),
        ),
        migrations.AddField(
            model_name='scenario',
            name='simulation_model',
            field=models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='simulation_model', to='api.simulationmodel'),
        ),
        migrations.CreateModel(
            name='RKINode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('data', models.ManyToManyField(to='api.DataEntry')),
                ('node', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='api.node')),
            ],
        ),
        migrations.AddField(
            model_name='intervention',
            name='restriction',
            field=models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='api.restriction'),
        ),
        migrations.AddField(
            model_name='dataentry',
            name='groups',
            field=models.ManyToManyField(to='api.Group'),
        ),
        migrations.CreateModel(
            name='SimulationCompartment',
            fields=[
                ('distribution_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='api.distribution')),
                ('compartment', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='api.compartment')),
            ],
            bases=('api.distribution',),
        ),
        migrations.RunSQL(
            sql = "CREATE VIEW api_simulationdata AS \
                SELECT  \
                    api_dataentry.id as id , \
                    api_simulationnode_data.simulationnode_id as simulationnode_id, \
                    api_node.id as node_id, \
                    api_node.name as node_name, \
                    api_dataentry.day as day, \
                    api_dataentry.percentile as percentile, \
                    api_dataentry.data as data, \
                    string_agg(api_group.name, ',') as groups \
                FROM api_dataentry   \
                INNER JOIN api_simulationnode_data \
                    ON (api_dataentry.id = api_simulationnode_data.dataentry_id) \
                INNER JOIN api_simulationnode \
                    ON (api_simulationnode.id = api_simulationnode_data.simulationnode_id) \
                INNER JOIN api_scenarionode \
                    ON (api_scenarionode.id = api_simulationnode.scenario_node_id) \
                INNER JOIN api_node \
                    ON (api_node.id = api_scenarionode.node_id) \
                INNER JOIN api_dataentry_groups \
                    ON (api_dataentry.id = api_dataentry_groups.dataentry_id) \
                INNER JOIN api_group \
                    ON (api_group.id = api_dataentry_groups.group_id) \
                GROUP BY 1, 2, 3, 4, 5, 6, 7 \
                ORDER BY api_dataentry.day ASC;",

            reverse_sql = "DROP VIEW IF EXISTS api_simulationdata"
        ),

        migrations.RunSQL(
            sql = "CREATE VIEW api_rkidata AS \
                SELECT  \
                    api_dataentry.id as id , \
                    api_rkinode_data.rkinode_id as rkinode_id, \
                    api_node.id as node_id, \
                    api_node.name as node_name, \
                    api_dataentry.day as day, \
                    api_dataentry.percentile as percentile, \
                    api_dataentry.data as data, \
                    string_agg(api_group.name, ',') as groups \
                FROM api_dataentry   \
                INNER JOIN api_rkinode_data \
                    ON (api_dataentry.id = api_rkinode_data.dataentry_id) \
                INNER JOIN api_rkinode \
                    ON (api_rkinode.id = api_rkinode_data.rkinode_id) \
                INNER JOIN api_node \
                    ON (api_node.id = api_rkinode.node_id) \
                INNER JOIN api_dataentry_groups \
                    ON (api_dataentry.id = api_dataentry_groups.dataentry_id) \
                INNER JOIN api_group \
                    ON (api_group.id = api_dataentry_groups.group_id) \
                GROUP BY 1, 2, 3, 4, 5, 6, 7 \
                ORDER BY api_dataentry.day ASC;",

            reverse_sql = "DROP VIEW IF EXISTS api_rkidata"
        )
    ]