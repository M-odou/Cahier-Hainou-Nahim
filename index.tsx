import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Contributions from './components/Contributions';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';
import DahiraEvents from './components/DahiraEvents';
import { User } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  // Application State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to Light Mode
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Apply theme class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard'); // Reset to dashboard on login
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'events':
        return <DahiraEvents currentUser={currentUser!} />;
      case 'members':
        return <Members />;
      case 'contributions':
        if (!currentUser) return null;
        return <Contributions currentUser={currentUser} />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-darkbg text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <Sidebar 
        currentUser={currentUser} 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsMobileSidebarOpen(false); // Close sidebar on mobile when navigating
        }}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className="flex-1 w-full md:ml-64 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
           <div className="flex items-center">
             <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold mr-3 text-sm">HN</div>
             <h1 className="text-lg font-bold text-slate-800 dark:text-white">Cahier Hainou Nahim</h1>
           </div>
           <button 
             onClick={() => setIsMobileSidebarOpen(true)} 
             className="p-2 -mr-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
           >
             <Menu size={24} />
           </button>
        </div>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto pb-10">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);