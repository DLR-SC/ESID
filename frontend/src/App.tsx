import ReactDOM from 'react-dom';
import React from 'react';

import './App.scss';

import {Box} from '@material-ui/core';

import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

if (process.env.NODE_ENV !== 'production') {
  console.warn('This is a development version. Do not release this!');
}

ReactDOM.render(
  <Box id={'root'} display={'flex'} flexDirection={'column'}>
    <TopBar />
    <Box display={'flex'} flexDirection={'row'} flexGrow={1}>
      <Sidebar />
      <MainContent />
    </Box>
  </Box>,
  document.body
);
