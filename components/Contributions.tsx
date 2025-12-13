import React, { useState, useMemo, useRef } from 'react';
import { db } from '../services/db';
import { Member, User } from '../types';
import { Check, Search, Calendar, History, X, User as UserIcon } from 'lucide-react';

interface ContributionsProps {
  currentUser: User;
}

const Contributions: React.FC<ContributionsProps> = ({ currentUser }) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // To force re-render of history
  
  const dateInputRef = useRef<HTMLInputElement>(null);

  const members = db.getMembers();
  
  // Recent History Data
  const history = useMemo(() => {
    const all = db.getAllContributions();
    // Sort descending by date
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }, [refreshTrigger, isSuccess]);

  const filteredMembers = searchTerm.length > 0 
    ? members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setSearchTerm('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !amount) return;

    db.addContribution({
      memberId: selectedMember.id,
      amount: Number(amount),
      date: date,
      recordedBy: currentUser.id
    });

    setIsSuccess(true);
    setAmount('');
    setSelectedMember(null);
    setRefreshTrigger(prev => prev + 1);
    
    // Reset success msg after 3s
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const getMemberName = (id: string) => {
    const m = members.find(x => x.id === id);
    return m ? `${m.firstName} ${m.lastName}` : 'Inconnu';
  };

  const getUserName = (id: string) => {
    const u = db.getUsers().find(x => x.id === id);
    return u ? u.name : 'Système';
  };

  // Calculations for selected member
  const selectedMemberStats = useMemo(() => {
    if(!selectedMember) return null;
    const paid = selectedMember.contributions.reduce((acc, c) => acc + c.amount, 0);
    return {
      paid,
      remaining: selectedMember.annualGoal - paid
    };
  }, [selectedMember, refreshTrigger]);

  const handleDateIconClick = () => {
    if (dateInputRef.current) {
        try {
            if (typeof dateInputRef.current.showPicker === 'function') {
                dateInputRef.current.showPicker();
            } else {
                dateInputRef.current.focus();
            }
        } catch (error) {
            console.warn("showPicker failed, falling back to focus", error);
            dateInputRef.current.focus();
        }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Form */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Cotisations</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Enregistrement des paiements</p>
        </div>
        
        {isSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl relative flex items-center shadow-lg animate-pulse">
            <div className="bg-emerald-200 dark:bg-emerald-500/20 rounded-full p-1 mr-3">
               <Check size={16} />
            </div>
            <span className="block sm:inline font-medium">Cotisation enregistrée avec succès !</span>
          </div>
        )}

        <div className="bg-white dark:bg-cardbg p-6 md:p-8 rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Member Search */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Rechercher le membre</label>
              
              {selectedMember ? (
                <div className="flex items-center justify-between p-4 bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-xl">
                  <div className="flex items-center">
                    <div className="bg-primary/10 dark:bg-primary/20 p-2.5 rounded-full mr-3 text-primary dark:text-blue-300">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-lg">{selectedMember.firstName} {selectedMember.lastName}</p>
                      <p className="text-xs text-slate-500 dark:text-blue-200/70">{selectedMember.phone}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="pl-10 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Commencez à taper un nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm.length > 0 && (
                    <div className="absolute z-10 w-full bg-white dark:bg-slate-800 mt-2 border border-slate-200 dark:border-slate-600 rounded-xl shadow-2xl max-h-60 overflow-auto">
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map(m => (
                          <button
                            key={m.id}
                            type="button"
                            className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 last:border-0 text-slate-800 dark:text-slate-200 transition-colors"
                            onClick={() => handleSelectMember(m)}
                          >
                            <span className="font-bold">{m.firstName} {m.lastName}</span>
                            <span className="text-slate-500 text-xs ml-2">({m.phone})</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-500">Aucun membre trouvé</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedMember && selectedMemberStats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Objectif</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-lg mt-1">{selectedMember.annualGoal.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl text-center border border-emerald-100 dark:border-emerald-500/20">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">Déjà payé</p>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400 text-lg mt-1">{selectedMemberStats.paid.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-xl text-center border border-red-100 dark:border-red-500/20">
                  <p className="text-[10px] text-red-500 dark:text-red-400 uppercase tracking-wider font-bold">Reste</p>
                  <p className="font-bold text-red-600 dark:text-red-400 text-lg mt-1">{Math.max(selectedMemberStats.remaining, 0).toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Montant (FCFA)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 py-3 px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Ex: 5000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Date</label>
                <div className="relative group">
                   <div 
                     className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer z-10"
                     onClick={handleDateIconClick}
                   >
                    <Calendar size={18} className="text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors hover:text-primary dark:hover:text-white" />
                  </div>
                  <input
                    ref={dateInputRef}
                    type="date"
                    required
                    className="pl-10 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:[color-scheme:dark]"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
              <button
                type="submit"
                disabled={!selectedMember || !amount}
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all
                  ${!selectedMember || !amount ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-primary hover:bg-blue-900 shadow-blue-900/20'}`}
              >
                Valider la cotisation
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: Recent History */}
      <div className="lg:col-span-1">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center pt-2">
          <History size={20} className="mr-2 text-slate-400" />
          Dernières opérations
        </h3>
        
        <div className="bg-white dark:bg-cardbg rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {history.length > 0 ? (
              history.map((item) => (
                <li key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{getMemberName(item.memberId)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(item.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                      +{item.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-slate-400 dark:text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mr-2"></div>
                    Par {getUserName(item.recordedBy)}
                  </div>
                </li>
              ))
            ) : (
              <li className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                Aucune cotisation récente.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Contributions;