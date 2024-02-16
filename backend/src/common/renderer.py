# SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
# SPDX-License-Identifier: Apache-2.0

from djangorestframework_camel_case.render import CamelCaseJSONRenderer, CamelCaseBrowsableAPIRenderer

class CustomCamelCaseJSONRenderer(CamelCaseJSONRenderer):

    def render(self, data, accepted_media_type=None, renderer_context=None):

        # if data is not a dict or does not contain 'results' key, wrap in new dict with 'results' key
        if (data is not None) and ((not isinstance(data, dict)) or (isinstance(data, dict) and data.get('results') is None) ):
            data = {'results': data}

        return super().render(data, accepted_media_type, renderer_context)


class CustomCamelCaseBrowsableAPIRenderer(CamelCaseBrowsableAPIRenderer):

    def render(self, data, accepted_media_type=None, renderer_context=None):

        # if data is not a dict or does not contain 'results' key, wrap in new dict with 'results' key
        if (data is not None) and ((not isinstance(data, dict)) or (isinstance(data, dict) and data.get('results') is None) ):
            data = {'results': data}

        return super().render(data, accepted_media_type, renderer_context)