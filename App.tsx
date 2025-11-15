import React from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/LoginScreen';
import { EmployeePortal } from './components/EmployeePortal';
import { AdminApp } from './components/AdminApp';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (user.userType === 'employee') {
    return <EmployeePortal />;
  }

  return <AdminApp />;
};

export default App;