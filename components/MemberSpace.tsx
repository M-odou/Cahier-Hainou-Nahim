import React, { useMemo } from 'react';
import { db } from '../services/db';
import { User } from '../types';
import { Wallet, Target, Clock, AlertCircle, History, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface MemberSpaceProps {
  currentUser: User;
}

const MemberSpace: React.FC<MemberSpaceProps> = ({ currentUser }) => {
  const member = useMemo(() => {
    if (!currentUser.memberId) return null;
    return db.getMemberById(currentUser.memberId);
  }, [currentUser]);

  const stats = useMemo(() => {
    if (!member) return null;
    const paid = member.contributions.reduce((acc, c) => acc + c.amount, 0);
    const remaining = Math.max(0, member.annualGoal - paid);
    const percent = Math.min((paid / member.annualGoal) * 100, 100);
    
    return { paid, remaining, percent };
  }, [member]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Payé', value: stats.paid, color: '#10b981' }, // Emerald
      { name: 'Restant', value: stats.remaining, color: '#ef4444' } // Red
    ];
  }, [stats]);

  if (!member || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-full mb-4">
            <AlertCircle size={48} className="text-orange-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Compte non lié</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          Votre compte utilisateur n'est pas encore associé à une fiche membre du Dahira. 
          Veuillez contacter l'administrateur pour lier votre compte.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white dark:bg-cardbg p-6 rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-700/50">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Salam, {member.firstName} 👋
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Voici la situation de vos cotisations pour l'année en cours.</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white shadow-lg shadow-blue-500/30 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
               <span className="text-blue-100 font-medium text-sm uppercase tracking-wider">Objectif Annuel</span>
               <Target className="text-blue-200" size={24} />
            </div>
            <div className="text-3xl font-bold">{member.annualGoal.toLocaleString()} <span className="text-lg font-normal opacity-70">FCFA</span></div>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 transform rotate-12">
            <Target size={120} />
          </div>
        </div>

        <div className="bg-white dark:bg-cardbg p-6 rounded-2xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-700/50">
           <div className="flex items-center justify-between mb-4">
               <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Déjà Cotisé</span>
               <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                 <CheckCircle size={20} />
               </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.paid.toLocaleString()} <span className="text-sm text-slate-400">FCFA</span></div>
            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
               <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.percent}%` }}></div>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">{Math.round(stats.percent)}% de l'objectif atteint</p>
        </div>

        <div className="bg-white dark:bg-cardbg p-6 rounded-2xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-700/50">
           <div className="flex items-center justify-between mb-4">
               <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Reste à payer</span>
               <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg text-red-600 dark:text-red-400">
                 <Wallet size={20} />
               </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.remaining.toLocaleString()} <span className="text-sm text-slate-400">FCFA</span></div>
             <p className="text-xs text-slate-400 mt-4">
               {stats.remaining === 0 
                 ? "Félicitations ! Vous êtes à jour." 
                 : "Continuez vos efforts pour atteindre l'objectif."}
             </p>
        </div>
      </div>

      {/* Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* History List */}
        <div className="lg:col-span-2 bg-white dark:bg-cardbg rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center">
             <History size={20} className="text-primary dark:text-blue-400 mr-2" />
             <h3 className="font-bold text-slate-800 dark:text-white">Historique de vos versements</h3>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            {member.contributions.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold text-right">Montant</th>
                    <th className="px-5 py-3 font-semibold text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {member.contributions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                        {new Date(c.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-800 dark:text-white text-right">
                        {c.amount.toLocaleString()} F
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Confirmé
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                Aucune cotisation enregistrée pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-cardbg rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-700/50 p-6 flex flex-col items-center justify-center">
           <h3 className="font-bold text-slate-800 dark:text-white mb-4 self-start">Progression</h3>
           <div className="w-full h-64">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={chartData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                   stroke="none"
                 >
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip formatter={(value: number) => [`${value.toLocaleString()} FCFA`]} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center text-xs text-slate-600 dark:text-slate-300">
                 <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span> Payé
              </div>
              <div className="flex items-center text-xs text-slate-600 dark:text-slate-300">
                 <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> Restant
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSpace;