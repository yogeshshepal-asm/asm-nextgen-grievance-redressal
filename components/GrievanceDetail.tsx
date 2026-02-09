
import React, { useState, useEffect, useRef } from 'react';
import { Grievance, GrievanceStatus, UserRole, Attachment, Reply } from '../types.ts';
import { generateResponseDraft } from '../services/geminiService.ts';

interface GrievanceDetailProps {
  grievance: Grievance;
  userRole: UserRole;
  onUpdateStatus: (id: string, status: GrievanceStatus) => void;
  onAddReply: (id: string, text: string, attachments?: Attachment[]) => void;
  onAddFeedback: (id: string, rating: number, feedback: string) => void;
  onBack: () => void;
}

const GrievanceDetail: React.FC<GrievanceDetailProps> = ({ 
  grievance, 
  userRole, 
  onUpdateStatus, 
  onAddReply, 
  onAddFeedback, 
  onBack 
}) => {
  const [replyText, setReplyText] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<Attachment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const repliesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [grievance.replies]);

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    try {
      const text = await generateResponseDraft(grievance);
      if (text) {
        setReplyText(text);
      }
    } catch (err) {
      console.error("Failed to generate draft", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const remaining = 3 - replyAttachments.length;
    Array.from(e.target.files).slice(0, remaining).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setReplyAttachments(p => [...p, { 
        name: file.name, 
        type: file.type, 
        data: reader.result as string 
      }]);
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim() || replyAttachments.length > 0) {
      onAddReply(grievance.id, replyText, replyAttachments);
      setReplyText('');
      setReplyAttachments([]);
    }
  };

  const getProgressStep = (status: GrievanceStatus) => {
    switch (status) {
      case GrievanceStatus.PENDING: return 0;
      case GrievanceStatus.IN_PROGRESS: return 2;
      case GrievanceStatus.RESOLVED:
      case GrievanceStatus.REJECTED: return 3;
      default: return 0;
    }
  };

  const steps = [
    { label: 'Submitted', description: 'Grievance received & logged' },
    { label: 'Assigned', description: 'Relevant Cell allocated' },
    { label: 'Processing', description: 'Investigation in progress' },
    { label: 'Decision', description: 'Final outcome declared' }
  ];

  const currentStepIndex = getProgressStep(grievance.status);
  const isRejected = grievance.status === GrievanceStatus.REJECTED;

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <svg className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    return <svg className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1.01.707.293l5.414 5.414a1 1.01.293.707V19a2 2 0 01-2 2z" /></svg>;
  };

  const canEdit = userRole !== UserRole.STUDENT;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-6">
      <button onClick={onBack} className="flex items-center text-slate-400 hover:text-indigo-600 transition-colors uppercase text-[10px] font-black tracking-widest px-2 group">
        <svg className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to List
      </button>

      {/* Case Progress Workflow Bar */}
      <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm overflow-x-auto">
        <div className="min-w-[600px] relative px-4 pt-6 pb-2">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 w-full h-1 bg-slate-100 z-0 rounded-full"></div>
          <div 
            className={`absolute top-6 left-0 h-1 transition-all duration-1000 ease-out z-0 rounded-full ${isRejected && currentStepIndex === 3 ? 'bg-rose-500' : 'bg-indigo-600'}`}
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          ></div>

          <div className="relative z-10 flex justify-between w-full">
            {steps.map((step, idx) => {
              const isActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              
              return (
                <div key={idx} className="flex flex-col items-center relative group w-24">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                    <div className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap relative tracking-wide">
                      {step.description}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </div>

                  <div 
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 z-10 relative
                      ${isActive 
                        ? (isRejected && idx === 3 ? 'bg-rose-500 border-rose-100 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-indigo-600 border-indigo-100 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]') 
                        : 'bg-white border-slate-200 text-slate-300'
                      }
                      ${isCurrent ? 'scale-125 ring-4 ring-indigo-50 shadow-lg' : 'group-hover:scale-105'}
                    `}
                  >
                    {isCurrent && (
                       <span className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isRejected ? 'bg-rose-500' : 'bg-indigo-600'}`}></span>
                    )}
                    
                    {isActive && !isCurrent ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span className="text-sm font-black">{idx + 1}</span>
                    )}
                  </div>
                  
                  {/* Labels */}
                  <div className={`mt-5 text-center transition-all duration-500 ${isCurrent ? 'transform translate-y-0 opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                    <span className={`block text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                      {idx === 3 && isRejected ? 'Rejected' : 
                       idx === 3 && grievance.status === GrievanceStatus.RESOLVED ? 'Resolved' : 
                       step.label}
                    </span>
                    
                    {isCurrent && (
                      <span className={`
                        inline-block mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wide shadow-sm
                        ${isRejected ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}
                      `}>
                        Current Stage
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden mt-10">
        {/* Header section with status and meta info */}
        <div className="p-8 md:p-10 bg-slate-50 border-b border-slate-100">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-3 py-1 bg-white border border-indigo-100 rounded-full">Case #{grievance.id.toUpperCase()}</span>
                {grievance.aiInsights?.sentiment && (
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${grievance.aiInsights.sentiment === 'Negative' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    AI Sentiment: {grievance.aiInsights.sentiment}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-4 leading-tight">{grievance.subject}</h1>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200">
                  <span className="text-[8px] font-black text-slate-400 uppercase block">Category</span>
                  <span className="text-xs font-bold">{grievance.category}</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200">
                  <span className="text-[8px] font-black text-slate-400 uppercase block">Priority</span>
                  <span className={`text-xs font-black ${grievance.priority === 'High' ? 'text-rose-600' : 'text-slate-900'}`}>{grievance.priority}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase mb-2 px-1 text-right">Lifecycle Management</span>
              {canEdit ? (
                <select 
                  className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm transition-all"
                  value={grievance.status} 
                  onChange={(e) => onUpdateStatus(grievance.id, e.target.value as GrievanceStatus)}
                >
                  {Object.values(GrievanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase border shadow-sm ${
                  grievance.status === GrievanceStatus.RESOLVED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  grievance.status === GrievanceStatus.REJECTED ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {grievance.status}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10 space-y-12">
          {/* AI Intelligence Brief */}
          {grievance.aiInsights && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Executive Brief</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm">
                         <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1.01.707.293l5.414 5.414a1 1.01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Summary</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{grievance.aiInsights.summary}</p>
                  </div>
                </div>
                
                <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm text-indigo-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Suggested Action</span>
                    </div>
                    <p className="text-sm font-bold text-indigo-900 leading-relaxed">{grievance.aiInsights.suggestedAction}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Narrative Content */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Initial Report</h3>
            <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 text-slate-700 leading-relaxed font-medium whitespace-pre-wrap text-sm md:text-base">
              {grievance.description}
            </div>
          </div>

          {/* Evidence Grid */}
          {grievance.attachments && grievance.attachments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Evidence Vault ({grievance.attachments.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {grievance.attachments.map((f, i) => (
                  <div key={i} className="group relative aspect-square bg-slate-50 border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                    {f.type.startsWith('image/') ? (
                      <img src={f.data} className="object-cover w-full h-full" alt={f.name} />
                    ) : (
                      <div className="flex items-center justify-center h-full">{getFileIcon(f.name)}</div>
                    )}
                    <a href={f.data} download={f.name} className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-[2px] text-white space-y-2 p-4 text-center">
                      <svg className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      <span className="text-[9px] font-black uppercase tracking-widest truncate w-full">{f.name}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline of Activity */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Communication Thread</h3>
            <div className="space-y-6">
              {grievance.replies && grievance.replies.length > 0 ? (
                grievance.replies.map((r) => (
                  <div key={r.id} className={`flex flex-col ${r.authorRole !== UserRole.STUDENT ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[90%] md:max-w-[80%] p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm ${r.authorRole !== UserRole.STUDENT ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'}`}>
                      <p className="text-sm font-medium leading-relaxed">{r.text}</p>
                      {r.attachments && r.attachments.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {r.attachments.map((at, idx) => (
                            <a key={idx} href={at.data} download={at.name} className="flex items-center gap-2 px-3 py-1.5 bg-black/10 rounded-lg hover:bg-black/20 transition-colors text-[10px] font-bold">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              {at.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] font-black text-slate-400 mt-2 uppercase tracking-[0.15em] px-2">
                      {r.authorName} ({r.authorRole}) • {new Date(r.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Cell Response</p>
                </div>
              )}
              <div ref={repliesEndRef} />
            </div>
          </div>
        </div>

        {/* Message Input with AI Draft Tool */}
        {grievance.status !== GrievanceStatus.RESOLVED && grievance.status !== GrievanceStatus.REJECTED && (
          <div className="p-8 md:p-10 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4 px-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compose Update</label>
              {canEdit && (
                <button 
                  onClick={handleGenerateDraft}
                  disabled={isGenerating}
                  className="flex items-center gap-2 text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest disabled:opacity-50"
                >
                  <svg className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  {isGenerating ? 'AI Drafting...' : 'AI Assist Draft'}
                </button>
              )}
            </div>
            
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div className="relative">
                <textarea 
                  value={replyText} 
                  onChange={(e) => setReplyText(e.target.value)} 
                  placeholder="Record actions taken or request more information..." 
                  className="w-full p-6 pb-20 bg-white border border-slate-200 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-indigo-100 outline-none resize-none shadow-sm transition-all" 
                  rows={4} 
                />
                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                   <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
                  <div className="flex gap-1">
                    {replyAttachments.map((f, i) => (
                      <div key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[8px] font-black uppercase text-indigo-600 flex items-center gap-1">
                        {f.name.substring(0, 10)}...
                        <button type="button" onClick={() => setReplyAttachments(p => p.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-rose-600">×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="absolute bottom-4 right-4 p-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrievanceDetail;
