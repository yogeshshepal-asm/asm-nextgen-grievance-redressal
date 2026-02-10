
import React, { useState } from 'react';
import { UserRole, AppNotification } from '../types.ts';
import Logo from './Logo.tsx';

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearNotifications: () => void;
  userName?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  userRole, 
  onLogout, 
  activeTab, 
  setActiveTab,
  notifications,
  onMarkAsRead,
  onClearNotifications,
  userName
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const isManagement = [
    UserRole.ADMIN, 
    UserRole.PRESIDENT, 
    UserRole.PRINCIPAL, 
    UserRole.REGISTRAR, 
    UserRole.HOD,
    UserRole.DEAN,
    UserRole.DEPT_ADMIN
  ].includes(userRole);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-800 flex flex-col items-center">
          <Logo size="md" className="mb-4" showText={false} />
          <h1 className="text-lg font-black tracking-tight text-white uppercase">ASM Nextgen</h1>
          <p className="text-[9px] text-[#71bf44] font-black mt-1 uppercase tracking-widest">Technical Campus</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', roles: 'all' },
            { id: 'grievances', label: isManagement ? 'All Cases' : userRole === UserRole.FACULTY ? 'Cell Queue' : 'My Cases', roles: 'all' },
            { id: 'members', label: 'Campus Users', roles: [UserRole.ADMIN] },
            { id: 'workflow', label: 'Workflow Rules', roles: [UserRole.ADMIN] },
            { id: 'new', label: 'New Grievance', roles: [UserRole.STUDENT] },
            { id: 'profile', label: 'My Account', roles: 'all' }
          ]
          .filter(item => item.roles === 'all' || (Array.isArray(item.roles) && item.roles.includes(userRole)))
          .map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-[#1a73b8] text-white shadow-lg shadow-[#1a73b8]/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full text-left px-4 py-3 text-slate-400 hover:text-rose-400 text-[10px] font-black uppercase tracking-widest flex items-center space-x-3 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0v-1m6-10V4a3 3 0 00-6 0v1" /></svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center shrink-0 shadow-sm z-10">
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-tight">
              {activeTab === 'members' ? 'User Directory' : activeTab === 'workflow' ? 'Workflow Rules' : activeTab.replace('-', ' ')}
            </h2>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">ASM Campus Governance Portal</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 transition-colors ${unreadCount > 0 ? 'text-[#1a73b8]' : 'text-slate-300 hover:text-slate-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-1 text-[8px] font-black leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-rose-600 rounded-full ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Activity Feed</span>
                      <button onClick={onClearNotifications} className="text-[9px] font-black text-[#1a73b8] uppercase hover:text-[#71bf44] transition-colors">Clear All</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center">
                          <svg className="h-8 w-8 text-slate-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.586a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No recent updates</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => { onMarkAsRead(notif.id); setIsNotifOpen(false); }}
                            className={`px-6 py-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.read ? 'bg-[#1a73b8]/5' : ''}`}
                          >
                            <p className="text-xs font-medium text-slate-700 leading-relaxed">{notif.message}</p>
                            <span className="text-[8px] font-black text-slate-300 mt-2 block uppercase">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-[#71bf44] flex items-center justify-center text-white text-[10px] font-black uppercase">{userRole?.charAt(0) || 'U'}</div>
              <div className="flex flex-col">
                {userName && <span className="text-[10px] font-bold text-slate-700">{userName}</span>}
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{userRole || 'User'}</span>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 bg-[#fdfdfd]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
