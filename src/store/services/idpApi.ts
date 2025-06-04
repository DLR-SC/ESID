// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {RealmRepresentation} from 'types/realmRepresentation';

export const idpApi = createApi({
  reducerPath: 'idpApi',
  baseQuery: fetchBaseQuery({baseUrl: `${import.meta.env.VITE_IDP_API_URL || ''}/`}),
  endpoints: (build) => ({
    getRealms: build.query<RealmRepresentation[], void>({
      query: () => `realms`,
    }),
  }),
});

export const {useLazyGetRealmsQuery} = idpApi;
