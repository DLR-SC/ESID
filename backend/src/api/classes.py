from datetime import datetime
class DataEntryFilterMixin:

    def get_filter_context(self):
        context = {}
        context["group"] = self.kwargs.get('group', None)
        context["day"] = self.kwargs.get('day', self.request.query_params.get('day', None))

        context["from"] = self.request.query_params.get('from', None)
        context["to"] = self.request.query_params.get('to', None)

        context["nodes"] = self.request.query_params.get('nodes', None)

        context["compartments"] = self.request.query_params.get('compartments', None)
        context["percentile"] = self.request.query_params.get('percentile', 50)

        if context["day"] is not None:
            context["day"] = datetime.strptime(context["day"], "%Y-%m-%d")

        if context["from"] is not None:
            context["from"] = datetime.strptime(context["from"], "%Y-%m-%d")

        if context["to"] is not None:
            context["to"] = datetime.strptime(context["to"], "%Y-%m-%d")

        if context["nodes"] is not None:
            context["nodes"] = context["nodes"].split(',')

        if context["compartments"] is not None:
            context["compartments"] = context["compartments"].split(',')

        return context


    def get_serializer_context(self):
        return {**super().get_serializer_context(), **self.get_filter_context()}


    def get_filtered_queryset(self, queryset):
        context = self.get_filter_context()

        queryset = queryset.filter(percentile=context.get('percentile', 50))

        group = context.get('group', None)
        if group is not None:
            queryset = queryset.filter(group=group)

        day = context.get('day', None)
        from_ = context.get('from', None)
        to = context.get('to', None)
        
        if day is not None:
            queryset = queryset.filter(day=day)
        
        if day is None and from_ is not None:
            queryset = queryset.filter(day__gte=from_)

        if day is None and to is not None:
            queryset = queryset.filter(day__lte=to)

        return queryset
