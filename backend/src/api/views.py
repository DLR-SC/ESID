# Create your views here.
from rest_framework.response import Response
from .serializers import InterventionSerializer, NodeSerializer, RestrictionSerializer, ScenarioSerializerFull, ScenarioSerializerMeta, SimulationModelSerializerFull, SimulationModelSerializerMeta, RKIEntrySerializer, RKICountySerializer
from .models import Intervention, Node, Restriction, Scenario, SimulationModel, RKIEntry, RKICounty
from rest_framework import viewsets, permissions, mixins
from rest_pandas import PandasViewSet, PandasSerializer
from django.db.models import Sum, F, Window

class RestrictionsViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Restriction.objects.all().order_by('name')
    serializer_class = RestrictionSerializer
    permission_classes = [permissions.IsAuthenticated]

class NodesViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Node.objects.all().order_by('id')
    serializer_class = NodeSerializer
    permission_classes = [permissions.IsAuthenticated]

class ScenarioViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Scenario.objects.all().order_by('id')
    permission_classes = [permissions.IsAuthenticated]

    serializers = {'list': ScenarioSerializerMeta, 'retrieve': ScenarioSerializerFull}

    def get_serializer_class(self):
        return self.serializers.get(self.action, ScenarioSerializerMeta)


class SimulationModelViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = SimulationModel.objects.all().order_by('name')
    permission_classes = [permissions.IsAuthenticated]

    serializers = {'list': SimulationModelSerializerMeta, 'retrieve': SimulationModelSerializerFull}

    def get_serializer_class(self):
        return self.serializers.get(self.action, ScenarioSerializerMeta)


class RKIViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):

    serializer_class = RKIEntrySerializer
    lookup_field = "county"

    def get_queryset(self):
        window = {
            'partition_by': [F('id_landkreis')],
            'order_by': F('refdatum').asc(),
        }

        queryset = RKIEntry.objects\
                .only('id_landkreis', 'refdatum')\
                .distinct('id_landkreis', 'refdatum')\
                .annotate(
                    infectious=Window(
                        expression=Sum('anzahl_fall'),
                        **window
                    ),
                    deaths=Window(
                        expression=Sum('anzahl_todesfall'), 
                        **window
                    ),
                    recovered=Window(
                        expression=Sum('anzahl_genesen'),
                        **window
                    )
                )\
                .order_by('id_landkreis', 'refdatum')

        return queryset

    def retrieve(self, request, **kwargs):
        timesteps = list(self.get_queryset().filter(id_landkreis=kwargs.get('county')[-4:]))
        county = RKICounty(kwargs.get('county'), timesteps)

        return Response(data=RKICountySerializer(county).data)
