import React from 'react';
import { Navigate } from 'react-router-dom';
import { useLicenseCheck } from '../middleware/licenseMiddleware';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isLicensed = useLicenseCheck();

  if (!isLicensed) {
    return <Navigate to="/activate" replace />;
  }

  return <>{children}</>;
};