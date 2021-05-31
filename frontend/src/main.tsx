import ReactDOM from 'react-dom';
import React from 'react';
import App from './App';

import './util/i18n';

if (process.env.NODE_ENV !== 'production') {
  console.warn('This is a development version. Do not release this!');
}

ReactDOM.render(<App />, document.getElementById('root'));
