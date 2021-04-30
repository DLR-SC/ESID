import React from 'react';

import './App.scss';

import {Box} from '@material-ui/core';

import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

export default function App(): JSX.Element {
  return (
    <Box id="app" display="flex" flexDirection="column">
      <TopBar />
      <Box display="flex" flexDirection="row" flexGrow={1}>
        <Sidebar />
        <MainContent />
      </Box>
    </Box>
  );
}
