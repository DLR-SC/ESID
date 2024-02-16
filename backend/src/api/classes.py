# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: Apache-2.0

from datetime import datetime
import collections, functools, itertools, operator
import re

from django.db.models import Q

from rest_framework.response import Response

def map_groups(groups):
    return map(
        # Searches for group names in a list separated by commas
        lambda g: Q(groups__regex=rf"^([^,]*,)*{re.escape(g)}(,[^,]*)*$"), 
        groups
    )


class DataEntryFilterMixin:

    def extract_filters(self, values):
        filters = {
            "day": values.get('day', None),
            "groups": values.get('groups', None),
            "from": values.get('from', None),
            "to": values.get('to', None),
            "nodes": values.get('nodes', None),
            "compartments": values.get('compartments', None),
            "percentile": values.get('percentile', None),
        }

        # remove all keys with value 'None'
        return {k: v for k, v in filters.items() if v is not None}

    def get_filter_context(self):
        
        context = self.extract_filters(self.request.query_params)

        if self.request.data is not None:
            context.update(self.extract_filters(self.request.data))

        if self.kwargs.get('day', None) is not None:
            context["day"] = self.kwargs.get('day', None)

        if context.get("day") is not None:
            context["day"] = datetime.strptime(context["day"], "%Y-%m-%d")

        if context.get("from") is not None:
            context["from"] = datetime.strptime(context["from"], "%Y-%m-%d")

        if context.get("to") is not None:
            context["to"] = datetime.strptime(context["to"], "%Y-%m-%d")

        if context.get("nodes") is not None:
            context["nodes"] = context["nodes"].split(',')

        if context.get("compartments") is not None and isinstance(context["compartments"], str):
            context["compartments"] = context["compartments"].split(',')

        if context.get("groups") is not None and isinstance(context["groups"], str):
            context["groups"] = context["groups"].split(',')

        return context


    def get_serializer_context(self):
        return {**super().get_serializer_context(), **self.get_filter_context()}

    def get_filtered_queryset(self, queryset):
        context = self.get_filter_context()

        queryset = queryset.filter(percentile=context.get('percentile', 50))

        groups = context.get('groups', None)
        if groups is not None:
            if isinstance(groups, list):
                queryset = queryset.filter(
                    functools.reduce(
                        lambda a, b: a | b, 
                        map_groups(groups)
                    )
                )
            elif isinstance(groups, dict):
                categories = groups.keys()
                filter_condition = functools.reduce(
                    lambda a, b: a & b,
                    map(
                        lambda category: functools.reduce(
                            lambda a, b: a | b, 
                            map_groups(groups.get(category))
                        ), 
                        categories
                    )
                )

                queryset = queryset.filter(filter_condition)

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

    def aggregateBy(self, field):
        data = self.paginate_queryset(self.get_queryset())
        serializer = self.get_serializer(data, many=True)

        reduced = []

        for key, group in itertools.groupby(serializer.data, key=lambda x: x[field]):
            entries = list(group)
            reduced.append(dict(entries[0], **{
                "compartments": dict(
                    functools.reduce(
                        operator.add, 
                        map(collections.Counter, list([g['compartments'] for g in entries]))
                    )
                )
            }))

        return self.get_paginated_response(reduced)

    def paginate_queryset(self, queryset):
        if 'all' in self.request.query_params:
            return queryset

        return super().paginate_queryset(queryset)

    def get_paginated_response(self, data):
        if 'all' in self.request.query_params:
            return Response(data)
        else:
            return super().get_paginated_response(data)