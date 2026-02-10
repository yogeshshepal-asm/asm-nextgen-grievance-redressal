import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipPortalProps {
  children: React.ReactNode;
  content: React.ReactNode;
  sentiment?: { dotColor: string; shadow: string; bg: string; text: string; border: string };
}

const TooltipPortal: React.FC<TooltipPortalProps> = ({ children, content, sentiment }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Position tooltip to the right and below trigger
      const tooltipTop = rect.bottom + 12; // 12px below trigger
      const tooltipLeft = rect.right - 280; // 280px width, align to right

      setPosition({
        top: Math.max(12, tooltipTop), // Ensure min 12px from top
        left: Math.max(12, Math.min(tooltipLeft, window.innerWidth - 292)) // 292 = 280 + 12px padding
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  if (content && typeof content === 'object' && 'sentiment' in content) {
    const contentWithSentiment = content as any;
    sentiment = contentWithSentiment.sentiment;
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            className="fixed z-[999999] w-80 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-white/10 ring-1 ring-black/5 backdrop-blur-sm pointer-events-none"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.1) inset'
            }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
          >
            {/* Arrow pointer */}
            <div
              className="absolute -top-1 w-3 h-3 bg-slate-900 rotate-45"
              style={{
                left: `${triggerRef.current ? triggerRef.current.getBoundingClientRect().right - position.left - 12 : 20}px`,
                top: '-6px',
                boxShadow: '-1px -1px 2px rgba(0,0,0,0.3)'
              }}
            />

            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
              <svg className="h-4 w-4 text-indigo-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-indigo-300">Intelligent Brief</span>
            </div>

            {/* Content */}
            <p className="text-[11px] leading-relaxed font-medium text-slate-100 mb-3">
              {typeof content === 'string' ? content : content}
            </p>

            {/* Sentiment badge */}
            {sentiment && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <div
                  className={`w-2 h-2 rounded-full ${sentiment.dotColor} shadow-[0_0_8px] ${sentiment.shadow}`}
                />
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${sentiment.bg} ${sentiment.text} ${sentiment.border}`}>
                  {sentiment.sentiment || 'Neutral'}
                </span>
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
};

export default TooltipPortal;
