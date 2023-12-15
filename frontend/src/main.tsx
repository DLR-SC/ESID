import {createRoot} from 'react-dom/client';
import React from 'react';

import App from './App';
import './util/i18n';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
