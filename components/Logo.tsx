
import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// 🔧 LOGO CONFIGURATION
// ---------------------------------------------------------------------------
const RAW_URL = "https://drive.google.com/file/d/1_ayU0wyTDaVArJQ9OFpTmjAjWlS8L_yD/view?usp=drive_link";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const [hasError, setHasError] = useState(false);

  // Helper to make image links reliable
  const getProceessedUrl = (url: string) => {
    // 1. Handle Google Drive Links
    // Use the thumbnail endpoint (sz=w1000) which is more reliable for embedding than the export link
    if (url.includes('drive.google.com')) {
      const idMatch = url.match(/\/d\/(.*?)\//);
      if (idMatch && idMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
      }
    }
    
    // 2. Handle External Website Links (Bypass hotlink protection using weserv.nl proxy)
    if (url.startsWith('http') && !url.includes('drive.google.com')) {
      const cleanUrl = url.replace(/^https?:\/\//, '');
      return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=400&output=png`;
    }

    return url;
  };

  const finalLogoUrl = getProceessedUrl(RAW_URL);

  const sizeConfig = {
    sm: 'h-10',
    md: 'h-16',
    lg: 'h-24',
    xl: 'h-32'
  };

  const imgHeight = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className} select-none`}>
      {!hasError ? (
        <img 
          src={finalLogoUrl} 
          alt="ASM Nextgen Logo" 
          className={`${imgHeight} w-auto object-contain drop-shadow-sm`}
          onError={(e) => {
            // Retry logic: If thumbnail fails, try the export link as fallback
            const target = e.target as HTMLImageElement;
            // Prevent infinite loop by checking if we already tried fallback
            if (target.src.includes('thumbnail')) {
               const idMatch = RAW_URL.match(/\/d\/(.*?)\//);
               if (idMatch && idMatch[1]) {
                 target.src = `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
               }
            } else {
               setHasError(true);
            }
          }}
          referrerPolicy="no-referrer"
        />
      ) : (
        // Fallback if URL fails completely
        <div className={`flex items-center justify-center bg-white border-2 border-[#1a73b8] rounded-full text-[#1a73b8] font-black tracking-tighter shadow-sm ${
            size === 'sm' ? 'w-10 h-10 text-[10px]' : 
            size === 'md' ? 'w-16 h-16 text-sm' : 
            size === 'lg' ? 'w-24 h-24 text-xl' : 'w-32 h-32 text-2xl'
          }`}
        >
          ASM
        </div>
      )}
    </div>
  );
};

export default Logo;
