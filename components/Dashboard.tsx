import React, { useMemo } from 'react';
import { db } from '../services/db';
import { Gender } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { TrendingUp, CheckCircle, Wallet, Users } from 'lucide-react';

const COLORS = ['#3b82f6', '#ec4899', '#f59e0b']; // Blue, Pink, Amber

const Dashboard: React.FC = () => {
  const members = db.getMembers();
  const allContributions = db.getAllContributions();

  const stats = useMemo(() => {
    let totalCollected = 0;
    let totalExpected = 0;
    let maleCollected = 0;
    let femaleCollected = 0;
    
    // Calculate expected total
    members.forEach(m => totalExpected += m.annualGoal);

    // Calculate collected
    allContributions.forEach(c => {
      totalCollected += c.amount;
      const member = members.find(m => m.id === c.memberId);
      if (member) {
        if (member.gender === Gender.Male || member.gender === Gender.Boy) maleCollected += c.amount;
        if (member.gender === Gender.Female || member.gender === Gender.Girl) femaleCollected += c.amount;
      }
    });

    return {
      totalCollected,
      totalExpected,
      maleCollected,
      femaleCollected,
      gap: totalExpected - totalCollected
    };
  }, [members, allContributions]);

  // Data for Charts
  const weeklyData = useMemo(() => {
    return [
      { name: 'Sem 1', hommes: 15000, femmes: 12000 },
      { name: 'Sem 2', hommes: 18000, femmes: 15000 },
      { name: 'Sem 3', hommes: 12000, femmes: 20000 },
      { name: 'Sem 4', hommes: 25000, femmes: 22000 },
    ];
  }, []);

  const genderData = [
    { name: 'Hommes/Garçons', value: stats.maleCollected },
    { name: 'Femmes/Filles', value: stats.femaleCollected },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Tableau de bord</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Vue d'ensemble des activités du Dahira</p>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-cardbg p-6 rounded-2xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-slate-600 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Collecté</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-2">{stats.totalCollected.toLocaleString()} FCFA</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
              <Wallet size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2 py-1 rounded">
            <TrendingUp size={14} className="mr-1" />
            <span>+12% vs mois dernier</span>
          </div>
        </div>

        <div className="bg-white dark:bg-cardbg p-6 rounded-2xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-slate-600 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Attendu</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-2">{stats.totalExpected.toLocaleString()} FCFA</h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-5 overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full" 
              style={{ width: `${Math.min((stats.totalCollected / stats.totalExpected) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-right">{Math.round((stats.totalCollected / stats.totalExpected) * 100)}% de l'objectif</p>
        </div>

        <div className="bg-white dark:bg-cardbg p-6 rounded-2xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-700/50 hover:border-sky-200 dark:hover:border-slate-600 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Hommes & Garçons</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-2">{stats.maleCollected.toLocaleString()} FCFA</h3>
            </div>
            <div className="p-3 bg-sky-50 dark:bg-sky-500/10 rounded-xl text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20">
              <Users size={24} />
            </div>
          </div>
          <p className="text-xs text-sky-600/80 dark:text-sky-400/80 mt-4 font-medium">Participation active</p>
        </div>

        <div className="bg-white dark:bg-cardbg p-6 rounded-2xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-700/50 hover:border-pink-200 dark:hover:border-slate-600 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Femmes & Filles</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-2">{stats.femaleCollected.toLocaleString()} FCFA</h3>
            </div>
            <div className="p-3 bg-pink-50 dark:bg-pink-500/10 rounded-xl text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20">
              <Users size={24} />
            </div>
          </div>
          <p className="text-xs text-pink-600/80 dark:text-pink-400/80 mt-4 font-medium">Participation active</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-cardbg p-6 rounded-2xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-700/50">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Évolution des cotisations (Ce mois)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg, #1e293b)', borderRadius: '12px', border: '1px solid #475569', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '5px' }}
                  formatter={(value: number) => [`${value.toLocaleString()} FCFA`]}
                  cursor={{fill: '#334155', opacity: 0.1}}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="hommes" name="Hommes/Garçons" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="femmes" name="Femmes/Filles" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white dark:bg-cardbg p-6 rounded-2xl shadow-sm dark:shadow-lg border border-slate-200 dark:border-slate-700/50">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Répartition</h3>
          <div className="h-80 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #475569', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number) => [`${value.toLocaleString()} FCFA`]} 
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;