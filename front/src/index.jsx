import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter } from 'react-router-dom';

import 'animate.css';
import './static/css/tailwind.css';
import './static/css/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HashRouter>
    <App />
  </HashRouter>
);
