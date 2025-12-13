import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  FileText, 
  ShieldCheck, 
  LogOut,
  CalendarCheck,
  Moon,
  Sun,
  X
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isOpen: boolean;       // Prop for mobile visibility
  onClose: () => void;   // Prop to close on mobile
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeTab, onTabChange, onLogout, isDarkMode, toggleTheme, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'VIEWER'] },
    { id: 'events', label: 'Événements', icon: CalendarCheck, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'members', label: 'Membres', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'contributions', label: 'Cotisations', icon: Wallet, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'reports', label: 'Rapports', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'VIEWER'] },
    { id: 'users', label: 'Gestion Accès', icon: ShieldCheck, roles: ['SUPER_ADMIN'] },
  ];

  return (
    <>
      <div 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-primary text-slate-600 dark:text-slate-100 flex flex-col h-full shadow-2xl border-r border-slate-200 dark:border-white/10 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-black/10 transition-colors duration-300 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-primary dark:text-white tracking-tight">Cahier Hainou nahim</h2>
            <div className="inline-block px-2 py-0.5 mt-2 rounded bg-primary/10 dark:bg-white/10 border border-primary/10 dark:border-white/10">
              <p className="text-[10px] text-primary dark:text-blue-200 uppercase tracking-wider font-bold">Espace {currentUser.role}</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 dark:text-blue-200/50 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            if (!item.roles.includes(currentUser.role)) return null;
            
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary dark:bg-white text-white dark:text-primary shadow-lg' 
                    : 'text-slate-500 dark:text-blue-100/70 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white dark:text-primary' : 'text-slate-400 dark:text-blue-300/70 group-hover:text-primary dark:group-hover:text-white'} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-black/10 transition-colors duration-300">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2 mb-4 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-600 dark:text-blue-100 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <span className="font-medium">Mode {isDarkMode ? 'Sombre' : 'Clair'}</span>
            {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-white/10 border border-primary/10 dark:border-white/20 flex items-center justify-center font-bold text-primary dark:text-white">
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-700 dark:text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 dark:text-blue-200/70 truncate">{currentUser.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-slate-200 dark:border-white/20 rounded-lg text-sm text-slate-500 dark:text-blue-100 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-200 hover:border-red-100 dark:hover:border-red-500/30 transition-colors"
          >
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;