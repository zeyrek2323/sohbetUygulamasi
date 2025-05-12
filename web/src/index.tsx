import React from 'react';
import ReactDOM from 'react-dom/client';
import MainApp from './MainApp';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
); 