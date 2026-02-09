
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Grievance, GrievanceStatus, GrievanceCategory, User, UserRole } from '../types';

interface DashboardProps {
  grievances: Grievance[];
  user: User;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC<DashboardProps> = ({ grievances, user }) => {
  const isFaculty = user.role === UserRole.FACULTY;
  const isAdmin = user.role === UserRole.ADMIN;
  const [selectedCellFilter, setSelectedCellFilter] = useState<string>('All Cells');

  const activeGrievances = grievances.filter(g => 
    selectedCellFilter === 'All Cells' || g.category === selectedCellFilter
  );

  const stats = {
    total: activeGrievances.length,
    pending: activeGrievances.filter(g => g.status === GrievanceStatus.PENDING).length,
    inProgress: activeGrievances.filter(g => g.status === GrievanceStatus.IN_PROGRESS).length,
    resolved: activeGrievances.filter(g => g.status === GrievanceStatus.RESOLVED).length,
    highPriority: activeGrievances.filter(g => g.priority === 'High' && g.status !== GrievanceStatus.RESOLVED).length,
    negativeSentiment: activeGrievances.filter(g => g.aiInsights?.sentiment?.toLowerCase() === 'negative').length,
    positiveSentiment: activeGrievances.filter(g => g.aiInsights?.sentiment?.toLowerCase() === 'positive').length,
    neutralSentiment: activeGrievances.filter(g => g.aiInsights?.sentiment?.toLowerCase() === 'neutral' || !g.aiInsights?.sentiment).length,
  };

  const sentimentBreakdown = [
    { name: 'Negative', count: stats.negativeSentiment, color: '#ef4444' },
    { name: 'Neutral', count: stats.neutralSentiment, color: '#94a3b8' },
    { name: 'Positive', count: stats.positiveSentiment, color: '#10b981' }
  ];

  const cellPerformance = Object.values(GrievanceCategory).map(cat => {
    const cellGrievances = grievances.filter(g => g.category === cat);
    const resolved = cellGrievances.filter(g => g.status === GrievanceStatus.RESOLVED).length;
    return {
      name: cat,
      total: cellGrievances.length,
      pending: cellGrievances.filter(g => g.status === GrievanceStatus.PENDING).length,
      resolved: resolved,
      rate: cellGrievances.length > 0 ? Math.round((resolved / cellGrievances.length) * 100) : 0
    };
  });

  const priorityData = [
    { name: 'High', value: activeGrievances.filter(g => g.priority === 'High').length, color: '#ef4444' },
    { name: 'Medium', value: activeGrievances.filter(g => g.priority === 'Medium').length, color: '#f59e0b' },
    { name: 'Low', value: activeGrievances.filter(g => g.priority === 'Low').length, color: '#10b981' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isFaculty ? `${user.assignedCategory} Cell Dashboard` : 'Technical Campus Analytics'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {isAdmin ? 'Cell-wise grievance oversight & AICTE compliance monitoring.' : `Authorized redressal lead for ${user.assignedCategory} Cell.`}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <select 
              className="bg-transparent border-none text-xs font-bold uppercase tracking-wider text-slate-600 px-4 py-2 outline-none cursor-pointer"
              value={selectedCellFilter}
              onChange={(e) => setSelectedCellFilter(e.target.value)}
            >
              <option value="All Cells">Consolidated View</option>
              {Object.values(GrievanceCategory).map(cat => (
                <option key={cat} value={cat}>{cat} Cell</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Caseload', value: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { label: 'Unaddressed', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Resolved', value: stats.resolved, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Critical Alert', value: stats.highPriority, color: 'text-rose-600', bg: 'bg-rose-50', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${stat.bg} rounded-full opacity-40 group-hover:scale-125 transition-transform duration-500`}></div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</span>
                <svg className={`h-5 w-5 ${stat.color} opacity-70`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Sentiment Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Campus Sentiment Pulse</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">AI-driven emotional assessment of reports.</p>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wellbeing Score</span>
               <span className={`text-xl font-black ${stats.negativeSentiment > stats.positiveSentiment ? 'text-rose-600' : 'text-emerald-600'}`}>
                 {Math.round(((stats.positiveSentiment + (stats.neutralSentiment * 0.5)) / (stats.total || 1)) * 100)}%
               </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="w-full bg-slate-100 h-8 rounded-2xl overflow-hidden flex shadow-inner">
              {sentimentBreakdown.map((s, idx) => (
                <div 
                  key={idx}
                  title={`${s.name}: ${s.count}`}
                  className="h-full transition-all duration-1000 flex items-center justify-center text-[10px] font-black text-white overflow-hidden"
                  style={{ 
                    width: `${(s.count / (stats.total || 1)) * 100}%`,
                    backgroundColor: s.color,
                    borderRight: idx < 2 ? '2px solid white' : 'none'
                  }}
                >
                  {s.count > 0 && <span>{Math.round((s.count / (stats.total || 1)) * 100)}%</span>}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {sentimentBreakdown.map((s, idx) => (
                <div key={idx} className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-2.5 h-2.5 rounded-full mb-2" style={{ backgroundColor: s.color }}></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.name}</span>
                  <span className="text-lg font-black text-slate-900">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-start gap-6">
             <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 shrink-0">
               <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-900 mb-2">Urgency Optimization</h3>
               <p className="text-sm text-slate-500 font-medium leading-relaxed">
                 The AI has flagged <span className="text-rose-600 font-black">{stats.negativeSentiment}</span> negative-sentiment reports. 
                 Special attention is recommended for <span className="text-indigo-600 font-bold">{Math.min(stats.negativeSentiment, stats.highPriority)}</span> intersecting critical cases.
               </p>
               <button 
                onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })}
                className="mt-4 px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all"
               >
                 Review Distress Signals
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Admin Cell Grid (AICTE View) */}
      {isAdmin && selectedCellFilter === 'All Cells' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em] flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
              Cell-wise Performance Matrix
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cellPerformance.map((cell, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{cell.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Technical Redressal Cell</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900">{cell.rate}%</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Resolution Rate</div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Caseload</span>
                    <span className="font-black text-slate-900">{cell.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Pending Action</span>
                    <span className="font-black text-amber-600">{cell.pending}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${cell.rate}%` }}
                    ></div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedCellFilter(cell.name)}
                  className="mt-auto w-full py-2.5 bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-slate-100"
                >
                  View Cell Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-[420px] flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Incident Distribution</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Grievance volume across specialized технический cells.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-600 rounded"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Reports</span>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cellPerformance.filter(c => selectedCellFilter === 'All Cells' || c.name === selectedCellFilter)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Priority Wheel */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[420px]">
            <h3 className="text-sm font-black text-slate-900 mb-8 uppercase tracking-widest text-center">Urgency Profiling</h3>
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active</span>
                <span className="text-3xl font-black text-slate-900">{stats.total}</span>
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {priorityData.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs px-2">
                  <div className="flex items-center">
                    <div className="w-2.5 h-2.5 rounded-full mr-3" style={{ backgroundColor: p.color }}></div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider">{p.name}</span>
                  </div>
                  <span className="font-black text-slate-900">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
