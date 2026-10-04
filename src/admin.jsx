import React from 'react';
import ReactDOM from 'react-dom/client';
import PsychologistDashboard from './components/PsychologistDashboard';
import './index.css';

ReactDOM.createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode>
    <PsychologistDashboard isOpen={true} isStandalonePage={true} />
  </React.StrictMode>
);
