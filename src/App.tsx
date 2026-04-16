import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import POS from './components/POS';
import TransactionHistory from './components/TransactionHistory';
import Reports from './components/Reports';
import CustomerMarketplace from './components/CustomerMarketplace';
import Auth from './components/Auth';
import { seedDatabase, type User } from './lib/db';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'admin' | 'customer'>('admin');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    seedDatabase();
    // Check session storage for existing user
    const savedUser = sessionStorage.getItem('soleflow_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setViewMode(user.role);
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setViewMode(user.role);
    sessionStorage.setItem('soleflow_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('soleflow_user');
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  if (viewMode === 'customer') {
    return (
      <CustomerMarketplace 
        onViewModeChange={() => setViewMode('admin')} 
        onLogout={handleLogout}
        user={currentUser}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManagement />;
      case 'pos':
        return <POS />;
      case 'history':
        return <TransactionHistory />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSwitchView={() => setViewMode('customer')} 
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={currentUser} />
        
        <main className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
