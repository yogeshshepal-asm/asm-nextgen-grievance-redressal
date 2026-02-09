import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, GrievanceCategory } from '../types';

interface UserManagementProps {
  members: User[];
  students: User[];
  onAddUser: (user: User) => void;
  onRemoveUser: (id: string) => void;
  onBulkRemoveUser: (ids: string[]) => void;
  onUpdateUser: (user: User) => void;
  availableRoles: string[];
  onAddRole: (role: string) => void;
  availableDepartments: string[];
  onAddDepartment: (dept: string) => void;
  onRemoveDepartment: (dept: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  members, 
  students, 
  onAddUser, 
  onRemoveUser, 
  onBulkRemoveUser,
  onUpdateUser,
  availableRoles,
  onAddRole,
  availableDepartments,
  onAddDepartment,
  onRemoveDepartment
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'students'>('members');
  const [isAdding, setIsAdding] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [newRoleInput, setNewRoleInput] = useState('');
  const [newDeptInput, setNewDeptInput] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.FACULTY as string,
    department: availableDepartments[0] || 'Engineering',
    assignedCategory: GrievanceCategory.GENERAL,
    studentClass: ''
  });

  // Reset selection when switching tabs
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);

  const validateEmail = (email: string) => email.toLowerCase().endsWith('@asmedu.org');

  const checkDuplicateEmail = (email: string, role: string, excludeId?: string) => {
    const targetList = role === UserRole.STUDENT ? students : members;
    return targetList.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== excludeId);
  };

  const getDepartmentHod = (deptName: string) => {
    return members.find(u => u.role === UserRole.HOD && u.department === deptName);
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateEmail(formData.email)) {
      setFormError("Security Violation: Only institutional @asmedu.org domains are permitted.");
      return;
    }

    if (checkDuplicateEmail(formData.email, formData.role, editingUser?.id)) {
      setFormError(`User with email ${formData.email} already exists in the ${formData.role} directory.`);
      return;
    }

    // Check HoD constraint: One HoD per department
    if (formData.role === UserRole.HOD) {
      const existingHod = getDepartmentHod(formData.department);
      if (existingHod && existingHod.id !== editingUser?.id) {
        setFormError(`Conflict: ${existingHod.name} is already assigned as HoD for ${formData.department}. Please remove them or change the department first.`);
        return;
      }
    }

    const canHaveCategory = 
      formData.role === UserRole.FACULTY || 
      formData.role === UserRole.ADMIN || 
      formData.role === UserRole.DEAN; // Added DEAN, Removed DEPT_ADMIN (Dept scoped)

    const userPayload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      assignedCategory: canHaveCategory ? formData.assignedCategory : undefined,
      studentClass: formData.role === UserRole.STUDENT ? formData.studentClass : undefined
    };

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        ...userPayload
      });
      setEditingUser(null);
    } else {
      const newUser: User = {
        id: `${formData.role === UserRole.STUDENT ? 'std' : 'usr'}-${Math.random().toString(36).substr(2, 5)}`,
        ...userPayload
      };
      onAddUser(newUser);
    }
    
    resetForm();
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rows = bulkData.split('\n');
    let addedCount = 0;
    const errors: string[] = [];

    rows.forEach((row, index) => {
      if (!row.trim()) return;
      const [name, email, studentClass, dept] = row.split(',').map(s => s.trim());
      
      if (!name || !email) {
        errors.push(`Row ${index + 1}: Missing name or email.`);
        return;
      }

      if (!validateEmail(email)) {
        errors.push(`Row ${index + 1}: Invalid email domain (${email}).`);
        return;
      }

      if (checkDuplicateEmail(email, UserRole.STUDENT)) {
        errors.push(`Row ${index + 1}: Duplicate email (${email}).`);
        return;
      }

      // Check if provided department exists, if not use default
      const finalDept = availableDepartments.find(d => d.toLowerCase() === (dept || '').toLowerCase()) || availableDepartments[0] || 'Engineering';

      onAddUser({
        id: `std-${Math.random().toString(36).substr(2, 5)}`,
        name,
        email,
        role: UserRole.STUDENT,
        studentClass: studentClass || '',
        department: finalDept
      });
      addedCount++;
    });

    if (errors.length > 0) {
      alert(`Processed ${addedCount} users with some errors:\n${errors.join('\n')}`);
    } 

    setBulkData('');
    setIsBulkMode(false);
  };

  const handleCreateRole = () => {
    if (newRoleInput.trim()) {
      onAddRole(newRoleInput.trim());
      setNewRoleInput('');
    }
  };

  const handleCreateDept = () => {
    if (newDeptInput.trim()) {
      onAddDepartment(newDeptInput.trim());
      setNewDeptInput('');
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      email: '', 
      role: activeTab === 'students' ? UserRole.STUDENT : UserRole.FACULTY,
      department: availableDepartments[0] || 'Engineering', 
      assignedCategory: GrievanceCategory.GENERAL, 
      studentClass: '' 
    });
    setIsAdding(false);
    setEditingUser(null);
    setFormError(null);
  };

  const openAddForm = () => {
    setFormData({
      name: '',
      email: '',
      role: activeTab === 'students' ? UserRole.STUDENT : UserRole.FACULTY,
      department: availableDepartments[0] || 'Engineering',
      assignedCategory: GrievanceCategory.GENERAL,
      studentClass: ''
    });
    setEditingUser(null);
    setFormError(null);
    setIsAdding(true);
    setIsBulkMode(false);
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      assignedCategory: user.assignedCategory || GrievanceCategory.GENERAL,
      studentClass: user.studentClass || ''
    });
    setIsAdding(true);
    setIsBulkMode(false);
    setFormError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredList = useMemo(() => {
    const list = activeTab === 'members' ? members : students;
    if (!searchTerm) return list;
    const lower = searchTerm.toLowerCase();
    return list.filter(u => 
      u.name.toLowerCase().includes(lower) || 
      u.email.toLowerCase().includes(lower) || 
      u.department.toLowerCase().includes(lower) ||
      (u.studentClass && u.studentClass.toLowerCase().includes(lower)) ||
      (u.assignedCategory && u.assignedCategory.toLowerCase().includes(lower)) ||
      u.role.toLowerCase().includes(lower)
    );
  }, [activeTab, members, students, searchTerm]);

  // Selection Handlers
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
    if (selectedIds.size === filteredList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredList.map(u => u.id)));
    }
  };

  const handleBulkDelete = () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedIds.size} users? This action cannot be undone.`);
    if (confirmDelete) {
      onBulkRemoveUser(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleExport = () => {
    if (filteredList.length === 0) {
      alert('No data to export.');
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Role', 'Department', 'Class/Category'];
    const rows = filteredList.map(u => [
      u.id,
      u.name,
      u.email,
      u.role,
      u.department,
      u.studentClass || u.assignedCategory || 'N/A'
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `asm_${activeTab}_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h3>
          <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">ASM Nextgen Administrative Control</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
          <button 
            onClick={() => { setActiveTab('members'); resetForm(); setSearchTerm(''); }}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'members' ? 'bg-white text-[#1a73b8] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Staff / Other Roles
          </button>
          <button 
            onClick={() => { setActiveTab('students'); resetForm(); setSearchTerm(''); }}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'students' ? 'bg-white text-[#1a73b8] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Students
          </button>
        </div>
      </div>

      {/* Configuration Area (Admin Only) */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Role Config */}
          <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex flex-col gap-4">
            <div>
              <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest mb-1">Role Configuration</h4>
              <p className="text-[10px] text-slate-500">Add user roles for access control (e.g. 'Guest', 'Auditor').</p>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="New Role Name" 
                className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1a73b8] outline-none bg-white font-medium"
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRole()}
              />
              <button 
                onClick={handleCreateRole}
                disabled={!newRoleInput.trim()}
                className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableRoles.map(r => (
                <span key={r} className="bg-white border border-indigo-100 text-indigo-600 px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Department Config */}
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex flex-col gap-4">
            <div>
              <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-1">Department Management</h4>
              <p className="text-[10px] text-slate-500">Manage academic departments and assigned HoDs.</p>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="New Department" 
                className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                value={newDeptInput}
                onChange={(e) => setNewDeptInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateDept()}
              />
              <button 
                onClick={handleCreateDept}
                disabled={!newDeptInput.trim()}
                className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 max-h-48 overflow-y-auto pr-1">
              {availableDepartments.map(d => {
                const hod = getDepartmentHod(d);
                return (
                  <div key={d} className="bg-white border border-emerald-100 rounded-xl p-3 flex justify-between items-center shadow-sm group">
                     <div>
                        <div className="font-bold text-emerald-800 text-xs">{d}</div>
                        <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                          {hod ? (
                            <>
                              <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              <span className="truncate max-w-[100px]" title={hod.name}>{hod.name} (HoD)</span>
                            </>
                          ) : (
                            <span className="text-slate-400 italic">No HoD Assigned</span>
                          )}
                        </div>
                     </div>
                     <button 
                       onClick={() => {
                          if (window.confirm(`Delete department '${d}'?`)) {
                            onRemoveDepartment(d);
                          }
                       }}
                       className="text-emerald-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all px-2"
                     >
                       ×
                     </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Floating Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-6 border border-slate-800">
            <span className="text-xs font-bold">{selectedIds.size} users selected</span>
            <div className="h-4 w-px bg-slate-700"></div>
            <button 
              onClick={handleBulkDelete}
              className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 flex items-center space-x-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Bulk Delete</span>
            </button>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="ml-2 text-slate-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={isAdding ? resetForm : openAddForm}
            className={`px-5 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1a5da1] transition-all flex items-center space-x-2 shadow-lg shadow-[#1a73b8]/20 ${isAdding ? 'bg-slate-800' : 'bg-[#1a73b8]'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>{isAdding ? 'Close Form' : `Add ${activeTab === 'students' ? 'Student' : 'User'}`}</span>
          </button>

          <button 
             onClick={handleExport}
             className="px-5 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all flex items-center space-x-2 shadow-lg shadow-emerald-500/20"
             title="Download CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden md:inline">Export</span>
          </button>

          {activeTab === 'students' && (
            <button 
              onClick={() => { setIsBulkMode(!isBulkMode); setIsAdding(false); setFormError(null); }}
              className="px-5 py-3 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all flex items-center space-x-2 border border-slate-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span>{isBulkMode ? 'Close Import' : 'Bulk Import'}</span>
            </button>
          )}
        </div>

        <div className="relative w-full md:w-80">
          <input 
            type="text"
            placeholder="Search directory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#1a73b8] outline-none transition-all placeholder:text-slate-400"
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl border border-[#1a73b8]/20 shadow-xl shadow-[#1a73b8]/5 animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#71bf44] to-[#1a73b8]"></div>
          <h4 className="text-xs font-black text-[#1a73b8] uppercase tracking-widest mb-2">
            {editingUser ? 'Update User Information' : `New Registration`}
          </h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-6">Default access key for new users will be <span className="text-slate-800">asm@123</span></p>
          
          {formError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-3 text-rose-600 text-xs font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                required
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#1a73b8] outline-none transition-all font-medium placeholder:text-slate-300"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Rahul Verma"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Email</label>
              <input 
                required
                type="email"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#1a73b8] outline-none transition-all font-medium placeholder:text-slate-300"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="id@asmedu.org"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Role</label>
              <div className="relative">
                <select 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#1a73b8] outline-none transition-all font-medium appearance-none"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  {availableRoles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
              <select 
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#1a73b8] outline-none transition-all font-medium"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                {availableDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {formData.role === UserRole.STUDENT && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class / Division</label>
                <input 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#1a73b8] outline-none transition-all font-medium placeholder:text-slate-300"
                  value={formData.studentClass}
                  onChange={(e) => setFormData({...formData, studentClass: e.target.value})}
                  placeholder="e.g. SY-CS-A"
                />
              </div>
            )}

            {(formData.role === UserRole.FACULTY || formData.role === UserRole.ADMIN || formData.role === UserRole.DEAN) && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Cell</label>
                <select 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#1a73b8] outline-none transition-all font-medium"
                  value={formData.assignedCategory}
                  onChange={(e) => setFormData({...formData, assignedCategory: e.target.value as GrievanceCategory})}
                >
                  {Object.values(GrievanceCategory).map(cat => (
                    <option key={cat} value={cat}>{cat} Cell</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="lg:col-span-1 flex gap-3">
              {editingUser && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="flex-1 px-4 py-3.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                className={`flex-1 px-4 py-3.5 bg-[#1a73b8] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#1a5da1] shadow-xl shadow-[#1a73b8]/20 transition-all ${!editingUser ? 'w-full' : ''}`}
              >
                {editingUser ? 'Save' : `Register`}
              </button>
            </div>
          </form>
        </div>
      )}

      {isBulkMode && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-50 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Bulk Import Students</h4>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Format: Name, Email, Class, Department (One per line)</p>
            </div>
             <div className="bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
               <p className="text-[9px] font-black text-indigo-600 uppercase tracking-wide">Default Password: asm@123</p>
             </div>
          </div>
          <form onSubmit={handleBulkSubmit} className="space-y-6">
            <div className="relative">
              <textarea
                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-mono focus:ring-2 focus:ring-[#1a73b8] outline-none transition-all resize-none min-h-[200px]"
                placeholder={"Rahul Verma, rahul.v@asmedu.org, SY-A, Engineering\nSneha Patil, sneha.p@asmedu.org, TY-B, Management"}
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
              />
              <div className="absolute top-4 right-4 text-[9px] font-black text-slate-300 uppercase tracking-widest bg-white px-2 py-1 rounded-lg border border-slate-100">
                CSV Mode
              </div>
            </div>
            <button type="submit" className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 shadow-xl transition-all">
              Initialize Bulk Onboarding
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 w-16">
                  <input 
                    type="checkbox" 
                    className="rounded text-[#1a73b8] focus:ring-[#1a73b8]"
                    checked={filteredList.length > 0 && selectedIds.size === filteredList.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User Profile</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {activeTab === 'members' ? 'Role / Department' : 'Academic Details'}
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-400 text-sm italic">
                    {searchTerm ? `No users matching "${searchTerm}" found.` : `The ${activeTab} directory is currently empty.`}
                  </td>
                </tr>
              ) : (
                filteredList.map(user => (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-slate-50/50 transition-colors group ${selectedIds.has(user.id) ? 'bg-[#1a73b8]/5' : ''}`}
                  >
                    <td className="px-8 py-5">
                      <input 
                        type="checkbox" 
                        className="rounded text-[#1a73b8] focus:ring-[#1a73b8]"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                      />
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-2xl bg-[#1a73b8]/5 border border-[#1a73b8]/10 flex items-center justify-center text-[#1a73b8] font-black text-sm group-hover:scale-110 transition-transform">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900">{user.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{user.email}</div>
                          <div className="md:hidden text-[9px] font-bold text-indigo-500 uppercase mt-1">{user.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col space-y-1">
                        <span className="text-[10px] font-black text-slate-700">
                          {user.studentClass ? `${user.studentClass} • ` : ''}{user.department}
                        </span>
                        {user.assignedCategory && (
                          <span className="px-3 py-1 bg-[#71bf44] text-white text-[8px] font-black uppercase tracking-widest rounded-lg w-fit shadow-sm">
                            {user.assignedCategory} Lead
                          </span>
                        )}
                        {/* Show Role Badge for non-students */}
                        {user.role !== UserRole.STUDENT && (
                           <span className="px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg w-fit shadow-sm">
                             {user.role}
                           </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Access</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => startEdit(user)}
                          className="p-2.5 text-slate-400 hover:text-[#1a73b8] hover:bg-[#1a73b8]/5 rounded-xl transition-all"
                          title="Edit User"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Revoke all access for ${user.name}?`)) {
                              onRemoveUser(user.id);
                            }
                          }}
                          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Revoke Access"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;