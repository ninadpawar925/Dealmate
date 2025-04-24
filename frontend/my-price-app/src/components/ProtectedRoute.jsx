
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store';


function ProtectedRoute({ children }) {
  
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const location = useLocation();
  console.log(`ProtectedRoute Render: isLoggedIn = ${isLoggedIn}, Path = ${location.pathname}`); 
  
  console.log(`ProtectedRoute Render: isLoggedIn = ${isLoggedIn}, Path = ${location.pathname}`);

  
  
  if (!isLoggedIn) {
    console.log("ProtectedRoute: Not logged in, redirecting to login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export default ProtectedRoute;