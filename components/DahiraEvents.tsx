import React, { useState, useRef, useEffect, useMemo } from 'react';
import { db } from '../services/db';
import { DahiraEvent, User, TourSchedule, Member } from '../types';
import { CalendarCheck, Plus, X, Users, Heart, CalendarDays, History, Save, Trash2, ArrowRight, Search, Calendar as CalendarIcon } from 'lucide-react';

interface DahiraEventsProps {
  currentUser: User;
}

const MemberAutocomplete = ({ members, value, onChange }: { members: Member[], value: string, onChange: (id: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isOpen]);

  const selectedMember = members.find(m => m.id === value);
  const filteredMembers = members.filter(m => 
    `${m.firstName} ${m.lastName} ${m.phone}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative flex-1" ref={wrapperRef}>
       {!isOpen ? (
         <div 
           onClick={() => { setIsOpen(true); setSearchTerm(''); }}
           className={`w-full rounded-xl border p-2.5 text-sm cursor-text flex items-center justify-between transition-all
             ${value 
               ? 'bg-blue-50/50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-slate-800 dark:text-blue-100' 
               : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-400'
             }
           `}
         >
            <span className="truncate font-medium">
               {selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : 'Sélectionner un hôte...'}
            </span>
            {selectedMember ? (
               <button 
                 onClick={(e) => { e.stopPropagation(); onChange(''); }}
                 className="p-1 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-full text-blue-600 dark:text-blue-400"
               >
                  <X size={14} />
               </button>
            ) : (
               <Search size={16} className="opacity-50" />
            )}
         </div>
       ) : (
         <div className="absolute inset-0 z-20 w-full">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-blue-500 ring-2 ring-blue-500/20 overflow-hidden">
               <div className="flex items-center px-3 py-2.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <Search size={16} className="text-blue-500 mr-2 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    className="w-full bg-transparent border-none outline-none text-sm text-slate-800 dark:text-white placeholder-slate-400"
                    placeholder="Tapez un nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500">
                    <X size={14} />
                  </button>
               </div>
               <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map(m => (
                      <button
                        key={m.id}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between text-slate-700 dark:text-slate-200"
                        onClick={() => {
                          onChange(m.id);
                          setIsOpen(false);
                        }}
                      >
                        <span className="font-bold">{m.firstName} {m.lastName}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{m.phone}</span>
                      </button>
                    ))
                  ) : (
                     <div className="p-4 text-center text-xs text-slate-400">Aucun membre trouvé</div>
                  )}
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

interface PlanningRow {
  tempId: string;
  date: string;
  memberId: string;
}

const DahiraEvents: React.FC<DahiraEventsProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'HISTORY' | 'PLANNING'>('HISTORY');

  // --- History Logic ---
  const [events, setEvents] = useState<DahiraEvent[]>(db.getDahiraEvents().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  
  // --- Planning Logic ---
  const [schedules, setSchedules] = useState<TourSchedule[]>(db.getTourSchedules());
  const [planningMonth, setPlanningMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const members = db.getMembers();
  
  const dateInputRef = useRef<HTMLInputElement>(null);

  // History Form State
  const [historyFormData, setHistoryFormData] = useState({
    hostName: '',
    date: new Date().toISOString().split('T')[0],
    menTotal: 0,
    womenTotal: 0,
    socialTotal: 0
  });

  const handleHistorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.addDahiraEvent({
      ...historyFormData,
      recordedBy: currentUser.id
    });
    setEvents(db.getDahiraEvents().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setShowHistoryForm(false);
    setHistoryFormData({
      hostName: '',
      date: new Date().toISOString().split('T')[0],
      menTotal: 0,
      womenTotal: 0,
      socialTotal: 0
    });
  };

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

  // --- Planning Logic Helpers ---
  const [planningRows, setPlanningRows] = useState<PlanningRow[]>([]);

  // Initialize rows when month changes (Auto-fill Sundays and load existing)
  useEffect(() => {
    // 1. Get Sundays
    const [year, month] = planningMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const sundays: string[] = [];
    while (date.getDay() !== 0) date.setDate(date.getDate() + 1);
    while (date.getMonth() === month - 1) {
      sundays.push(date.toISOString().split('T')[0]);
      date.setDate(date.getDate() + 7);
    }

    // 2. Get existing schedules for this month
    const existing = schedules.filter(s => s.date.startsWith(planningMonth));
    const existingMap = new Map(existing.map(s => [s.date, s.memberId]));

    // 3. Build rows
    const newRows: PlanningRow[] = [];
    
    // Add all existing schedules first (to ensure we see what's in DB)
    existing.forEach(s => {
      newRows.push({
        tempId: Math.random().toString(36),
        date: s.date,
        memberId: s.memberId
      });
    });

    // Add Sundays that are missing from existing schedules
    sundays.forEach(sundayDate => {
      if (!existingMap.has(sundayDate)) {
        newRows.push({
          tempId: Math.random().toString(36),
          date: sundayDate,
          memberId: ''
        });
      }
    });

    // Sort by date
    newRows.sort((a, b) => a.date.localeCompare(b.date));

    setPlanningRows(newRows);
  }, [planningMonth, schedules]);

  const updateRow = (tempId: string, field: 'date' | 'memberId', value: string) => {
    setPlanningRows(prev => prev.map(row => 
      row.tempId === tempId ? { ...row, [field]: value } : row
    ));
  };

  const removeRow = (tempId: string) => {
    setPlanningRows(prev => prev.filter(row => row.tempId !== tempId));
  };

  const addRow = () => {
    // Default to today or first day of selected month
    const defaultDate = planningMonth 
       ? `${planningMonth}-01` 
       : new Date().toISOString().split('T')[0];
    
    setPlanningRows(prev => [
      ...prev,
      { tempId: Math.random().toString(36), date: defaultDate, memberId: '' }
    ]);
  };

  const savePlanning = () => {
    const validRows = planningRows.filter(row => row.date && row.memberId);
    if (validRows.length === 0) {
      alert("Aucune planification valide à enregistrer.");
      return;
    }

    const newSchedules: Omit<TourSchedule, 'id'>[] = validRows.map(row => ({
      date: row.date,
      memberId: row.memberId
    }));

    db.saveTourSchedules(newSchedules);
    setSchedules(db.getTourSchedules());
    alert('Planning enregistré avec succès !');
  };

  // Group all schedules by month for the list view
  const groupedSchedules = useMemo(() => {
    const grouped: Record<string, TourSchedule[]> = {};
    const sorted = [...schedules].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(s => {
      const monthKey = s.date.slice(0, 7); // YYYY-MM
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(s);
    });
    
    // Sort months descending (newest first)
    return Object.entries(grouped).sort((a,b) => b[0].localeCompare(a[0]));
  }, [schedules]);

  const getMemberName = (id: string) => {
    const m = members.find(mem => mem.id === id);
    return m ? `${m.firstName} ${m.lastName}` : 'Inconnu';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Gestion des Dahiras</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Historique financier et planification des tours</p>
        </div>
        
        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'HISTORY' 
              ? 'bg-white dark:bg-slate-600 text-primary dark:text-white shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <History size={16} className="mr-2" />
            Historique
          </button>
          <button
            onClick={() => setActiveTab('PLANNING')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'PLANNING' 
              ? 'bg-white dark:bg-slate-600 text-primary dark:text-white shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <CalendarDays size={16} className="mr-2" />
            Planification
          </button>
        </div>
      </div>

      {/* ================= HISTORY TAB ================= */}
      {activeTab === 'HISTORY' && (
        <>
          <div className="flex justify-end">
            {showHistoryForm ? (
              <button 
                onClick={() => setShowHistoryForm(false)}
                className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-5 py-2.5 rounded-xl flex items-center text-sm font-medium transition-colors"
              >
                <X size={18} className="mr-2" />
                <span className="hidden sm:inline">Annuler</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowHistoryForm(true)}
                className="bg-primary hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl flex items-center text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
              >
                <Plus size={18} className="mr-2" />
                <span className="hidden sm:inline">Enregistrer un bilan</span>
                <span className="sm:hidden">Nouveau</span>
              </button>
            )}
          </div>

          {showHistoryForm && (
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto animate-fade-in-up">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">Enregistrer un Dahira (Bilan)</h3>
              <form onSubmit={handleHistorySubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Date</label>
                    <div className="relative group">
                        <div 
                            className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer z-10"
                            onClick={handleDateIconClick}
                        >
                            <CalendarCheck size={18} className="text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors hover:text-primary dark:hover:text-white" />
                        </div>
                        <input 
                          ref={dateInputRef}
                          type="date" 
                          required
                          className="pl-10 w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 p-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:[color-scheme:dark]"
                          value={historyFormData.date}
                          onChange={e => setHistoryFormData({...historyFormData, date: e.target.value})}
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Hôte (Celui qui a reçu)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Keur M. Diop"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      value={historyFormData.hostName}
                      onChange={e => setHistoryFormData({...historyFormData, hostName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Enregistré par</label>
                    <input 
                      type="text" 
                      readOnly
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 p-3 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
                      value={currentUser.name}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
                    <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">Cotisation Hommes</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-500/30 p-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={historyFormData.menTotal}
                      onChange={e => setHistoryFormData({...historyFormData, menTotal: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-500/10 p-4 rounded-xl border border-pink-100 dark:border-pink-500/20">
                    <label className="block text-xs font-bold text-pink-600 dark:text-pink-400 uppercase mb-2">Cotisation Filles</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full rounded-lg bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-500/30 p-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                      value={historyFormData.womenTotal}
                      onChange={e => setHistoryFormData({...historyFormData, womenTotal: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-500/10 p-4 rounded-xl border border-purple-100 dark:border-purple-500/20">
                    <label className="block text-xs font-bold text-purple-600 dark:text-purple-400 uppercase mb-2">Sociale / Divers</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/30 p-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                      value={historyFormData.socialTotal}
                      onChange={e => setHistoryFormData({...historyFormData, socialTotal: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    className="w-full sm:w-auto bg-primary hover:bg-blue-900 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                      <div className="flex items-center text-primary dark:text-blue-400 mb-1">
                        <CalendarCheck size={18} className="mr-2" />
                        <span className="font-bold text-sm uppercase tracking-wide">{new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">Chez {event.hostName}</h3>
                    </div>
                    <div className="mt-4 md:mt-0 bg-slate-100 dark:bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
                      <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mr-2">Total Journée</span>
                      <span className="text-lg font-bold text-slate-800 dark:text-white">{(event.menTotal + event.womenTotal + event.socialTotal).toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center p-3 rounded-lg bg-blue-50 dark:bg-slate-700/30 border border-blue-100 dark:border-slate-600">
                      <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 mr-3">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Hommes</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{event.menTotal.toLocaleString()} F</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 rounded-lg bg-pink-50 dark:bg-slate-700/30 border border-pink-100 dark:border-slate-600">
                      <div className="p-2 bg-pink-100 dark:bg-pink-500/20 rounded-full text-pink-600 dark:text-pink-400 mr-3">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Filles</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{event.womenTotal.toLocaleString()} F</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 rounded-lg bg-purple-50 dark:bg-slate-700/30 border border-purple-100 dark:border-slate-600">
                      <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-full text-purple-600 dark:text-purple-400 mr-3">
                        <Heart size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Sociale</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{event.socialTotal.toLocaleString()} F</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
                <div className="inline-block p-4 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                  <CalendarCheck size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Aucun historique enregistré.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ================= PLANNING TAB ================= */}
      {activeTab === 'PLANNING' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Planning Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-cardbg p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                    <CalendarDays className="mr-2 text-primary dark:text-blue-400" size={20} />
                    Planifier le mois
                 </h3>
                 <input 
                   type="month"
                   className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 p-2 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary dark:[color-scheme:dark]"
                   value={planningMonth}
                   onChange={(e) => setPlanningMonth(e.target.value)}
                 />
              </div>

              <div className="space-y-4">
                {planningRows.map((row) => (
                  <div key={row.tempId} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up">
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button 
                          onClick={() => removeRow(row.tempId)}
                          className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <X size={16} />
                        </button>
                        <div className="relative">
                            <input 
                              type="date"
                              className="w-full sm:w-40 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm text-slate-800 dark:text-white outline-none focus:border-primary dark:[color-scheme:dark]"
                              value={row.date}
                              onChange={(e) => updateRow(row.tempId, 'date', e.target.value)}
                            />
                        </div>
                      </div>
                      
                      <div className="flex-1 w-full sm:w-auto flex items-center gap-2">
                        <ArrowRight size={16} className="text-slate-300 hidden sm:block shrink-0" />
                        <MemberAutocomplete 
                          members={members}
                          value={row.memberId}
                          onChange={(id) => updateRow(row.tempId, 'memberId', id)}
                        />
                      </div>
                  </div>
                ))}
                
                {planningRows.length === 0 && (
                   <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm italic">
                      Aucune date planifiée pour ce mois.
                   </div>
                )}

                <button 
                  onClick={addRow}
                  className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 font-bold text-sm hover:border-primary hover:text-primary dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors flex items-center justify-center"
                >
                  <Plus size={16} className="mr-2" />
                  Ajouter une date
                </button>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={savePlanning}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center text-sm font-bold transition-all shadow-lg shadow-emerald-900/20"
                >
                  <Save size={18} className="mr-2" />
                  Enregistrer le planning
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Upcoming List */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center pt-2">
              <CalendarCheck size={20} className="mr-2 text-slate-400" />
              Prochains tours prévus
            </h3>
            
            <div className="space-y-6">
               {groupedSchedules.length > 0 ? (
                 groupedSchedules.map(([monthKey, monthSchedules]) => {
                   const [year, month] = monthKey.split('-');
                   const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                   
                   return (
                     <div key={monthKey} className="bg-white dark:bg-cardbg rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                       <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 capitalize text-sm">
                         {monthName}
                       </div>
                       <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
                         {monthSchedules.sort((a,b) => a.date.localeCompare(b.date)).map(s => (
                           <li key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <div>
                                <div className="flex items-center text-xs font-bold text-primary dark:text-blue-400 mb-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-blue-400 mr-2"></span>
                                  {new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })}
                                </div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{getMemberName(s.memberId)}</p>
                              </div>
                              <button 
                                onClick={() => {
                                  if(confirm('Supprimer cette planification ?')) {
                                    db.deleteTourSchedule(s.id);
                                    setSchedules(db.getTourSchedules());
                                  }
                                }}
                                className="text-slate-300 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                           </li>
                         ))}
                       </ul>
                     </div>
                   );
                 })
               ) : (
                 <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                   <p className="text-slate-400 dark:text-slate-500 text-sm">Aucune planification à venir.</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DahiraEvents;