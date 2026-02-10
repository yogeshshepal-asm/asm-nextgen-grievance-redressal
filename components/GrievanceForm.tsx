
import React, { useState, useRef } from 'react';
import { GrievanceCategory, Attachment } from '../types.ts';
import { analyzeGrievance } from '../services/geminiService.ts';

interface CommonIssue {
  label: string;
  subject: string;
  template: string;
}

const COMMON_ISSUES: Record<string, CommonIssue[]> = {
  'Academic': [
    { label: 'ERP Login Issues', subject: 'Difficulty accessing ERP portal', template: 'I am unable to log in to my ERP account despite using correct credentials. I need access to check my internal marks and attendance.' },
    { label: 'Study Material Missing', subject: 'Course materials not uploaded on portal', template: 'The notes and slides for [Subject Name] have not been uploaded for the current semester.' },
    { label: 'Exam Schedule Issue', subject: 'Exam date/time conflict or error', template: 'There is a conflict in my exam schedule on [Date]. [Subject A] and [Subject B] are scheduled at the same time.' },
    { label: 'Internal Assessment Marks', subject: 'Discrepancy in internal marks', template: 'I believe my internal marks for [Subject] are incorrect. My assessment answers were good but I received a low score.' },
    { label: 'Faculty Absence', subject: 'Frequent faculty absence from classes', template: 'Our faculty member for [Subject] has been absent multiple times without notice, affecting our syllabus progress.' },
    { label: 'Course Access Problem', subject: 'Cannot access course content', template: 'I am unable to access course materials and assignments for [Course Name] despite being enrolled.' },
  ],
  'Infrastructure': [
    { label: 'Wifi Signal Weak', subject: 'Unstable Wifi connection', template: 'The wifi signal in my [Location] is very weak and keeps disconnecting frequently.' },
    { label: 'Canteen Hygiene', subject: 'Canteen cleanliness concern', template: 'I noticed issues with the cleanliness of the serving area and food preparation environment.' },
    { label: 'Lab Equipment Broken', subject: 'Non-functional lab equipment', template: 'Several equipment in [Lab Name] are not functioning properly, affecting our practical sessions.' },
    { label: 'Classroom Maintenance', subject: 'Classroom cleanliness/maintenance issue', template: 'The classroom [Room Number] has poor ventilation, broken fans, and needs immediate cleaning.' },
    { label: 'Water Supply Issue', subject: 'No drinking water available', template: 'The drinking water coolers in [Location] are not working, causing inconvenience to students.' },
    { label: 'Library Infrastructure', subject: 'Library facility problem', template: 'The library air conditioning is not working properly and many fans/lights are non-functional.' },
  ],
  'Financial': [
    { label: 'Fee Deduction Query', subject: 'Unexplained fee charge', template: 'I was charged an additional fee of Rs. [Amount] for [Purpose]. I do not understand why this charge was applied.' },
    { label: 'Scholarship Delay', subject: 'Scholarship payment delayed', template: 'My scholarship for [Semester] has not been disbursed yet. Please provide the status of my application.' },
    { label: 'Fee Refund Issue', subject: 'Pending refund request', template: 'I withdrew from [Course] and submitted a refund request on [Date]. The refund has not been processed.' },
    { label: 'Scholarship Eligibility', subject: 'Query on scholarship eligibility', template: 'I would like to know if I am eligible for [Scholarship Type] and what documents are required.' },
    { label: 'Receipt Missing', subject: 'Fee receipt not generated', template: 'I paid my fees on [Date] but did not receive a receipt or acknowledgment.' },
  ],
  'Administrative': [
    { label: 'Certificate Delay', subject: 'Degree/Academic certificate pending', template: 'I completed my course in [Month/Year] but my certificate has not been issued yet.' },
    { label: 'ID Card Not Issued', subject: 'Student ID card issue', template: 'I submitted my ID card application on [Date] and still have not received it.' },
    { label: 'Document Authentication', subject: 'Certificate/Transcript authentication needed', template: 'I need an officially authenticated copy of my [Document] for [Purpose].' },
    { label: 'Transcript Issue', subject: 'Academic transcript not generated', template: 'I requested my academic transcript but it has not been provided for [Reason].' },
    { label: 'Name/Details Correction', subject: 'Error in official records', template: 'There is a spelling error in my name/details in the official records. It shows [Wrong Detail] instead of [Correct Detail].' },
  ],
  'Hostel': [
    { label: 'Room Allocation Issue', subject: 'Hostel room allocation problem', template: 'I was not allocated a hostel room despite applying on time for [Semester].' },
    { label: 'Room Maintenance', subject: 'Room condition inadequate', template: 'My hostel room has [Issue: broken window, leaking ceiling, etc.]. Please arrange repairs.' },
    { label: 'Mess Food Quality', subject: 'Poor quality mess food', template: 'The quality and hygiene of mess food has deteriorated significantly. The food is often stale and unhygienic.' },
    { label: 'Mess Bill Issue', subject: 'Discrepancy in mess charges', template: 'I was charged Rs. [Amount] for mess in [Month], but I was absent for [Days] days.' },
    { label: 'Hostel Discipline', subject: 'Unfair hostel discipline action', template: 'I was penalized for [Reason] without proper investigation or hearing from the hostel warden.' },
    { label: 'Security Concern', subject: 'Security issue in hostel', template: 'The hostel security gates are often left unattended, and unauthorized persons enter the premises.' },
  ],
  'General': [
    { label: 'Unfair Evaluation', subject: 'Assessment seemed unfair', template: 'I believe my evaluation in [Subject/Activity] was not fair. The evaluation criteria were not clearly communicated.' },
    { label: 'Bullying/Harassment', subject: 'Student bullying or workplace harassment', template: 'I have been experiencing [Type of harassment] from [Person/Group]. This has affected my mental health.' },
    { label: 'Disability Support', subject: 'Lack of support for students with disabilities', template: 'As a student with [Disability], I am not receiving adequate support. I need [Required accommodation].' },
    { label: 'Workload Concern', subject: 'Excessive academic workload', template: 'The amount of assignments and projects given is excessive and unrealistic to complete in the given time.' },
    { label: 'Event Cancellation', subject: 'Unannounced event or class cancellation', template: '[Event/Class] was cancelled without prior notice at the last moment, causing inconvenience.' },
  ]
};

