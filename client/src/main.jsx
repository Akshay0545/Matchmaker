import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#fff', color: '#1e293b', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' },
          success: { iconTheme: { primary: '#e11d48', secondary: '#fff' } }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
