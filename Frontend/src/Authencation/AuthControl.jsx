import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useUserContext from '@/hooks/useUserContext'; 
import { useAlert } from "@/UserContext/AlertContext"

const ProtectedRoute = ({ children }) => {
  const { CurrentUser } = useUserContext();
  const { setAlert } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    if (!CurrentUser) {
      setAlert({ type: 'error', message: 'Please login to continue' });
    }
  }, [CurrentUser, setAlert]);

  if (!CurrentUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