interface GrievanceFormProps {
  onSubmit: (grievance: any) => void;
  user: any;
}

const GrievanceForm: React.FC<GrievanceFormProps> = ({ onSubmit, user }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [routingStatus, setRoutingStatus] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedIssueKey, setSelectedIssueKey] = useState<string>('custom');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    setValidationError(null);
    let files: FileList | null = null;
    if (e.target && 'files' in (e.target as any) && (e.target as any).files) {
      files = (e.target as any).files;
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      files = e.dataTransfer.files;
    }

    if (!files || files.length === 0) return;

    const remainingSlots = 3 - attachments.length;
    if (remainingSlots <= 0) {
      setValidationError("Maximum 3 attachments allowed.");
      return;
    }

    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [...prev, { name: file.name, type: file.type, data: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <div className="text-rose-500 flex flex-col items-center"><svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg><span className="text-[8px] font-black uppercase mt-1">PDF</span></div>;
    if (ext?.includes('doc')) return <div className="text-blue-500 flex flex-col items-center"><svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1.01.707.293l5.414 5.414a1 1.01.293.707V19a2 2 0 01-2 2z" /></svg><span className="text-[8px] font-black uppercase mt-1">DOCX</span></div>;
    return <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" /></svg>;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;
    setIsSubmitting(true);
    setRoutingStatus('AI analyzing incident details...');
    const analysis = await analyzeGrievance(description, subject);
    
    const newGrievance = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      userId: user.id, userName: user.name, userRole: user.role,
      subject, description, attachments,
      category: analysis?.category || GrievanceCategory.GENERAL,
      priority: analysis?.priority || 'Medium',
      status: 'Pending',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      aiInsights: analysis ? { sentiment: analysis.sentiment, summary: analysis.summary, suggestedAction: analysis.suggestedAction } : undefined
    };

    setTimeout(() => {
      onSubmit(newGrievance);
      setIsSubmitting(false);
      setSubject(''); setDescription(''); setAttachments([]);
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-10">
        <div className="flex items-center space-x-4 mb-10">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg rotate-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">Lodge Grievance</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Institutional Oversight System</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Quick Select Common Issue</label>
              <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                value={selectedIssueKey} onChange={(e) => {
                  const val = e.target.value; setSelectedIssueKey(val);
                  if (val === 'custom') { setSubject(''); setDescription(''); return; }
                  for (const cat in COMMON_ISSUES) {
                    const issue = COMMON_ISSUES[cat].find(i => i.label === val);
                    if (issue) { setSubject(issue.subject); setDescription(issue.template); break; }
                  }
                }}>
                <option value="custom">New Custom Issue</option>
                {Object.entries(COMMON_ISSUES).map(([cat, issues]) => (
                  <optgroup key={cat} label={cat}>{issues.map(i => <option key={i.label} value={i.label}>{i.label}</option>)}</optgroup>
                ))}
              </select>
            </div>
            <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none" />
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the incident..." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none resize-none" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supporting Evidence</label>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full ${attachments.length >= 3 ? 'bg-rose-100 text-rose-600' : attachments.length >= 2 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                {attachments.length} / 3 FILES
              </span>
            </div>

            <div onClick={() => attachments.length < 3 && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-400'}`}>
              <svg className="h-8 w-8 mx-auto text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attach Photos or Documents</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*,application/pdf,.doc,.docx" />
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {attachments.map((f, i) => (
                  <div key={i} className="group relative bg-white border border-slate-200 rounded-2xl p-2 shadow-sm hover:shadow-md transition-all">
                    <button type="button" onClick={() => setAttachments(p => p.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-rose-600"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                    <div className="h-16 flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden">
                      {f.type.startsWith('image/') ? <img src={f.data} className="object-cover w-full h-full" /> : getFileIcon(f.name)}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tight block mt-1 truncate px-1">{f.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
            {isSubmitting ? routingStatus : 'Lodge Incident'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GrievanceForm;
