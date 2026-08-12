import React from 'react';
import { Home, ShoppingBag, User } from 'lucide-react';

export type NavTab = 'home' | 'assets' | 'ai' | 'services' | 'marketplace' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingServicesCount?: number;
  isDemo?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  isDemo = false,
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 text-slate-600 py-2 shadow-lg">
      <div className="max-w-md mx-auto px-6 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as NavTab)}
              className={`relative flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all ${isActive
                ? 'text-purple-700 font-bold'
                : 'hover:text-slate-900 text-slate-500'
                }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-purple-600' : ''}`} />
              <span
                className={`text-[11px] mt-1 tracking-tight transition-colors ${isActive ? 'text-purple-700 font-bold' : 'text-slate-500'
                  }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
