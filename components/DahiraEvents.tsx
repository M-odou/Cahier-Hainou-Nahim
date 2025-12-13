import React, { useState, useRef } from 'react';
import { db } from '../services/db';
import { DahiraEvent, User } from '../types';
import { CalendarCheck, Plus, X, Users, Heart, Banknote } from 'lucide-react';

interface DahiraEventsProps {
  currentUser: User;
}

const DahiraEvents: React.FC<DahiraEventsProps> = ({ currentUser }) => {
  const [events, setEvents] = useState<DahiraEvent[]>(db.getDahiraEvents().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  const [showForm, setShowForm] = useState(false);
  
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    hostName: '',
    date: new Date().toISOString().split('T')[0],
    menTotal: 0,
    womenTotal: 0,
    socialTotal: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.addDahiraEvent({
      ...formData,
      recordedBy: currentUser.id
    });
    setEvents(db.getDahiraEvents().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setShowForm(false);
    setFormData({
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Événements Dahira</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Historique des vendredis et recettes globales</p>
        </div>
        {showForm ? (
          <button 
            onClick={() => setShowForm(false)}
            className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-5 py-2.5 rounded-xl flex items-center text-sm font-medium transition-colors"
          >
            <X size={18} className="mr-2" />
            <span className="hidden sm:inline">Annuler</span>
          </button>
        ) : (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl flex items-center text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            <Plus size={18} className="mr-2" />
            <span className="hidden sm:inline">Nouveau Dahira</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto animate-fade-in-up">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">Enregistrer un Dahira</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            
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
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Celui qui a reçu</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Keur M. Diop"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={formData.hostName}
                  onChange={e => setFormData({...formData, hostName: e.target.value})}
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
                  value={formData.menTotal}
                  onChange={e => setFormData({...formData, menTotal: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="bg-pink-50 dark:bg-pink-500/10 p-4 rounded-xl border border-pink-100 dark:border-pink-500/20">
                <label className="block text-xs font-bold text-pink-600 dark:text-pink-400 uppercase mb-2">Cotisation Filles</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full rounded-lg bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-500/30 p-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  value={formData.womenTotal}
                  onChange={e => setFormData({...formData, womenTotal: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="bg-purple-50 dark:bg-purple-500/10 p-4 rounded-xl border border-purple-100 dark:border-purple-500/20">
                <label className="block text-xs font-bold text-purple-600 dark:text-purple-400 uppercase mb-2">Sociale / Divers</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/30 p-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.socialTotal}
                  onChange={e => setFormData({...formData, socialTotal: parseInt(e.target.value) || 0})}
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
            <p className="text-slate-500 dark:text-slate-400 font-medium">Aucun événement enregistré pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DahiraEvents;