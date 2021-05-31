import React, {Suspense} from 'react';

import './App.scss';

import {Box} from '@material-ui/core';

import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

/**
 * This is the root element of the React application. It divides the main screen area into the three main components.
 * The top bar, the side bar and the main content area.
 */
export default function App(): JSX.Element {
  return (
    <Suspense fallback='loading'>
      <Box id='app' display='flex' flexDirection='column' style={{height: '100%'}}>
        <TopBar />
        <Box display='flex' flexDirection='row' flexGrow={1}>
          <Sidebar />
          <MainContent />
        </Box>
      </Box>
    </Suspense>
  );
}
