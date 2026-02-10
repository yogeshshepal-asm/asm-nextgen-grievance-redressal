
import React, { useState, useMemo } from 'react';
import { Grievance, GrievanceStatus, UserRole, GrievanceCategory } from '../types';

interface GrievanceListProps {
  grievances: Grievance[];
  userRole: UserRole;
  onSelect: (grievance: Grievance) => void;
  onBulkUpdate?: (ids: string[], updates: Partial<Grievance>) => void;
}

type SortKey = 'subject' | 'category' | 'priority' | 'status' | 'createdAt' | 'userName' | 'sentiment';
type SortDirection = 'asc' | 'desc';

// Helper component moved outside to prevent re-creation on every render
const SortIcon = ({ column, sortConfig }: { column: SortKey, sortConfig: { key: SortKey; direction: SortDirection } }) => {
  if (sortConfig.key !== column) {
    return (
      <svg className="ml-1 h-3 w-3 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  }
  return sortConfig.direction === 'asc' ? (
    <svg className="ml-1 h-3 w-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="ml-1 h-3 w-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
};

const GrievanceList: React.FC<GrievanceListProps> = ({ grievances, userRole, onSelect, onBulkUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'createdAt',
    direction: 'desc'
  });

  const getStatusColor = (status: GrievanceStatus) => {
    switch (status) {
      case GrievanceStatus.PENDING: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case GrievanceStatus.IN_PROGRESS: return 'bg-blue-50 text-blue-700 border-blue-200';
      case GrievanceStatus.RESOLVED: return 'bg-green-50 text-green-700 border-green-200';
      case GrievanceStatus.REJECTED: return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getSentimentStyling = (sentiment: string | undefined) => {
    const s = sentiment?.toLowerCase();
    if (s === 'negative') return {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
      dotColor: 'bg-rose-500',
      shadow: 'shadow-rose-100'
    };
    if (s === 'positive') return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      dotColor: 'bg-emerald-500',
      shadow: 'shadow-emerald-100'
    };
    return {
      bg: 'bg-slate-50',
      text: 'text-slate-500',
      border: 'border-slate-100',
      dotColor: 'bg-slate-400',
      shadow: 'shadow-slate-100'
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 font-bold';
      case 'Medium': return 'text-orange-600 font-semibold';
      case 'Low': return 'text-green-600';
      default: return 'text-slate-600';
    }
  };

  const priorityWeight = { 'Low': 1, 'Medium': 2, 'High': 3 };

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredGrievances = useMemo(() => {
    let result = grievances.filter((g) => {
      const matchesSearch = 
        g.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.aiInsights?.summary?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        g.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || g.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || g.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    result.sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = a[key];
      let valB: any = b[key];

      if (key === 'priority') {
        valA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
        valB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
      } else if (key === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else if (key === 'sentiment') {
        valA = a.aiInsights?.sentiment || 'Neutral';
        valB = b.aiInsights?.sentiment || 'Neutral';
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [grievances, searchTerm, statusFilter, priorityFilter, sortConfig]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedAndFilteredGrievances.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedAndFilteredGrievances.map(g => g.id)));
    }
  };

  const handleBulkStatusChange = (status: GrievanceStatus) => {
    if (onBulkUpdate) {
      onBulkUpdate(Array.from(selectedIds), { status });
      setSelectedIds(new Set());
    }
  };

  const handleBulkPriorityChange = (priority: 'Low' | 'Medium' | 'High') => {
    if (onBulkUpdate) {
      onBulkUpdate(Array.from(selectedIds), { priority });
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="space-y-4 relative z-0 overflow-visible">
      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between relative z-10">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search subject, summary, user..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</label>
            <select
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {Object.values(GrievanceStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority:</label>
            <select
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'All' || priorityFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setPriorityFilter('All');
              }}
              className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {userRole === UserRole.ADMIN && selectedIds.size > 0 && (
        <div className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center mb-2 md:mb-0">
            <div className="bg-white/20 p-2 rounded-lg mr-3">
              <span className="font-bold text-sm">{selectedIds.size}</span>
            </div>
            <span className="text-sm font-medium">items selected for bulk action</span>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold text-indigo-100">Set Status:</span>
              <div className="flex bg-white/10 rounded-lg p-1">
                {Object.values(GrievanceStatus).map(status => (
                  <button
                    key={status}
                    onClick={() => handleBulkStatusChange(status)}
                    className="px-2 py-1 text-[10px] uppercase font-bold hover:bg-white/20 rounded transition-colors"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold text-indigo-100">Set Priority:</span>
              <div className="flex bg-white/10 rounded-lg p-1">
                {['Low', 'Medium', 'High'].map(p => (
                  <button
                    key={p}
                    onClick={() => handleBulkPriorityChange(p as any)}
                    className="px-2 py-1 text-[10px] uppercase font-bold hover:bg-white/20 rounded transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-white/70 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible">
        <div className="overflow-x-auto overflow-y-visible relative z-0">
          <table className="w-full text-left relative">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="bg-slate-50 border-b border-slate-200">
                {userRole === UserRole.ADMIN && (
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded text-indigo-600 focus:ring-indigo-500" 
                      checked={sortedAndFilteredGrievances.length > 0 && selectedIds.size === sortedAndFilteredGrievances.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('subject')}
                >
                  <div className="flex items-center">Subject <SortIcon column="subject" sortConfig={sortConfig} /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">AI Insight</th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('sentiment')}
                >
                  <div className="flex items-center">Sentiment <SortIcon column="sentiment" sortConfig={sortConfig} /></div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">Category <SortIcon column="category" sortConfig={sortConfig} /></div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center">Priority <SortIcon column="priority" sortConfig={sortConfig} /></div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">Status <SortIcon column="status" sortConfig={sortConfig} /></div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 overflow-visible relative z-0">
              {sortedAndFilteredGrievances.length === 0 ? (
                <tr>
                  <td colSpan={userRole === UserRole.ADMIN ? 10 : 9} className="px-6 py-12 text-center text-slate-400">
                    {grievances.length === 0 ? "No grievances found." : "No results match your current filters."}
                  </td>
                </tr>
              ) : (
                sortedAndFilteredGrievances.map((g) => {
                  const sentiment = getSentimentStyling(g.aiInsights?.sentiment);
                  return (
                    <tr 
                      key={g.id} 
                      className={`hover:bg-slate-50 cursor-pointer transition-colors overflow-visible z-0 ${selectedIds.has(g.id) ? 'bg-indigo-50/50' : ''}`}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') return;
                        onSelect(g);
                      }}
                    >
                      {userRole === UserRole.ADMIN && (
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox" 
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                            checked={selectedIds.has(g.id)}
                            onChange={() => toggleSelect(g.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 font-mono text-sm text-slate-600">#{g.id.toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900 truncate max-w-[150px]" title={g.subject}>{g.subject}</div>
                      </td>
                      <td className="px-6 py-4 overflow-visible z-20 relative">
                        <div className="relative group max-w-[160px] overflow-visible">
                          <div 
                            className="text-[11px] text-indigo-700 italic truncate bg-indigo-50/60 px-3 py-1.5 rounded-xl border border-indigo-100 flex items-center gap-2 hover:bg-indigo-100 transition-all duration-300 group-hover:shadow-sm"
                          >
                            <div className="relative flex h-3 w-3 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <svg className="relative inline-flex h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.243a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707zM15.657 14.243a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707z" />
                              </svg>
                            </div>
                            <span className="truncate">{g.aiInsights?.summary || 'Processing...'}</span>
                          </div>
                          
                          {g.aiInsights?.summary && (
                            <div className="absolute hidden group-hover:block z-[99999] w-72 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 pointer-events-auto border border-white/10 ring-1 ring-black/5 top-full right-0 mt-2 backdrop-blur-sm">
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                                <svg className="h-4 w-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-indigo-300">Intelligent Brief</span>
                              </div>
                              <p className="text-[11px] leading-relaxed font-medium text-slate-100">
                                {g.aiInsights.summary}
                              </p>
                              <div className="mt-3 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${sentiment.dotColor} shadow-[0_0_8px] ${sentiment.shadow}`}></div>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${sentiment.bg} ${sentiment.text} ${sentiment.border}`}>
                                  {g.aiInsights.sentiment}
                                </span>
                              </div>
                              <div className="absolute top-full left-6 border-8 border-transparent border-t-slate-900"></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 px-3 py-1 w-fit rounded-full border ${sentiment.bg} ${sentiment.text} ${sentiment.border} transition-all duration-300 hover:scale-105`}>
                          <div className={`w-2 h-2 rounded-full ${sentiment.dotColor} shadow-[0_0_5px] ${sentiment.shadow}`}></div>
                          <span className="text-[10px] font-black uppercase tracking-widest">{g.aiInsights?.sentiment || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{g.category}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={getPriorityColor(g.priority)}>{g.priority}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(g.status)}`}>
                          {g.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(g);
                          }}
                          className="px-3 py-1 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GrievanceList;
