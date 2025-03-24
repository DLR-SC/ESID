// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {Suspense} from 'react';
import {Provider} from 'react-redux';

import './App.scss';
import '../node_modules/dc/dist/style/dc.css'; //needed for statistical dashboard

import TopBar from './components/TopBar';
import SidebarContainer from './components/Sidebar/SidebarContainer';
import MainContent from './components/MainContent';
import {Store} from './store';
import Box from '@mui/material/Box';
import {ThemeProvider} from '@mui/material/styles';
import Theme from './util/Theme';
import {I18nextProvider} from 'react-i18next';
import i18n from './util/i18n';
import {PandemosProvider} from 'data_sockets/PandemosContext';

/**
 * This is the root element of the React application. It divides the main screen area into the three main components.
 * The top bar, the sidebar and the main content area.
 */
export default function App(): JSX.Element {
  return (
    <Suspense fallback='loading'>
      <Provider store={Store}>
        <ThemeProvider theme={Theme}>
          <I18nextProvider i18n={i18n}>
            <PandemosProvider>
              <Box id='app' display='flex' flexDirection='column' sx={{height: '100vh', width: '100vw'}}>
                <TopBar />
                <Box
                  id='app-content'
                  sx={{
                    // Self
                    flexGrow: 1,
                    width: '100%',

                    // Child Layout
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    overflow: 'hidden',
                  }}
                >
                  <SidebarContainer />
                  <MainContent />
                </Box>
              </Box>
            </PandemosProvider>
          </I18nextProvider>
        </ThemeProvider>
      </Provider>
    </Suspense>
  );
}
