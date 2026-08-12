import React from 'react';
import { ApploraLogoIcon, ApploraBrandName } from './ApploraLogo';
import { UserProfile } from '../types';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  userProfile: UserProfile | null;
  onNavigateProfile: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  onNavigateProfile,
  onSignOut,
}) => {
  const userName = userProfile?.name;
  const userAvatar = userProfile?.avatarUrl;

  if (!userName) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <ApploraBrandName size="md" />
          </div>

          {/* User Account & Sign Out */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNavigateProfile}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-800 transition-all cursor-pointer shrink-0"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-7 h-7 rounded-full object-cover border border-purple-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-extrabold text-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-bold text-slate-900 truncate max-w-[110px] sm:max-w-[180px]">
                {userName}
              </span>
            </button>

            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-all cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
