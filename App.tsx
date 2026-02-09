import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import GrievanceForm from './components/GrievanceForm.tsx';
import GrievanceList from './components/GrievanceList.tsx';
import GrievanceDetail from './components/GrievanceDetail.tsx';
import UserManagement from './components/UserManagement.tsx';
import LoginForm from './components/LoginForm.tsx';
import LandingPage from './components/LandingPage.tsx';
import Logo from './components/Logo.tsx';
import Profile from './components/Profile.tsx';
import { db, useFirebase } from './services/firebase.ts';
import { 
  collection, onSnapshot, query, orderBy, addDoc, updateDoc, 
  doc, deleteDoc, writeBatch, getDocs, where, setDoc 
} from "firebase/firestore";
import { User, Grievance, UserRole, GrievanceStatus, GrievanceCategory, AppNotification, ToastMessage, Reply } from './types.ts';

const MOCK_GRIEVANCES: Grievance[] = [];

const INITIAL_MEMBERS: User[] = [
  // Initial users will be created via "Seed Cloud Directory" button or added through User Management
];

const STORAGE_KEYS = {
  GRIEVANCES: 'asm_grievances',
  MEMBERS: 'asm_members',
  STUDENTS: 'asm_students'
};

const App: React.FC = () => {
  const isUsingFirebase = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [departments, setDepartments] = useState<string[]>(['Engineering', 'Management', 'Pharmacy', 'MCA', 'BBA/BCA']);
  const [customRoles, setCustomRoles] = useState<string[]>([]);

  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    let unsubs: (() => void)[] = [];
    
    const switchToLocalMode = () => {
      console.log("💾 ASM Nextgen: Initializing Local Data Stack...");
      const savedG = localStorage.getItem(STORAGE_KEYS.GRIEVANCES);
      const savedM = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      const savedS = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      
      setGrievances(savedG ? JSON.parse(savedG) : []);
      setMembers(savedM ? JSON.parse(savedM) : INITIAL_MEMBERS);
      setStudents(savedS ? JSON.parse(savedS) : []);
      
      const savedDepts = localStorage.getItem('asm_departments');
      if (savedDepts) setDepartments(JSON.parse(savedDepts));
      
      const savedRoles = localStorage.getItem('asm_custom_roles');
      if (savedRoles) setCustomRoles(JSON.parse(savedRoles));
      
      setTimeout(() => setIsDataLoaded(true), 800);
    };

    if (isUsingFirebase && db) {
      console.log("🔄 ASM Nextgen: Initializing Cloud Stream...");
      
      const qGrievances = query(collection(db, "grievances"), orderBy("createdAt", "desc"));
      
      const unsubG = onSnapshot(qGrievances, (snap) => {
        const items = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Grievance));
        setGrievances(items);
        setIsDataLoaded(true);
        setDbError(null);
      }, (err: any) => {
        console.error("Grievance Sync Error:", err);
        if (err.code === 'not-found' || err.message?.includes('database (default) does not exist')) {
          setDbError('DATABASE_MISSING');
        } else {
          setIsDataLoaded(true);
        }
      });

      const unsubM = onSnapshot(collection(db, "members"), (snap) => {
        const items = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
        if (items.length > 0) {
          setMembers(items);
        } else {
          setMembers(INITIAL_MEMBERS);
        }
      }, (err) => {
        console.warn("Members cloud stream failed.");
        setMembers(INITIAL_MEMBERS);
      });

      const unsubS = onSnapshot(collection(db, "students"), (snap) => {
        const items = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
        setStudents(items);
      }, (err) => console.warn("Students cloud stream failed."));

      unsubs = [unsubG, unsubM, unsubS];
    } else {
      switchToLocalMode();
    }

    return () => unsubs.forEach(fn => fn());
  }, [isUsingFirebase]);

  const handleBootstrapCloud = async () => {
    if (!db) return;
    try {
      showToast("Initializing Cloud Collections...", "info");
      const batch = writeBatch(db);
      
      // Create default admin user
      const defaultAdmin: User = {
        id: 'admin001',
        name: 'System Administrator',
        email: 'admin@asmedu.org',
        role: UserRole.ADMIN,
        department: 'Administration',
        password: 'asm@123'
      };
      
      const adminRef = doc(db, "members", defaultAdmin.id);
      batch.set(adminRef, defaultAdmin);

      await batch.commit();
      showToast("Cloud Setup Complete! Login with admin@asmedu.org / asm@123", "success");
      setDbError(null);
      setTimeout(() => window.location.reload(), 2000);
    } catch (e: any) {
      showToast(`Bootstrap Failed: ${e.message}`, "error");
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isUsingFirebase && isDataLoaded) {
      localStorage.setItem(STORAGE_KEYS.GRIEVANCES, JSON.stringify(grievances));
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
      localStorage.setItem('asm_departments', JSON.stringify(departments));
      localStorage.setItem('asm_custom_roles', JSON.stringify(customRoles));
    }
  }, [grievances, members, students, departments, customRoles, isUsingFirebase, isDataLoaded]);

  // --- Handlers ---

  const handleAddGrievance = async (g: any) => {
    if (isUsingFirebase && db) {
      try {
        await addDoc(collection(db, "grievances"), g);
        showToast("Case synced with cloud.", "success");
      } catch (e) { showToast("Cloud write failed.", "error"); }
    } else {
      setGrievances([g, ...grievances]);
      showToast("Logged to local cache.", "info");
    }
  };

  const handleUpdateGrievanceStatus = async (id: string, status: GrievanceStatus) => {
    if (isUsingFirebase && db) {
      try {
        const ref = doc(db, "grievances", id);
        await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
        showToast(`Status updated to ${status}`, "success");
      } catch (e) { showToast("Update failed.", "error"); }
    } else {
      setGrievances(prev => prev.map(g => g.id === id ? { ...g, status, updatedAt: new Date().toISOString() } : g));
    }
  };

  const handleBulkUpdateGrievances = async (ids: string[], updates: Partial<Grievance>) => {
    if (isUsingFirebase && db) {
      try {
        const batch = writeBatch(db);
        ids.forEach(id => {
          const ref = doc(db, "grievances", id);
          batch.update(ref, { ...updates, updatedAt: new Date().toISOString() });
        });
        await batch.commit();
        showToast(`Bulk updated ${ids.length} cases.`, "success");
      } catch (e) { showToast("Bulk action failed.", "error"); }
    } else {
      setGrievances(prev => prev.map(g => ids.includes(g.id) ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g));
    }
  };

  const handleAddReply = async (id: string, text: string, attachments: any[] = []) => {
    const newReply: Reply = {
      id: Math.random().toString(36).substr(2, 6),
      authorName: user?.name || "System",
      authorRole: user?.role || "Staff",
      text,
      timestamp: new Date().toISOString(),
      attachments
    };

    if (isUsingFirebase && db) {
      try {
        const g = grievances.find(item => item.id === id);
        if (g) {
          const ref = doc(db, "grievances", id);
          await updateDoc(ref, { 
            replies: [...(g.replies || []), newReply],
            updatedAt: new Date().toISOString()
          });
        }
      } catch (e) { showToast("Cloud reply failed.", "error"); }
    } else {
      setGrievances(prev => prev.map(g => g.id === id ? { ...g, replies: [...(g.replies || []), newReply] } : g));
    }
  };

  const handleAddUser = async (u: User) => {
    if (isUsingFirebase && db) {
      try {
        const col = u.role === UserRole.STUDENT ? "students" : "members";
        await setDoc(doc(db, col, u.id), u);
        showToast(`${u.name} synced to cloud.`, "success");
      } catch (e) { showToast("Sync failed.", "error"); }
    } else {
      if (u.role === UserRole.STUDENT) setStudents([...students, u]);
      else setMembers([...members, u]);
    }
  };

  const handleUpdateUser = async (u: User) => {
    if (isUsingFirebase && db) {
      try {
        const col = u.role === UserRole.STUDENT ? "students" : "members";
        // Use setDoc with merge to create or update
        await setDoc(doc(db, col, u.id), u, { merge: true });
        showToast("Profile updated successfully!", "success");
        // Update current user if editing own profile
        if (user && user.email === u.email) {
          setUser({ ...user, ...u });
        }
      } catch (e: any) { 
        console.error("Update error:", e);
        showToast(`Update failed: ${e.message}`, "error"); 
      }
    } else {
      if (u.role === UserRole.STUDENT) setStudents(prev => prev.map(s => s.id === u.id ? u : s));
      else setMembers(prev => prev.map(m => m.id === u.id ? u : m));
      // Update current user if editing own profile
      if (user && user.email === u.email) {
        setUser({ ...user, ...u });
      }
    }
  };

  const handleRemoveUser = async (id: string) => {
    if (isUsingFirebase && db) {
      try {
        await deleteDoc(doc(db, "students", id)).catch(() => {});
        await deleteDoc(doc(db, "members", id)).catch(() => {});
        showToast("Revoked cloud access.", "info");
      } catch (e) { showToast("Removal failed.", "error"); }
    } else {
      setStudents(prev => prev.filter(u => u.id !== id));
      setMembers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleBulkRemoveUser = async (ids: string[]) => {
    if (isUsingFirebase && db) {
      try {
        const batch = writeBatch(db);
        ids.forEach(id => {
          batch.delete(doc(db, "students", id));
          batch.delete(doc(db, "members", id));
        });
        await batch.commit();
        showToast(`Bulk revoked ${ids.length} accounts.`, "info");
      } catch (e) { showToast("Bulk action failed.", "error"); }
    } else {
      setStudents(prev => prev.filter(u => !ids.includes(u.id)));
      setMembers(prev => prev.filter(u => !ids.includes(u.id)));
    }
  };

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <Logo size="xl" className="animate-pulse-soft mb-8" />
        
        {dbError === 'DATABASE_MISSING' ? (
          <div className="max-w-md w-full bg-amber-50 border border-amber-200 rounded-[2.5rem] p-10 text-center space-y-6 shadow-xl shadow-amber-900/5 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-amber-900 uppercase tracking-tight">Cloud Integration</h2>
              <p className="text-sm font-medium text-amber-700 mt-2 leading-relaxed">
                Database <code className="bg-amber-100 px-1.5 rounded text-amber-900 font-bold">asm-nextgen</code> is not yet initialized in your Firebase Console.
              </p>
            </div>
            <div className="space-y-4">
              <a 
                href="https://console.firebase.google.com/project/asm-nextgen/firestore" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full py-4 bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-700 transition-all shadow-lg"
              >
                1. Click "Create Database" in Console
              </a>
              <button 
                onClick={handleBootstrapCloud}
                className="block w-full py-4 bg-white border-2 border-amber-200 text-amber-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-100 transition-all"
              >
                2. Seed Cloud Directory (Fix Login)
              </button>
              <button 
                onClick={() => { setIsDataLoaded(true); setDbError(null); }}
                className="text-[10px] font-black text-amber-500 uppercase tracking-widest hover:text-amber-600 transition-colors"
              >
                Continue Offline (Demo Mode)
              </button>
            </div>
            <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest leading-relaxed">
              Required: Go to Firebase → Firestore → Create Database → Test Mode
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${isUsingFirebase ? 'bg-indigo-600' : 'bg-emerald-500'} animate-[loading_2s_infinite_ease-in-out]`}></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">
              {isUsingFirebase ? 'Syncing Cloud Directory...' : 'Loading Campus Cache...'}
            </p>
          </div>
        )}
      </div>
    );
  }

  const handleLogin = (u: User) => { 
    setUser(u); 
    setShowLogin(false); 
    showToast(`Access granted: ${u.name}.`, 'success'); 
  };

  if (!user) {
    if (showLogin) return (
      <LoginForm 
        onLogin={handleLogin} 
        authorizedUsers={[...members, ...students]} 
        onPasswordChange={() => {}} 
        onBack={() => setShowLogin(false)} 
        availableRoles={Object.values(UserRole)} 
      />
    );
    return <LandingPage onEnterPortal={() => setShowLogin(true)} />;
  }

  const filteredGrievances = grievances.filter(g => {
    if ([UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.REGISTRAR, UserRole.PRESIDENT].includes(user.role as UserRole)) return true;
    if (user.role === UserRole.STUDENT) return g.userId === user.id;
    if (user.role === UserRole.FACULTY || user.role === UserRole.HOD || user.role === UserRole.DEAN) {
       return g.category === user.assignedCategory;
    }
    return false;
  });

  return (
    <Layout 
      userRole={user.role as UserRole} 
      onLogout={() => setUser(null)} 
      activeTab={activeTab} 
      setActiveTab={(tab) => { setActiveTab(tab); setSelectedGrievance(null); }}
      notifications={notifications}
      onMarkAsRead={() => {}}
      onClearNotifications={() => {}}
      userName={user.name}
    >
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <div key={t.id} className={`px-6 py-4 rounded-2xl shadow-2xl text-xs font-black border animate-in slide-in-from-right-10 ${t.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-indigo-600 text-white border-indigo-500'}`}>
            {t.message}
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 left-4 z-40 flex items-center space-x-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 shadow-sm md:left-72">
        <div className={`w-2 h-2 rounded-full ${isUsingFirebase && !dbError ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 animate-pulse'}`}></div>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
          {isUsingFirebase && !dbError ? 'Connected: ASM Cloud' : 'Standby: Offline Access'}
        </span>
      </div>

      {activeTab === 'dashboard' && <Dashboard grievances={filteredGrievances} user={user} />}
      {activeTab === 'grievances' && !selectedGrievance && (
        <GrievanceList 
          grievances={filteredGrievances} 
          userRole={user.role as UserRole} 
          onSelect={setSelectedGrievance} 
          onBulkUpdate={handleBulkUpdateGrievances}
        />
      )}
      {selectedGrievance && (
        <GrievanceDetail 
          grievance={selectedGrievance} 
          userRole={user.role as UserRole} 
          onUpdateStatus={handleUpdateGrievanceStatus} 
          onAddReply={handleAddReply} 
          onAddFeedback={() => {}} 
          onBack={() => setSelectedGrievance(null)} 
        />
      )}
      {activeTab === 'members' && user.role === UserRole.ADMIN && (
        <UserManagement 
          members={members} 
          students={students} 
          onAddUser={handleAddUser} 
          onRemoveUser={handleRemoveUser} 
          onBulkRemoveUser={handleBulkRemoveUser} 
          onUpdateUser={handleUpdateUser} 
          availableRoles={[...Object.values(UserRole), ...customRoles]} 
          onAddRole={(role) => setCustomRoles([...customRoles, role])} 
          availableDepartments={departments} 
          onAddDepartment={(dept) => setDepartments([...departments, dept])} 
          onRemoveDepartment={(dept) => setDepartments(departments.filter(d => d !== dept))} 
        />
      )}
      {activeTab === 'new' && user.role === UserRole.STUDENT && (
        <GrievanceForm onSubmit={handleAddGrievance} user={user} />
      )}
      {activeTab === 'profile' && (
        <Profile 
          user={user} 
          onUpdateProfile={(updates) => handleUpdateUser({ ...user, ...updates })} 
        />
      )}
    </Layout>
  );
};

export default App;