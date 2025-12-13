import React, { useState } from 'react';
import { db } from '../services/db';
import { Gender, Member } from '../types';
import { Plus, Search, Filter, X, MessageCircle } from 'lucide-react';

const Members: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'ADD'>('LIST');
  const [members, setMembers] = useState<Member[]>(db.getMembers());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<string>('ALL');

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    gender: Gender.Male,
    annualGoal: 12000
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    db.addMember(formData);
    setMembers(db.getMembers());
    setView('LIST');
    // Reset form
    setFormData({ firstName: '', lastName: '', phone: '', gender: Gender.Male, annualGoal: 12000 });
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = filterGender === 'ALL' || m.gender === filterGender;
    return matchesSearch && matchesGender;
  });

  const getPaidAmount = (m: Member) => m.contributions.reduce((acc, c) => acc + c.amount, 0);

  const sendWhatsAppReport = (member: Member) => {
    const paid = getPaidAmount(member);
    const remaining = Math.max(0, member.annualGoal - paid);
    
    // Clean phone number (remove spaces)
    let phone = member.phone.replace(/\s+/g, '');
    
    // Add default country code 221 (Senegal) if it starts with 7 and length is 9
    if (phone.length === 9 && (phone.startsWith('7') || phone.startsWith('3'))) {
      phone = '221' + phone;
    }

    const message = `As-salamu alaykum *${member.firstName} ${member.lastName}*.\n\nVoici votre situation pour le *Cahier Hainou nahim* :\n\n🔹 *Objectif Annuel :* ${member.annualGoal.toLocaleString()} FCFA\n✅ *Déjà Cotisé :* ${paid.toLocaleString()} FCFA\n⚠️ *Reste à payer :* ${remaining.toLocaleString()} FCFA\n\nMerci pour votre engagement !`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Membres</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gérez l'annuaire du Dahira</p>
        </div>
        {view === 'LIST' ? (
          <button 
            onClick={() => setView('ADD')}
            className="w-full sm:w-auto bg-primary hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl flex items-center justify-center text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            <Plus size={18} className="mr-2" />
            Nouveau Membre
          </button>
        ) : (
          <button 
            onClick={() => setView('LIST')}
            className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-5 py-2.5 rounded-xl flex items-center justify-center text-sm font-medium transition-colors"
          >
            <X size={18} className="mr-2" />
            Annuler
          </button>
        )}
      </div>

      {view === 'ADD' && (
        <div className="bg-white dark:bg-cardbg p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto animate-fade-in-up">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">Ajouter un nouveau membre</h3>
          <form onSubmit={handleAddMember} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Prénom</label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Ex: Moussa"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Nom</label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Ex: Diop"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Téléphone</label>
                <input 
                  type="tel" 
                  required
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="Ex: 77 000 00 00"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Sexe</label>
                <select 
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
                >
                  <option value={Gender.Male}>Homme</option>
                  <option value={Gender.Female}>Femme</option>
                  <option value={Gender.Boy}>Enfant (Garçon)</option>
                  <option value={Gender.Girl}>Enfant (Fille)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Cotisation Annuelle (Objectif)</label>
              <input 
                type="number" 
                required
                min="0"
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                value={formData.annualGoal}
                onChange={e => setFormData({...formData, annualGoal: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="pt-6 flex justify-end">
              <button 
                type="submit"
                className="w-full sm:w-auto bg-primary hover:bg-blue-900 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
              >
                Enregistrer le membre
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'LIST' && (
        <div className="bg-white dark:bg-cardbg rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          {/* Filters */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom..."
                className="pl-10 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <Filter size={18} className="text-slate-400 dark:text-slate-500 hidden sm:block" />
              <select 
                className="w-full md:w-auto rounded-xl border border-slate-300 dark:border-slate-600 py-2.5 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300"
                value={filterGender}
                onChange={e => setFilterGender(e.target.value)}
              >
                <option value="ALL">Tous les sexes</option>
                <option value={Gender.Male}>Hommes</option>
                <option value={Gender.Female}>Femmes</option>
                <option value={Gender.Boy}>Garçons</option>
                <option value={Gender.Girl}>Filles</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Membre</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Sexe</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Téléphone</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Objectif</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payé</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Restant</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Progression</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-cardbg divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => {
                    const paid = getPaidAmount(member);
                    const remaining = member.annualGoal - paid;
                    const percent = Math.min((paid / member.annualGoal) * 100, 100);
                    
                    let badgeClass = 'bg-slate-50 text-slate-700 border-slate-100';
                    if (member.gender === Gender.Male) badgeClass = 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20';
                    else if (member.gender === Gender.Female) badgeClass = 'bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20';
                    else if (member.gender === Gender.Boy) badgeClass = 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20';
                    else if (member.gender === Gender.Girl) badgeClass = 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20';

                    return (
                      <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">{member.firstName} {member.lastName}</div>
                          <div className="text-xs text-slate-500 sm:hidden mt-0.5">{member.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-bold rounded-lg ${badgeClass}`}>
                            {member.gender}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{member.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600 dark:text-slate-400 hidden sm:table-cell">{member.annualGoal.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-emerald-600 dark:text-emerald-400">{paid.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-500 dark:text-red-400 hidden lg:table-cell">{Math.max(remaining, 0).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center hidden sm:table-cell">
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 max-w-[100px] mx-auto overflow-hidden">
                            <div className="bg-primary dark:bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-medium">{Math.round(percent)}%</span>
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button 
                            onClick={() => sendWhatsAppReport(member)}
                            className="p-2 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                            title="Envoyer le bilan par WhatsApp"
                          >
                            <MessageCircle size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      Aucun membre trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;