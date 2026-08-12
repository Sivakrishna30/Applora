import React, { useState } from 'react';
import { ApploraBrandName } from './ApploraLogo';
import {
  ShieldCheck,
  Zap,
  Share2,
  ArrowRight,
  Sparkles,
  Wrench,
  FileText,
  AlertCircle,
  Loader2,
  Cpu,
  Building2,
} from 'lucide-react';
import { saveUserToFirestore } from '../firebase';

interface LandingPageProps {
  onLogin: (name: string, email: string, startClean: boolean, uid?: string) => void;
  onExploreDemo: () => void;
  onExploreAftermarket: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  onExploreDemo,
  onExploreAftermarket,
}) => {
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { auth, saveUserToFirestore } = await import('../firebase');
      const { signInWithPopup, signInWithRedirect, GoogleAuthProvider } = await import('firebase/auth');

      const provider = new GoogleAuthProvider();

      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const uid = user.uid;
        const displayName = user.displayName || 'Home Owner';
        const userEmail = user.email || 'user@example.com';

        await saveUserToFirestore({
          id: uid,
          name: displayName,
          email: userEmail,
          isLoggedIn: true,
          memberSince: new Date().getFullYear().toString(),
        });

        onLogin(displayName, userEmail, true, uid);
        setShowAuthModal(false);
      } catch (popupErr: any) {
        console.warn('Popup sign-in blocked or closed, trying redirect flow:', popupErr);
        await signInWithRedirect(auth, provider);
      }
    } catch (e: any) {
      console.error('Sign In error:', e);
      setAuthError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* 1. Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ApploraBrandName size="md" />
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-widest hidden sm:block">
                Everything About Your Home
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setAuthError(null);
                setShowAuthModal(true);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
              </svg>
              <span>Sign In</span>
            </button>

            <button
              onClick={() => onExploreDemo()}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full text-center">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight brand-font max-w-4xl mx-auto leading-tight sm:leading-tight">
          Never Lose a Bill, Warranty, or Service Log Again.
        </h1>

        <p className="mt-5 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Keep every appliance bill, warranty, document and service record in one secure place, ready whenever you need it.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            onClick={() => {
              setAuthError(null);
              setShowAuthModal(true);
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
            </svg>
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreAftermarket}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-purple-600" />
            <span>Explore Aftermarket</span>
          </button>
        </div>
      </section>

      {/* 3 & 4. Core Capabilities Section */}
      <section className="py-16 bg-white border-y border-slate-200 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest">
              Core Features
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 brand-font">
              Everything You Need to Manage Your Home
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Organize appliances, track warranties, log service history, connect smart devices, and manage home assets effortlessly.
            </p>
          </div>

          {/* 6 Consumer & Smart Home Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Appliance Details */}
            <div className="bg-slate-50 border border-slate-200 hover:border-purple-500 rounded-2xl p-6 transition-all space-y-3 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 w-fit text-purple-700">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 brand-font">
                  Appliance Details
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Keep product information, serial numbers, purchase details, warranties and documents together in one place.
                </p>
              </div>
            </div>

            {/* Feature 2: Warranty & Coverage */}
            <div className="bg-slate-50 border border-slate-200 hover:border-purple-500 rounded-2xl p-6 transition-all space-y-3 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 w-fit text-purple-700">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 brand-font">
                  Warranty & Coverage
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Know when your warranty expires and what is covered before raising a service request.
                </p>
              </div>
            </div>

            {/* Feature 3: Service History */}
            <div className="bg-slate-50 border border-slate-200 hover:border-purple-500 rounded-2xl p-6 transition-all space-y-3 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 w-fit text-purple-700">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 brand-font">
                  Service History
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Keep every repair, maintenance visit and service bill attached to the appliance.
                </p>
              </div>
            </div>

            {/* Feature 4: Brand Support */}
            <div className="bg-slate-50 border border-slate-200 hover:border-purple-500 rounded-2xl p-6 transition-all space-y-3 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 w-fit text-purple-700">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 brand-font">
                  Brand Support
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Get the right support channel with your appliance details ready.
                </p>
              </div>
            </div>

            {/* Feature 5: Trusted Resale / Transfer */}
            <div className="bg-slate-50 border border-slate-200 hover:border-purple-500 rounded-2xl p-6 transition-all space-y-3 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 w-fit text-purple-700">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 brand-font">
                  Trusted Resale / Transfer
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sell or transfer an appliance along with its invoice, warranty information, service history, product details, and ownership information.
                </p>
              </div>
            </div>

            {/* Feature 6: Smart Home & IoT */}
            <div className="bg-slate-50 border border-slate-200 hover:border-purple-500 rounded-2xl p-6 transition-all space-y-3 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 w-fit text-purple-700">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 brand-font">
                  Smart Home IoT
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Connect, monitor, and control your smart home appliances from a unified interface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Enterprise / B2B Section (Light Theme) */}
      <section className="py-16 bg-slate-50 border-t border-slate-200 text-slate-900 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest px-3 py-1 rounded-full bg-purple-100 border border-purple-200 w-fit inline-block">
                Enterprise
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 brand-font tracking-tight">
                Bulk Device & Multi-Property Management
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Streamline operations across commercial properties, offices, and large facilities with specialized enterprise workflows.
              </p>
            </div>

            <button
              onClick={() => alert('AppLora Enterprise B2B Inquiry: Contact sales@applora.com')}
              className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Get a Quote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Enterprise Feature 1: Bulk Docs Handling */}
            <div className="bg-white border border-slate-200 hover:border-purple-500 rounded-2xl p-6 space-y-3 shadow-xs transition-all">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 w-fit text-purple-700">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 brand-font">
                Bulk Docs Handling
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralized vault to upload, index, and organize invoices, warranty cards, and compliance documents for hundreds of assets simultaneously.
              </p>
            </div>

            {/* Enterprise Feature 2: Device Functionality Management */}
            <div className="bg-white border border-slate-200 hover:border-purple-500 rounded-2xl p-6 space-y-3 shadow-xs transition-all">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 w-fit text-purple-700">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 brand-font">
                Device Functionality Management
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track operational status, assign location codes, monitor maintenance lifecycles, and optimize multi-site hardware usage.
              </p>
            </div>

            {/* Enterprise Feature 3: AMC Tracking */}
            <div className="bg-white border border-slate-200 hover:border-purple-500 rounded-2xl p-6 space-y-3 shadow-xs transition-all">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 w-fit text-purple-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 brand-font">
                AMC Tracking
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated alerts for Annual Maintenance Contract renewals, vendor SLAs, service visits, and commercial warranty claims.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer & Brand Statement */}
      <footer className="mt-auto border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ApploraBrandName size="sm" />
            <span className="text-[11px] font-medium text-slate-600">Everything About Your Home</span>
          </div>
          <div>© {new Date().getFullYear()} AppLora Asset Technologies. All rights reserved.</div>
        </div>
      </footer>

      {/* 2. Real Sign In Modal (Google Authentication) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-xl p-6 space-y-5 text-slate-900 text-center">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-900 brand-font flex items-center gap-1">
                  Sign In to AppLora
                </h3>
                <p className="text-[11px] text-slate-500">
                  Access your home profile & appliance details securely
                </p>
              </div>

              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 rounded-lg bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Auth Error Banner */}
            {authError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 text-left">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Authentication Notice</p>
                  <p className="text-[11px] leading-relaxed text-red-600">{authError}</p>
                </div>
              </div>
            )}

            {/* Real Google Sign In Action */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-purple-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span>Signing in with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
