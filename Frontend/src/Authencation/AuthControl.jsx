import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useStore from '@/ZustandStore/UserStore';

const ProtectedRoute = ({ children }) => {
const CurrentUser=useStore((state)=>state.CurrentUser)
  const setAlert=useStore((state)=>state.setAlert)

  useEffect(() => {
    if (!CurrentUser) {
      setAlert({ type: 'error', message: 'Login is required for access Sorry :)' });
    }
  }, [CurrentUser, setAlert]);

  if (!CurrentUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
