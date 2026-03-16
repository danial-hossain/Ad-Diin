import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  try {
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!token || !user || user.role !== 'admin') {
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/admin/login" replace />;
    }
    
    return <>{children}</>;
  } catch (error) {
    // Handle corrupted user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/admin/login" replace />;
  }
}