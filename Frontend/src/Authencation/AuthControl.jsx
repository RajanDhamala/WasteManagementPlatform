import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useStore from '@/ZustandStore/UserStore';

const ProtectedRoute = ({ children }) => {
  const CurrentUser = useStore((state) => state.CurrentUser);
  const setAlert = useStore((state) => state.setAlert);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise((res) => setTimeout(res, 50));
      setChecking(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!checking && !CurrentUser) {
      setAlert({ type: 'error', message: 'Login is required for access. Sorry :)' });
    }
  }, [checking, CurrentUser, setAlert]);

  if (checking) {
    return <div className="text-center p-4">Checking auth...</div>; 
  }

  if (!CurrentUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
