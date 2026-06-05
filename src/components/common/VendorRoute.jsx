import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const VendorRoute = ({ children }) => {
  const { isAuth, user } = useAuthStore();

  if (!isAuth) return <Navigate to="/login" replace />;
  if (!['vendor', 'admin'].includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default VendorRoute;
