import React from 'react';

interface ApploraLogoProps {
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const ApploraLogoIcon: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-xs p-0.5',
    md: 'w-11 h-11 rounded-xl text-sm p-1',
    lg: 'w-16 h-16 rounded-2xl text-base p-1.5',
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} bg-purple-50/60 border border-purple-200 text-purple-700 shadow-xs flex items-center justify-center shrink-0 overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Subtle background glow */}
        <circle cx="50" cy="50" r="46" fill="#F3E8FF" fillOpacity="0.3" />

        {/* SLEEK, LARGE LIGHT-OUTLINED FLAT-TOP 'A' THAT ENCLOSES ALL APPLIANCES */}
        <g stroke="#7E22CE" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Main Flat-Top A Outline */}
          <path d="M34 10 H66 L90 90 M34 10 L10 90" />
          {/* Crossbar */}
          <path d="M21 54 H79" strokeWidth="2.2" />
        </g>

        {/* APPLIANCES INSIDE THE 'A' */}
        {/* 1. TV (Top Left Inside A) */}
        <g stroke="#6B21A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <rect x="28" y="18" width="19" height="12" rx="1.5" fill="white" />
          <path d="M34 30 L41 30 M37.5 30 L37.5 32" />
        </g>

        {/* 2. AC Unit (Top Right Inside A) */}
        <g stroke="#6B21A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <rect x="52" y="18" width="20" height="11" rx="2" fill="white" />
          <line x1="55" y1="25" x2="69" y2="25" strokeWidth="1" />
          <circle cx="68" cy="21.5" r="0.8" fill="#6B21A8" />
        </g>

        {/* 3. Refrigerator (Left Side Inside A) */}
        <g stroke="#6B21A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <rect x="23" y="38" width="20" height="47" rx="2.5" fill="white" />
          <line x1="23" y1="56" x2="43" y2="56" />
          <line x1="40" y1="44" x2="40" y2="51" strokeWidth="1.8" />
          <line x1="40" y1="62" x2="40" y2="78" strokeWidth="1.8" />
        </g>

        {/* 4. Washing Machine (Right Top Inside A) */}
        <g stroke="#6B21A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <rect x="54" y="38" width="22" height="22" rx="2.5" fill="white" />
          <circle cx="65" cy="50" r="6" strokeWidth="1.3" />
          <circle cx="58" cy="42" r="0.8" fill="#6B21A8" />
          <circle cx="61" cy="42" r="0.8" fill="#6B21A8" />
        </g>

        {/* 5. Water Purifier (Right Bottom Inside A) */}
        <g stroke="#6B21A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <rect x="54" y="63" width="22" height="22" rx="2.5" fill="white" />
          <rect x="57" y="66" width="16" height="9" rx="1.5" strokeWidth="1" />
          <path d="M65 77 v4 M62.5 81 h5" strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
};

export const ApploraBrandName: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <span className={`font-extrabold tracking-tight text-slate-900 brand-font ${textSizes[size]}`}>
      App<span className="text-purple-600">Lora</span>
    </span>
  );
};

export const ApploraLogo: React.FC<ApploraLogoProps> = ({
  iconOnly = false,
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  if (iconOnly) {
    return <ApploraLogoIcon size={size} className={className} />;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <ApploraLogoIcon size={size} />
      <div>
        <div className="flex items-center gap-2">
          <ApploraBrandName size={size} />
        </div>
        {showTagline && (
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            Home Appliance Lifecycle Hub
          </p>
        )}
      </div>
    </div>
  );
};
