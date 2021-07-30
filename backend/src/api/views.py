# Create your views here.
from rest_framework.response import Response
from .models import Intervention, Node, Restriction, Scenario, SimulationModel, RKIEntry, RKICounty, RKIDay
from rest_framework import viewsets, permissions, mixins
from rest_pandas import PandasViewSet, PandasSerializer
from django.db.models import Sum, F, Window
import src.api.serializers as serializers

class RestrictionsViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Restriction.objects.all().order_by('name')
    serializer_class = serializers.RestrictionSerializer
    permission_classes = [permissions.AllowAny]

class NodesViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Node.objects.all().order_by('id')
    serializer_class = serializers.NodeSerializer
    permission_classes = [permissions.AllowAny]

class ScenarioViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Scenario.objects.all().order_by('id')
    permission_classes = [permissions.AllowAny]

    serializers_ = {'list': serializers.ScenarioSerializerMeta, 'retrieve': serializers.ScenarioSerializerFull}

    def get_serializer_class(self):
        return self.serializers_.get(self.action, ScenarioSerializerMeta)


class SimulationModelViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = SimulationModel.objects.all().order_by('name')
    permission_classes = [permissions.AllowAny]

    serializers_ = {'list': serializers.SimulationModelSerializerMeta, 'retrieve': serializers.SimulationModelSerializerFull}

    def get_serializer_class(self):
        return self.serializers_.get(self.action, ScenarioSerializerMeta)


class RKIByCountyViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):

    serializer_class = serializers.RKICountyEntrySerializer
    permission_classes = [permissions.AllowAny]
    # pagination_class = None
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

        return Response(data=serializers.RKICountySerializer(county).data)


class RKIByDayViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):

    serializer_class = serializers.RKIDayEntrySerializer
    permission_classes = [permissions.AllowAny]
    # pagination_class = None
    lookup_field = "day"

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
        counties = list(self.get_queryset().filter(refdatum=kwargs.get('day')))
        day = RKIDay(kwargs.get('day'), counties)

        return Response(data=serializers.RKIDaySerializer(day).data)