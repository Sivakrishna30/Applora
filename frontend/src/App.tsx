/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { AssetsView } from './components/AssetsView';
import { AIChatView } from './components/AIChatView';
import { ServicesView } from './components/ServicesView';
import { MarketplaceView } from './components/MarketplaceView';
import { ProfileView } from './components/ProfileView';
import { LandingPage } from './components/LandingPage';
import { ApplianceDetailModal } from './components/ApplianceDetailModal';
import { ManualAddModal } from './components/ManualAddModal';
import { OwnershipTransferModal } from './components/OwnershipTransferModal';
import { HomeHealthModal } from './components/HomeHealthModal';
import { AdminPanel } from './components/AdminPanel';

import { ArrowLeft } from 'lucide-react';
import { ApploraBrandName } from './components/ApploraLogo';

import {
  INITIAL_HOMES,
  INITIAL_APPLIANCES,
  INITIAL_COMPLAINTS,
  INITIAL_MARKETPLACE_LISTINGS,
} from './data/initialData';

import {
  Appliance,
  Complaint,
  HomeProperty,
  MarketplaceListing,
  OCRScanResult,
  ServiceRecord,
  ApplianceDocument,
  UserProfile,
} from './types';

import {
  saveUserToFirestore,
  saveHomesToFirestore,
  saveApplianceToFirestore,
  saveAllAppliancesToFirestore,
  saveComplaintToFirestore,
  saveMarketplaceListingToFirestore,
  subscribeToAppliances,
  subscribeToComplaints,
  subscribeToMarketplace,
  subscribeToHomes,
  getUserProfileFromFirestore,
} from './firebase';

import { createAppliance, createDocumentsBulk } from './services/api';

function deduplicateHomesList(homeList: HomeProperty[]): HomeProperty[] {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const result: HomeProperty[] = [];

  const hasSubstantialHome = homeList.some(
    (h) => h.address !== '101 Primary Way' && h.address !== 'Primary Residence'
  );

  for (const h of homeList) {
    if (!h || !h.id) continue;
    const nameLower = (h.name || '').trim().toLowerCase();
    const addrLower = (h.address || '').trim().toLowerCase();

    // Skip empty auto-created mock placeholders if substantial properties exist
    const isMockPlaceholder = addrLower === '101 primary way' || addrLower === 'primary residence';
    if (isMockPlaceholder && hasSubstantialHome) {
      continue;
    }

    const key = `${nameLower}_${addrLower}`;
    if (!seenIds.has(h.id) && !seenKeys.has(key)) {
      seenIds.add(h.id);
      seenKeys.add(key);
      result.push(h);
    }
  }
  return result.length > 0 ? result : INITIAL_HOMES;
}

