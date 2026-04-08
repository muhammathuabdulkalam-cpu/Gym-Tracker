import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.name || !user.age) return <Navigate to="/onboarding" replace />;

  return children;
};

export default ProtectedRoute;
