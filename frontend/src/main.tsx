import {createRoot} from 'react-dom/client';
import React from 'react';

import App from './App';
import './util/i18n';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<App />);
}
