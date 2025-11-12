// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {RootState} from 'store';

export const utilsApi = createApi({
  reducerPath: 'utilsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL || ''}`,
    prepareHeaders: (headers, {getState}) => {
      const realm = (getState() as RootState).realm;
      const auth = (getState() as RootState).auth;

      if (realm.name && realm.name !== '') {
        headers.set('x-realm', realm.name);
      }

      if (auth.token && auth.token !== '') {
        // headers.set('Authorization', 'Bearer ' + auth.token);
      }
      headers.set('Authorization', 'Bearer ' + 'TODO');
      //headers.set('Content-Type', 'multipart/form-data');

      return headers;
    },
  }),

  endpoints: (build) => ({
    sendCasedataFile: build.query({
      query(file: File) {
        const formData = new FormData();
        console.log('file object for request:', file);
        formData.append('file', file);
        formData.append('type', file.type);
        console.log('formData:', formData);
        return {
          url: `utils/share/casedata`,
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const {useSendCasedataFileQuery} = utilsApi;