export default function App() {
  // Authentication & First Visit State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Load state from Firestore listeners (setup below)
  const [homes, setHomes] = useState<HomeProperty[]>([]);
  const [currentHome, setCurrentHome] = useState<HomeProperty | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>([]);

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isPublicAftermarket, setIsPublicAftermarket] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedAppliance, setSelectedAppliance] = useState<Appliance | null>(null);
  const [showManualAddModal, setShowManualAddModal] = useState<boolean>(false);
  const [transferAppliance, setTransferAppliance] = useState<Appliance | null>(null);
  const [showHealthModal, setShowHealthModal] = useState<boolean>(false);

  // Listen to Firebase Auth State
  useEffect(() => {
    let unsubscribe: () => void;

    const initAuth = async () => {
      const { auth, saveUserToFirestore } = await import('./firebase');
      const { onAuthStateChanged, getRedirectResult } = await import('firebase/auth');

      try {
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult && redirectResult.user) {
          const user = redirectResult.user;

          if (!user.displayName || !user.email) {
            throw new Error('User profile incomplete: displayName and email are required');
          }

          await saveUserToFirestore({
            id: user.uid,
            name: user.displayName,
            email: user.email,
            isLoggedIn: true,
            memberSince: new Date().getFullYear().toString(),
          });
        }
      } catch (err) {
        console.error('Error handling redirect result:', err);
      }

      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setIsLoggedIn(true);
          const { getUserProfileFromFirestore, saveUserToFirestore } = await import('./firebase');
          let profile = await getUserProfileFromFirestore(user.uid);

          if (!profile) {
            if (!user.displayName || !user.email) {
              throw new Error('User profile incomplete: displayName and email are required');
            }

            profile = {
              id: user.uid,
              name: user.displayName,
              email: user.email,
              isLoggedIn: true,
              memberSince: new Date().getFullYear().toString(),
            };
            await saveUserToFirestore(profile);
          }

          setUserProfile(profile);
        } else {
          setIsLoggedIn(false);
          setUserProfile(null);
        }
      });
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Firestore real-time listeners setup
  useEffect(() => {
    const userId = userProfile?.id;

    const unsubAppliances = subscribeToAppliances((remote) => {
      setAppliances(remote || []);
    }, userId);

    const unsubComplaints = subscribeToComplaints((remote) => {
      setComplaints(remote || []);
    }, userId);

    const unsubMarketplace = subscribeToMarketplace((remote) => {
      if (remote && remote.length > 0) {
        setMarketplaceListings(remote);
      } else if (remote && remote.length === 0) {
        INITIAL_MARKETPLACE_LISTINGS.forEach((item) => {
          saveMarketplaceListingToFirestore(item);
        });
        setMarketplaceListings(INITIAL_MARKETPLACE_LISTINGS);
      }
    });

    const unsubHomes = subscribeToHomes((remote) => {
      if (remote && remote.length > 0) {
        const unique = deduplicateHomesList(remote);
        setHomes(unique);
      } else if (remote && remote.length === 0 && userId) {
        setHomes([]);
        setCurrentHome(null);
      }
    }, userId);

    return () => {
      unsubAppliances();
      unsubComplaints();
      unsubMarketplace();
      unsubHomes();
    };
  }, [userProfile?.id, userProfile?.name]);

  useEffect(() => {
    if (homes.length > 0) {
      const exists = homes.find((h) => h.id === currentHome?.id);
      if (!exists) {
        setCurrentHome(homes[0]);
      }
    }
  }, [homes, currentHome?.id]);

  // Auth Handlers
  const handleLogin = (name: string, email: string, startClean: boolean, uid?: string) => {
    const userId = uid;
    if (!userId) {
      console.error('Cannot login: no user ID provided');
      return;
    }

    const profile: UserProfile = {
      id: userId,
      name,
      email,
      isLoggedIn: true,
      memberSince: new Date().getFullYear().toString(),
    };

    setUserProfile(profile);
    setIsLoggedIn(true);
    saveUserToFirestore(profile);

    if (startClean) {
      setAppliances([]);
      setComplaints([]);
      setHomes([]);
      setCurrentHome(null);
    } else {
      setHomes([]);
      setCurrentHome(null);
      setAppliances([]);
    }
  };

  const handleDeleteHome = (homeId: string) => {
    const updated = homes.filter((h) => h.id !== homeId);
    if (updated.length === 0) return;
    setHomes(updated);
    if (currentHome?.id === homeId) {
      setCurrentHome(updated[0]);
    }
    saveHomesToFirestore(updated, userProfile?.id);
  };

  const handleExploreDemo = () => {
    const guestProfile: UserProfile = {
      id: 'usr-guest',
      name: 'Guest Explorer',
      email: 'guest@applora.ai',
      isLoggedIn: true,
      memberSince: '2026',
    };
    setUserProfile(guestProfile);
    setIsLoggedIn(true);
    setIsPublicAftermarket(false);
    setHomes(INITIAL_HOMES);
    setCurrentHome(INITIAL_HOMES[0]);
    setAppliances(INITIAL_APPLIANCES);
    setComplaints(INITIAL_COMPLAINTS);
    setMarketplaceListings(INITIAL_MARKETPLACE_LISTINGS);
    setActiveTab('home');
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setIsPublicAftermarket(false);
    setUserProfile(null);
    localStorage.removeItem('applora_is_logged_in');
    localStorage.removeItem('applora_user_profile');
  };

  const handleClearData = () => {
    setAppliances([]);
    setComplaints([]);
    setMarketplaceListings([]);
  };

  const handleGoogleSignIn = async () => {
    const profile: UserProfile = {
      id: 'usr-owner-' + Math.random().toString(36).substring(2, 7),
      name: 'Home Owner',
      email: 'owner@applora.com',
      isLoggedIn: true,
      memberSince: new Date().getFullYear().toString(),
    };

    await saveUserToFirestore(profile);
    setUserProfile(profile);
    setIsLoggedIn(true);
    setIsPublicAftermarket(false);
    setActiveTab('home');
  };

  const handleLoadSampleData = () => {
    setHomes(INITIAL_HOMES);
    setCurrentHome(INITIAL_HOMES[0]);
    setAppliances(INITIAL_APPLIANCES);
    setComplaints(INITIAL_COMPLAINTS);
    setMarketplaceListings(INITIAL_MARKETPLACE_LISTINGS);
    if (userProfile?.id) {
      saveHomesToFirestore(INITIAL_HOMES, userProfile.id);
      saveAllAppliancesToFirestore(INITIAL_APPLIANCES, userProfile.id);
    }
  };

  // Render Public Standalone Aftermarket view if user selected Explore Aftermarket from Landing
  if (!isLoggedIn && isPublicAftermarket) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPublicAftermarket(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer border border-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
              <ApploraBrandName size="md" />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGoogleSignIn}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
                </svg>
                <span>Sign In</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          <MarketplaceView
            listings={marketplaceListings}
            appliances={[]}
            homes={[]}
            onAddListing={() => { }}
            isPublicMode={true}
            onRequireAuth={handleGoogleSignIn}
          />
        </main>
      </div>
    );
  }

  // Render Landing Page if not logged in
  if (!isLoggedIn) {
    return (
      <LandingPage
        onLogin={handleLogin}
        onExploreDemo={handleExploreDemo}
        onExploreAftermarket={() => setIsPublicAftermarket(true)}
      />
    );
  }

  // Calculate Health Score
  const currentHomeAppliances = currentHome
    ? appliances.filter((a) => a.homeId === currentHome.id)
    : [];
  const totalApps = currentHomeAppliances.length || 1;
  const healthyApps = currentHomeAppliances.filter((a) => a.status === 'Healthy').length;
  const healthScore = Math.round((healthyApps / totalApps) * 100) || 85;

  // Handlers
  const handleApplianceScanned = async (scanned: OCRScanResult) => {
    if (!currentHome?.id) {
      console.error('Cannot save appliance: no current home selected');
      return;
    }

    // Call backend API with AI data for scoring
    const response = await createAppliance({
      homeId: currentHome.id,
      name: `${scanned.brand} ${scanned.modelNumber}`,
      brand: scanned.brand,
      modelNumber: scanned.modelNumber,
      serialNumber: scanned.serialNumber,
      category: scanned.category,
      room: currentHome.rooms?.[0] || '',
      purchaseDate: scanned.purchaseDate,
      purchasePrice: scanned.purchasePrice,
      dealerName: scanned.dealerName,
      installationDate: scanned.purchaseDate,
      status: 'Healthy',
      warranty: {
        startDate: scanned.purchaseDate,
        durationMonths: scanned.warrantyDurationMonths,
        coverageType: 'Full Warranty',
        summaryTerms: scanned.summaryTerms,
      },
      aiExtractedData: scanned
    } as any);

    if (response.success && response.data) {
      const savedApp = response.data as Appliance;
      setAppliances((prev) => [savedApp, ...prev]);
      setSelectedAppliance(savedApp);
      saveApplianceToFirestore(savedApp, userProfile?.id);
    }
  };

  const handleAddManualAppliance = async (newApp: Appliance) => {
    const appWithHome = { ...newApp, homeId: currentHome?.id || newApp.homeId };

    const response = await createAppliance({
      ...appWithHome,
      warranty: appWithHome.warranty
    } as any);

    if (response.success && response.data) {
      const savedApp = response.data as Appliance;

      // If there were multiple documents, we'd add them here too
      if (newApp.documents && newApp.documents.length > 0) {
        await createDocumentsBulk({
          documents: newApp.documents.map(d => ({ ...d, applianceId: savedApp.id }))
        });
      }

      setAppliances((prev) => [savedApp, ...prev]);
      saveApplianceToFirestore(savedApp, userProfile?.id);
    }
  };



  const handleAddServiceLog = (
    applianceId: string,
    logData: Omit<ServiceRecord, 'id' | 'applianceId'>
  ) => {
    const newRecord: ServiceRecord = {
      id: `srv-${Date.now()}`,
      applianceId,
      ...logData,
    };

    setAppliances((prev) =>
      prev.map((a) => {
        if (a.id === applianceId) {
          const updated = {
            ...a,
            serviceHistory: [newRecord, ...a.serviceHistory],
          };
          saveApplianceToFirestore(updated);
          return updated;
        }
        return a;
      })
    );

    if (selectedAppliance && selectedAppliance.id === applianceId) {
      setSelectedAppliance({
        ...selectedAppliance,
        serviceHistory: [newRecord, ...selectedAppliance.serviceHistory],
      });
    }
  };

  const handleAddDocument = (
    applianceId: string,
    docData: Omit<ApplianceDocument, 'id'>
  ) => {
    const newDoc: ApplianceDocument = {
      id: `doc-${Date.now()}`,
      ...docData,
    };

    setAppliances((prev) =>
      prev.map((a) => {
        if (a.id === applianceId) {
          const updated = {
            ...a,
            documents: [newDoc, ...a.documents],
          };
          saveApplianceToFirestore(updated);
          return updated;
        }
        return a;
      })
    );

    if (selectedAppliance && selectedAppliance.id === applianceId) {
      setSelectedAppliance({
        ...selectedAppliance,
        documents: [newDoc, ...selectedAppliance.documents],
      });
    }
  };

  const handleRaiseComplaint = (app: Appliance) => {
    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      applianceId: app.id,
      applianceName: app.name,
      brand: app.brand,
      issueTitle: `Issue reported for ${app.brand} ${app.name}`,
      issueDescription: `User initiated diagnostic complaint for model ${app.modelNumber}.`,
      symptoms: ['Performance degradation', 'Intermittent fault'],
      aiDiagnosis: `Applora AI pre-check: Verify power supply, clear inlet/filters, check ${app.warranty.summaryTerms}.`,
      diySteps: ['Ensure power supply is stable.', 'Inspect outer unit for blockages.'],
      status: 'Open',
      createdDate: new Date().toISOString().split('T')[0],
      brandSupportEmail: `support.${app.brand.toLowerCase()}@care.com`,
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    saveComplaintToFirestore(newComplaint);
    setSelectedAppliance(null);
    setActiveTab('services');
  };

  const handleAddMarketplaceListing = (newListing: MarketplaceListing) => {
    setMarketplaceListings((prev) => [newListing, ...prev]);
    saveMarketplaceListingToFirestore(newListing);
  };

  const handleImportAppliance = (app: Appliance) => {
    setAppliances((prev) => [app, ...prev]);
    saveApplianceToFirestore(app, userProfile?.id);
  };

  const handleUpdateComplaintStatus = (id: string, status: any) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, status };
          saveComplaintToFirestore(updated);
          return updated;
        }
        return c;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-24 sm:pb-12 selection:bg-purple-500 selection:text-white">
      {/* App Header */}
      <Header
        userProfile={userProfile}
        onNavigateProfile={() => setActiveTab('profile')}
        onSignOut={handleSignOut}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'marketplace' ? (
          <MarketplaceView
            listings={marketplaceListings}
            appliances={currentHomeAppliances}
            homes={homes}
            currentHome={currentHome}
            onAddListing={handleAddMarketplaceListing}
            onImportAppliance={handleImportAppliance}
            onTransferOwnership={(app) => setTransferAppliance(app)}
          />
        ) : activeTab === 'profile' ? (
          <ProfileView
            userProfile={userProfile}
            currentHome={currentHome}
            homes={homes}
            appliances={appliances}
            onSelectHome={setCurrentHome}
            onAddHome={(newH) => {
              const homeWithUser: HomeProperty = { ...newH, userId: userProfile?.id };
              const updated = [...homes, homeWithUser];
              setHomes(updated);
              setCurrentHome(homeWithUser);
              if (userProfile?.id) {
                saveHomesToFirestore(updated, userProfile.id);
              }
            }}
            onDeleteHome={handleDeleteHome}
            onClearData={handleClearData}
            onLoadSampleData={handleLoadSampleData}
            onSignOut={handleSignOut}
          />
        ) : activeTab === 'admin' ? (
          <AdminPanel />
        ) : (
          <DashboardView
            currentHome={currentHome}
            homes={homes}
            onSelectHome={setCurrentHome}
            onAddHome={() => setActiveTab('profile')}
            appliances={appliances}
            complaints={complaints}
            healthScore={healthScore}
            onSelectAppliance={setSelectedAppliance}
            onOpenOCR={() => setShowManualAddModal(true)}
            onOpenManualAdd={() => setShowManualAddModal(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenHealthModal={() => setShowHealthModal(true)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        isDemo={userProfile?.id === 'usr-guest'}
        pendingServicesCount={
          currentHomeAppliances.filter(
            (a) => a.status === 'Service Due' || a.status === 'Needs Attention'
          ).length
        }
      />

      {/* MODALS */}
      {selectedAppliance && (
        <ApplianceDetailModal
          appliance={selectedAppliance}
          onClose={() => setSelectedAppliance(null)}
          onAddServiceLog={handleAddServiceLog}
          onAddDocument={handleAddDocument}
          onRaiseComplaint={handleRaiseComplaint}
          onTransferOwnership={(app) => setTransferAppliance(app)}
          onListMarketplace={() => {
            setSelectedAppliance(null);
            setActiveTab('marketplace');
          }}
        />
      )}


      {showManualAddModal && (
        <ManualAddModal
          currentHome={currentHome}
          onClose={() => setShowManualAddModal(false)}
          onAddAppliance={handleAddManualAppliance}
        />
      )}

      {transferAppliance && (
        <OwnershipTransferModal
          appliance={transferAppliance}
          onClose={() => setTransferAppliance(null)}
        />
      )}

      {showHealthModal && (
        <HomeHealthModal
          currentHome={currentHome}
          appliances={appliances}
          healthScore={healthScore}
          onClose={() => setShowHealthModal(false)}
          onNavigateTab={(tab) => {
            setShowHealthModal(false);
            setActiveTab(tab);
          }}
        />
      )}
    </div>
  );
}
