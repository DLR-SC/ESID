// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import React, {Suspense, useEffect} from 'react';
import {Provider} from 'react-redux';

import './App.scss';

import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import {Store, Persistor} from './store';
import Box from '@mui/material/Box';
import {ThemeProvider} from '@mui/material/styles';
import Theme from './util/Theme';
import {PersistGate} from 'redux-persist/integration/react';
import {useAppDispatch, useAppSelector} from './store/hooks';
import {selectDistrict} from './store/DataSelectionSlice';
import {useTranslation} from 'react-i18next';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {I18nextProvider, useTranslation} from 'react-i18next';
import i18n from './util/i18n';

/**
 * This is the root element of the React application. It divides the main screen area into the three main components.
 * The top bar, the sidebar and the main content area.
 */
export default function App(): JSX.Element {
  return (
    <Suspense fallback='loading'>
      <Provider store={Store}>
        <ThemeProvider theme={Theme}>
          <PersistGate loading={null} persistor={Persistor}>
            <MUILocalization>
              <Initializer />
              <Box id='app' display='flex' flexDirection='column' sx={{height: '100%', width: '100%'}}>
                <TopBar />
                <Box
                  id='app-content'
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexGrow: 1,
                    alignItems: 'stretch',
                    width: '100%',
                  }}
                >
                  <Sidebar />
                  <MainContent />
                </Box>
              </Box>
            </MUILocalization>
          </PersistGate>
        </ThemeProvider>
      </Provider>
    </Suspense>
  );
}

/**
 * This component serves to initialize state, that is required for the whole application and has no other responsible
 * component.
 */
function Initializer() {
  const {t} = useTranslation();
  const selectedDistrict = useAppSelector((state) => state.dataSelection.district);
  const dispatch = useAppDispatch();

  // This effect ensures, that we get the correct translation for 'germany'. This is required, as the store initializes
  // before the translations are available.
  useEffect(() => {
    if (selectedDistrict.ags === '00000' && selectedDistrict.name === '') {
      dispatch(selectDistrict({ags: '00000', name: t('germany'), type: ''}));
    }
  }, [selectedDistrict, t, dispatch]);

  return null;
}

function MUILocalization(props: {children: string | JSX.Element | JSX.Element[]}): JSX.Element {
  const {i18n} = useTranslation();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} locale={i18n.language}>
      {props.children}
    </LocalizationProvider>
  );
}
