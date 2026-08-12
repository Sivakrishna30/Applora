import React, { useState } from 'react';
import {
  User,
  Building,
  Plus,
  Users,
  Download,
  ShieldCheck,
  Zap,
  Settings,
  Check,
  X,
  Trash2,
  RotateCcw,
  LogOut,
  Sparkles,
  HardDrive,
  Bell,
  Phone,
  Mail,
  Home,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save,
  Globe,
  CreditCard,
} from 'lucide-react';
import { HomeProperty, Appliance, UserProfile } from '../types';
import { deleteUserAccountAndData, saveUserToFirestore, saveHomesToFirestore } from '../firebase';

interface ProfileViewProps {
  userProfile?: UserProfile | null;
  currentHome: HomeProperty;
  homes: HomeProperty[];
  appliances: Appliance[];
  onSelectHome: (home: HomeProperty) => void;
  onAddHome: (newHome: HomeProperty) => void;
  onDeleteHome?: (homeId: string) => void;
  onClearData: () => void;
  onLoadSampleData: () => void;
  onSignOut: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  currentHome,
  homes,
  appliances,
  onSelectHome,
  onAddHome,
  onDeleteHome,
  onClearData,
  onLoadSampleData,
  onSignOut,
}) => {
  // Editing profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userName, setUserName] = useState(userProfile?.name || '');
  const [userPhone, setUserPhone] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('USD ($)');
  const [language, setLanguage] = useState('English (US)');

  // Notification switches
  const [notifyExpiry, setNotifyExpiry] = useState(true);
  const [notifyMaintenance, setNotifyMaintenance] = useState(true);
  const [notifyServiceUpdates, setNotifyServiceUpdates] = useState(true);

  // Add Home state
  const [showAddHomeModal, setShowAddHomeModal] = useState(false);
  const [newHomeName, setNewHomeName] = useState('');
  const [newHomeAddress, setNewHomeAddress] = useState('');
  const [newHomeType, setNewHomeType] = useState<any>('Apartment');
  const [newHomeRooms, setNewHomeRooms] = useState('Kitchen, Living Room, Master Bedroom');

  // Deletion modals
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  // Calculate Storage Quota (1 GB consumer tier as specified in SRS 1.1)
  const totalStorageLimitGB = 1.0;
  const docCount = appliances.reduce((acc, app) => acc + (app.documents ? app.documents.length : 0), 0);
  const estimatedUsedGB = parseFloat(((docCount * 0.02) + (appliances.length * 0.005)).toFixed(2));
  const storagePercentage = Math.min(100, Math.max(0, (estimatedUsedGB / totalStorageLimitGB) * 100));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userProfile) {
      const updated: UserProfile = {
        ...userProfile,
        name: userName,
      };
      await saveUserToFirestore(updated);
    }
    setIsEditingProfile(false);
  };

  const handleCreateHome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHomeName) return;
    const roomsList = newHomeRooms
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const created: HomeProperty = {
      id: `home-${Date.now()}`,
      name: newHomeName,
      address: newHomeAddress,
      type: newHomeType,
      rooms: roomsList,
      isPrimary: homes.length === 0,
    };
    onAddHome(created);
    setShowAddHomeModal(false);
    setNewHomeName('');
    setNewHomeAddress('');
    setNewHomeRooms('Kitchen, Living Room, Master Bedroom');
  };

  const handleSetPrimaryHome = async (homeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHomes = homes.map((h) => ({
      ...h,
      isPrimary: h.id === homeId,
    }));
    await saveHomesToFirestore(updatedHomes);
  };

  const handleExportData = () => {
    const backupData = {
      userProfile,
      properties: homes,
      appliances,
      exportedAt: new Date().toISOString(),
      apploraVersion: '1.0.0-MVP',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    if (!userProfile?.name) {
      console.error('Cannot export data: user profile name is missing');
      return;
    }
    downloadAnchor.setAttribute('download', `applora_account_export_${userProfile.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExecuteCascadingDelete = async () => {
    if (userProfile?.id) {
      await deleteUserAccountAndData(userProfile.id);
    }
    onClearData();
    onSignOut();
  };

  const uniqueHomes = homes.reduce((acc: HomeProperty[], home) => {
    if (!home || !home.id) return acc;
    const nameLower = (home.name || '').trim().toLowerCase();
    const addrLower = (home.address || '').trim().toLowerCase();
    const key = `${nameLower}_${addrLower}`;

    // Check if this is an auto-generated placeholder residence with no appliances
    const isPlaceholder =
      addrLower === '101 primary way' ||
      addrLower === 'primary residence' ||
      nameLower.includes('residence');

    const homeAppCount = appliances.filter((a) => a.homeId === home.id).length;

    // If there are other non-placeholder homes or populated homes in acc, skip empty duplicate placeholders
    const hasBetterHome = acc.some(
      (h) =>
        h.address !== '101 Primary Way' &&
        h.address !== 'Primary Residence'
    );

    if (isPlaceholder && homeAppCount === 0 && hasBetterHome) {
      return acc;
    }

    const exists = acc.some(
      (item) =>
        item.id === home.id ||
        `${item.name?.trim().toLowerCase()}_${item.address?.trim().toLowerCase()}` === key
    );
    if (!exists) {
      acc.push(home);
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6 pb-24 text-slate-900 max-w-4xl mx-auto">
      {/* Account Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-sm">
              {userProfile?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 brand-font">
                  {userProfile?.name}
                </h2>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>Consumer Tier</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{userProfile?.email}</span>
              </p>
              <p className="text-[11px] text-purple-700 font-semibold mt-1">
                Member since {userProfile?.memberSince} • Managing {uniqueHomes.length} Home Profiles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Editable Profile Form */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs bg-slate-50/70 p-4 rounded-xl">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Phone Number</label>
              <input
                type="text"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Preferred Currency</label>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:border-purple-500 outline-none"
              >
                <option value="USD ($)">USD ($) US Dollar</option>
                <option value="EUR (€)">EUR (€) Euro</option>
                <option value="GBP (£)">GBP (£) British Pound</option>
                <option value="INR (₹)">INR (₹) Indian Rupee</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">System Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:border-purple-500 outline-none"
              >
                <option value="English (US)">English (US)</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-xs transition-all text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Cloud Storage Allocation Quota */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider brand-font">
              Cloud Storage Allocation
            </h3>
          </div>
          <span className="text-xs font-extrabold text-purple-800">
            {estimatedUsedGB.toFixed(2)} GB / {totalStorageLimitGB.toFixed(2)} GB (1 GB Quota)
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-500 ${storagePercentage > 85 ? 'bg-amber-500' : 'bg-purple-600'
              }`}
            style={{ width: `${storagePercentage.toFixed(1)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Encrypted Invoices, Manual PDFs, and Asset Photos</span>
          <span className="font-semibold text-purple-700">Expand storage on request (Phase 2)</span>
        </div>
      </div>

      {/* Home Profile Management */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider brand-font">
                Home Profiles
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Organize appliances by physical residences (e.g., Primary House, Rented Flat, Hometown Home)
            </p>
          </div>

          <button
            onClick={() => setShowAddHomeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Home Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {uniqueHomes.map((home) => {
            const homeApplianceCount = appliances.filter((a) => a.homeId === home.id).length;
            const isSelected = home.id === currentHome?.id;

            return (
              <div
                key={home.id}
                onClick={() => onSelectHome(home)}
                className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs space-y-2.5 ${isSelected
                    ? 'bg-purple-50/80 border-purple-400 text-purple-900 ring-1 ring-purple-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-xs text-slate-900">{home.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {home.isPrimary ? (
                      <span className="text-[10px] bg-purple-600 text-white font-extrabold px-2 py-0.5 rounded-md">
                        Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleSetPrimaryHome(home.id, e)}
                        className="text-[10px] bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-800 font-bold px-2 py-0.5 rounded-md transition-colors"
                      >
                        Set Default
                      </button>
                    )}

                    {onDeleteHome && uniqueHomes.length > 1 && (
                      <button
                        type="button"
                        title="Delete Home Profile"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove ${home.name} profile?`)) {
                            onDeleteHome(home.id);
                          }
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500">{home.address}</p>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 text-slate-600 font-medium">
                  <span>{homeApplianceCount} Registered Appliances</span>
                  <span>Rooms: {home.rooms ? home.rooms.join(', ') : 'Kitchen, Living Room'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-xs">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider brand-font">
            Lifecycle & Expiry Alerts
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900">Warranty Expiration Warnings</p>
              <p className="text-[11px] text-slate-500">Receive alerts 30 days and 7 days before warranty expires</p>
            </div>
            <input
              type="checkbox"
              checked={notifyExpiry}
              onChange={(e) => setNotifyExpiry(e.target.checked)}
              className="w-4 h-4 accent-purple-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900">Preventative Maintenance Reminders</p>
              <p className="text-[11px] text-slate-500">Filter cleaning, water softener refills, and coil servicing</p>
            </div>
            <input
              type="checkbox"
              checked={notifyMaintenance}
              onChange={(e) => setNotifyMaintenance(e.target.checked)}
              className="w-4 h-4 accent-purple-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900">Service Request Status Updates</p>
              <p className="text-[11px] text-slate-500">Live notifications when brand technicians update issue reports</p>
            </div>
            <input
              type="checkbox"
              checked={notifyServiceUpdates}
              onChange={(e) => setNotifyServiceUpdates(e.target.checked)}
              className="w-4 h-4 accent-purple-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Backup & Cascading Delete Controls (FR-001 Business Rule) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider brand-font">
            Data Backup & Account Governance
          </h3>
        </div>

        {userProfile?.id === 'usr-guest' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-2">
            <button
              onClick={handleExportData}
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-purple-600" />
              <span>Export Account Inventory (JSON)</span>
            </button>

            <button
              onClick={onLoadSampleData}
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-bold text-xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-purple-600" />
              <span>Reset Demo Sample Assets</span>
            </button>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Cascading Account Deletion</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Permanently purge user profile, Home Profiles, registered appliances, invoices, and service records.
            </p>
          </div>

          <button
            onClick={() => setShowDeleteAccountModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs transition-all shrink-0"
          >
            Delete Account & Purge Data
          </button>
        </div>
      </div>

      {/* ADD HOME MODAL (FR-002) */}
      {showAddHomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-5 space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 brand-font">Add Home Profile (FR-002)</h3>
              <button onClick={() => setShowAddHomeModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <form onSubmit={handleCreateHome} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Home Profile Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary Residence / Rented Apartment"
                  value={newHomeName}
                  onChange={(e) => setNewHomeName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-purple-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 742 Evergreen Terrace, Springfield"
                  value={newHomeAddress}
                  onChange={(e) => setNewHomeAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-purple-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Residence Type
                </label>
                <select
                  value={newHomeType}
                  onChange={(e) => setNewHomeType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-medium focus:border-purple-500 outline-none"
                >
                  <option value="Apartment">Apartment / Flat</option>
                  <option value="Villa">Individual House / Villa</option>
                  <option value="Rental">Rental Residence</option>
                  <option value="Commercial">Commercial / Office</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                  Room Allocations (Comma Separated)
                </label>
                <input
                  type="text"
                  value={newHomeRooms}
                  onChange={(e) => setNewHomeRooms(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-purple-500 outline-none font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Appliances can be mapped to these specific rooms.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-all"
                >
                  Create Home Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CASCADING DELETE CONFIRMATION MODAL */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-rose-200 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4 text-slate-900">
            <div className="flex items-center gap-3 text-rose-600 border-b border-rose-100 pb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 brand-font">Execute Cascading Delete?</h3>
                <p className="text-[11px] text-slate-500">Business Rule FR-001 Enforcement</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action will permanently delete your account profile, all mapped Home Profiles, registered appliances, uploaded invoices, and historical records. <strong className="text-rose-700">This cannot be undone.</strong>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteCascadingDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-xs transition-all"
              >
                Permanently Purge Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


