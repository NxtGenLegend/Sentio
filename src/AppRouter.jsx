import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import ClientLayout from './pages/client/ClientLayout';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main app routes */}
        <Route path="/*" element={<App />} />

        {/* Client-specific routes with internal navigation */}
        <Route path="/client/:clientId/*" element={<ClientLayout />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
