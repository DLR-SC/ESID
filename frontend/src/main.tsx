import ReactDOM from 'react-dom';
import React from 'react';
import App from './App';

import './util/i18n';
import reactAxe from '@axe-core/react';

if (process.env.NODE_ENV !== 'production') {
  console.warn('This is a development version. Do not release this!');
  void reactAxe(React, ReactDOM, 2000);
}

ReactDOM.render(<App />, document.getElementById('root'));
