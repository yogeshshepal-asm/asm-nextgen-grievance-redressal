
import React, { useState } from 'react';
import Logo from './Logo.tsx';
import InfoModal from './InfoModal.tsx';

interface LandingPageProps {
  onEnterPortal: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterPortal }) => {
  const [activeModal, setActiveModal] = useState<'guidelines' | 'privacy' | 'support' | null>(null);

  const closeModal = () => setActiveModal(null);

  const scrollToFeatures = () => {
    const section = document.getElementById('features');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#71bf44]/10 selection:text-[#1a73b8]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo size="sm" showText={false} />
            <span className="font-black text-xl tracking-tight text-slate-900">ASM NEXTGEN TECHNICAL CAMPUS</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 mr-8">
            <button onClick={scrollToFeatures} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1a73b8] transition-colors">Features</button>
            <button onClick={() => setActiveModal('guidelines')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1a73b8] transition-colors">Guidelines</button>
            <button onClick={() => setActiveModal('privacy')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1a73b8] transition-colors">Privacy</button>
          </div>
          <button 
            onClick={onEnterPortal}
            className="px-6 py-2.5 bg-[#1a73b8] text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-[#1a5da1] transition-all shadow-lg shadow-[#1a73b8]/20 active:scale-95"
          >
            Portal Access
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#71bf44]/10 border border-[#71bf44]/20 rounded-full mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#71bf44] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#71bf44]"></span>
              </span>
              <span className="text-[10px] font-black text-[#71bf44] uppercase tracking-widest">Nextgen Redressal Engine</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8">
              Empowering Every <br/>
              <span className="text-[#1a73b8]">ASM Nextgen Voice.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium mb-10 max-w-xl leading-relaxed">
              Experience a streamlined, institutional governance portal. ASM Nextgen provides a transparent platform for students and faculty to resolve concerns with precision and care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onEnterPortal}
                className="px-8 py-4 bg-[#1a73b8] text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-[#1a5da1] hover:shadow-2xl hover:shadow-[#1a73b8]/20 transition-all flex items-center justify-center space-x-3"
              >
                <span>Launch Portal</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button 
                onClick={scrollToFeatures} 
                className="px-8 py-4 bg-slate-50 text-slate-600 font-black uppercase tracking-widest text-xs rounded-2xl border border-slate-200 hover:bg-white hover:border-[#71bf44] transition-all flex items-center justify-center"
              >
                Explore Features
              </button>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200 flex justify-center">
            <div className="relative z-10 bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 rotate-1 transform-gpu scale-110">
              <Logo size="xl" />
            </div>
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#1a73b8]/5 blur-[120px] rounded-full"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#71bf44]/10 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-black text-[#71bf44] uppercase tracking-[0.3em] mb-4">Institutional Standards</h2>
            <h3 className="text-4xl font-black text-slate-900">Excellence in Campus Support</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Official Verification',
                desc: 'Secure access via institutional @asmedu.org credentials, ensuring a legitimate environment for students and faculty.',
                icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                color: 'text-[#1a73b8]'
              },
              {
                title: 'Centralized Redressal',
                desc: 'All grievances are intelligently routed to specialized cells for academic, infrastructure, or administrative resolution.',
                icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
                color: 'text-[#71bf44]'
              },
              {
                title: 'Status Transparency',
                desc: 'Track the progress of your case from submission to resolution with clear timeline updates and accountability.',
                icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                color: 'text-[#1a73b8]'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 bg-slate-50 ${feature.color} rounded-2xl flex items-center justify-center mb-8`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{feature.title}</h4>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-100 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-8 text-center">
          <div className="flex flex-col items-center w-full">
            <Logo size="sm" className="mb-6" />
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
              © 2025 Audyogik Shikshan Mandal Nextgen Technical Campus • Developed by Dr. Yogesh Shepal (Associate Professor)
            </p>
          </div>
          <div className="flex items-center space-x-8 shrink-0">
            <button onClick={() => setActiveModal('privacy')} className="text-[10px] font-black text-slate-400 hover:text-[#1a73b8] uppercase tracking-widest transition-colors">Privacy Policy</button>
            <button onClick={() => setActiveModal('support')} className="text-[10px] font-black text-slate-400 hover:text-[#1a73b8] uppercase tracking-widest transition-colors">Help & Support</button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <InfoModal 
        isOpen={activeModal === 'guidelines'} 
        onClose={closeModal} 
        title="Grievance Submission Guidelines"
      >
        <div className="space-y-6">
          <p>
            The ASM Nextgen Grievance Redressal Portal operates under the strict guidelines of the Institutional Governance Policy. Please adhere to the following protocols to ensure your case is processed efficiently.
          </p>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 mb-2">1. Scope of Grievances</h4>
              <p>Grievances must pertain to official campus matters, including but not limited to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-500">
                <li>Academic discrepancies (evaluation, attendance, curriculum).</li>
                <li>Infrastructure maintenance (labs, classrooms, hostels, hygiene).</li>
                <li>Administrative delays (documents, fee processing, ID cards).</li>
                <li>Harassment or disciplinary misconduct.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2">2. Submission Integrity</h4>
              <p>
                All submissions must be factual and supported by evidence where possible. 
                <span className="text-rose-600 font-bold"> Frivolous, malicious, or false reporting is a violation of the Student Code of Conduct</span> and may lead to disciplinary action.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2">3. Resolution Timeline</h4>
              <p>
                The standard resolution timeframe is <span className="font-bold text-slate-900">3-5 business days</span> for Priority Level 'Low' and 'Medium' cases. High-priority cases involving safety or critical infrastructure are expedited for review within 24 hours.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2">4. Categorization</h4>
              <p>
                Users are responsible for selecting the most appropriate category for their grievance. Misclassified grievances may experience routing delays as they are transferred between departments.
              </p>
            </div>
          </div>
        </div>
      </InfoModal>

      <InfoModal 
        isOpen={activeModal === 'privacy'} 
        onClose={closeModal} 
        title="Privacy & Data Protection Policy"
      >
        <div className="space-y-6">
          <p>
            Audyogik Shikshan Mandal (ASM) is committed to protecting the privacy of its students and faculty. This policy outlines how your data is handled within the Nextgen Grievance Redressal System.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">Data Collection</h4>
              <p>We collect only essential information required for authentication and case resolution:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-500">
                <li>Official Email ID (@asmedu.org)</li>
                <li>Full Name and Department/Class</li>
                <li>Grievance details and attached evidence</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2">AI Processing Disclosure</h4>
              <p>
                This application utilizes <strong>Google Gemini AI</strong> to analyze grievance text for sentiment analysis, summarization, and automatic categorization. 
                <br/><br/>
                <em>Note:</em> While text is processed by AI to improve efficiency, no personally identifiable information (PII) is used to train public AI models. Data transmission is encrypted.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2">Data Access & Confidentiality</h4>
              <p>
                Grievance details are accessible strictly on a need-to-know basis. Only the assigned Cell Faculty, Department Heads, and the Principal Administrator have access to full case files. Student data is never shared with third-party advertisers.
              </p>
            </div>
          </div>
        </div>
      </InfoModal>

      <InfoModal 
        isOpen={activeModal === 'support'} 
        onClose={closeModal} 
        title="Help & Technical Support"
      >
        <div className="space-y-6">
          <p>
            Encountering technical issues with the portal? The ASM IT Cell is available to assist you.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-2xl">
              <h4 className="font-bold text-slate-900 mb-1">Technical Support</h4>
              <p className="text-xs text-slate-500 mb-3">For login issues, bugs, or upload failures.</p>
              <a href="mailto:it.support@asmedu.org" className="text-[#1a73b8] font-bold text-sm hover:underline">it.support@asmedu.org</a>
            </div>
            <div className="p-4 border border-slate-200 rounded-2xl">
              <h4 className="font-bold text-slate-900 mb-1">Administrative Office</h4>
              <p className="text-xs text-slate-500 mb-3">For account verification or ID issues.</p>
              <p className="text-slate-900 font-bold text-sm">Student Section</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3">Frequently Asked Questions</h4>
            <div className="space-y-3">
              <details className="group bg-slate-50 rounded-xl">
                <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-slate-700">
                  <span>I forgot my password. How do I reset it?</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="text-slate-500 p-4 pt-0">
                  For security reasons, password resets must be requested in person at the IT Cell (Lab 2) or via your official email to the support address.
                </div>
              </details>
              <details className="group bg-slate-50 rounded-xl">
                <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-slate-700">
                  <span>Can I submit a grievance anonymously?</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="text-slate-500 p-4 pt-0">
                  No. To ensure accountability and prevent misuse, all grievances must be linked to a verified student or faculty ID. However, your identity is kept confidential during the resolution process.
                </div>
              </details>
            </div>
          </div>
        </div>
      </InfoModal>
    </div>
  );
};

export default LandingPage;
