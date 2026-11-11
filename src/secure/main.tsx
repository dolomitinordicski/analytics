import React from 'react';
import ReactDOM from 'react-dom/client';
import { SecureAnalyticsPreview } from './SecureAnalyticsPreview';
import { initDNSAnalyticsFoundation } from '../services/foundation';
import '../styles/index.css';

const foundation = initDNSAnalyticsFoundation();
document.documentElement.dataset.analyticsLanguage = foundation.getLanguage();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><SecureAnalyticsPreview /></React.StrictMode>,
);
