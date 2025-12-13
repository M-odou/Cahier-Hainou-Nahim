import React, { useState } from 'react';
import { db } from '../services/db';
import { Role, User } from '../types';
import { Shield, Plus, Lock, CheckCircle, XCircle } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New User Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VIEWER' as Role
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    db.addUser({
      ...formData,
      active: true
    });
    setUsers(db.getUsers());
    setShowAddForm(false);
    setFormData({ name: '', email: '', password: '', role: 'VIEWER' });
  };

  const toggleStatus = (id: string) => {
    db.toggleUserStatus(id);
    setUsers(db.getUsers());
  };

  const handleRoleChange = (id: string, newRole: string) => {
    db.updateUserRole(id, newRole as Role);
    setUsers(db.getUsers());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Gestion des Utilisateurs</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl flex items-center text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} className="mr-2" />
          <span className="hidden sm:inline">{showAddForm ? 'Annuler' : 'Ajouter un utilisateur'}</span>
          <span className="sm:hidden">{showAddForm ? 'Annuler' : 'Ajouter'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-cardbg p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 mb-6 max-w-2xl">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">Nouvel Utilisateur</h3>
          <form onSubmit={handleAddUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Nom complet</label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Mot de passe</label>
                <input 
                  type="password" 
                  required
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Rôle</label>
                <select 
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as Role})}
                >
                  <option value="VIEWER">Consultation (Viewer)</option>
                  <option value="ADMIN">Admin / Finance</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button 
                type="submit"
                className="w-full sm:w-auto bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all"
              >
                Créer le compte
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-cardbg rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-cardbg divide-y divide-slate-100 dark:divide-slate-700/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-sm border border-slate-300 dark:border-slate-600">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      className="text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-1.5 outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={user.role === 'SUPER_ADMIN' && user.id === '1'} 
                    >
                      <option value="VIEWER">Consultation</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {user.active ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20">
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.role !== 'SUPER_ADMIN' && (
                      <button 
                        onClick={() => toggleStatus(user.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border ${user.active ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10' : 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                      >
                        {user.active ? 'Désactiver' : 'Activer'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;