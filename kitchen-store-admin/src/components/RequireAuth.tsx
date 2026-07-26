import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ADMIN_TOKEN_KEY } from '../lib/api';
import { AdminRole, getCurrentAdminUser } from '../lib/auth';

interface RequireAuthProps {
  children: React.ReactElement;
  allowedRoles?: AdminRole[];
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const user = getCurrentAdminUser();

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles?.length) {
    if (user.role !== 'admin' && user.role !== 'seller') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return children;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default RequireAuth;
