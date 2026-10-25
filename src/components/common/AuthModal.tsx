import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const GoogleIcon = ({ className = "w-5 h-5 mr-3 flex-shrink-0" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    loginWithGoogle,
    showToast 
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '976550764058-rjdm7lbg89d2aemkjlsaaegsi3at7ngb.apps.googleusercontent.com';

  // Render Official Google One-Tap & Sign-In Button
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const initGoogle = () => {
      if (googleClientId && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
              if (response?.credential) {
                setLoading(true);
                const ok = await loginWithGoogle({ credential: response.credential });
                if (ok) {
                  setIsAuthModalOpen(false);
                }
                setLoading(false);
              }
            }
          });

          const btnEl = document.getElementById('google-signin-wrapper');
          if (btnEl) {
            btnEl.innerHTML = '';
            (window as any).google.accounts.id.renderButton(btnEl, {
              theme: 'outline',
              size: 'large',
              width: 320,
              text: 'continue_with',
              shape: 'pill'
            });
            setGoogleButtonRendered(true);
          }
        } catch (err) {
          console.warn('Google SDK init error:', err);
        }
      }
    };

    if ((window as any).google?.accounts?.id) {
      initGoogle();
    } else {
      const timer = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(timer);
          initGoogle();
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [isAuthModalOpen, googleClientId]);

  if (!isAuthModalOpen) return null;

  const handleGoogleClick = () => {
    if (googleClientId && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt();
        return;
      } catch (err) {
        console.warn('Google prompt error', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-forest to-forest-dark text-white text-center">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white shadow-md flex items-center justify-center">
            <GoogleIcon className="w-8 h-8" />
          </div>

          <h3 className="font-heading font-black text-lg text-white">
            Sign In with Google
          </h3>
          <p className="text-xs text-ivory-200 mt-1">
            KD SUPERMARKET • Madhubani
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="text-center space-y-1">
            <p className="text-xs text-charcoal font-semibold">
              Access your orders, saved addresses & quick delivery
            </p>
            <p className="text-[11px] text-charcoal-muted">
              Safe, fast, and password-free login with your Google Account.
            </p>
          </div>

          {/* Official Google Sign-In Button */}
          <div className="flex justify-center min-h-[44px]">
            <div id="google-signin-wrapper" className={googleButtonRendered ? "flex justify-center w-full" : "hidden"}></div>

            {!googleButtonRendered && (
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleClick}
                className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-charcoal font-bold text-xs rounded-full border-2 border-gray-200 shadow-sm hover:shadow transition-all flex items-center justify-center active:scale-[0.98]"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            )}
          </div>

          {/* Benefits Checklist */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-charcoal-muted">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest flex-shrink-0" />
              <span>No passwords to remember</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-charcoal-muted">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest flex-shrink-0" />
              <span>Live order tracking in Madhubani town</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-charcoal-muted">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest flex-shrink-0" />
              <span>Instant checkout with 1-click reordering</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-3 text-center text-[11px] text-charcoal-muted border-t border-gray-100 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>Secured by Google Identity Services</span>
          </div>
        </div>
      </div>
    </div>
  );
};
