import React, { useEffect, useState } from "react";

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches;

    if (iosDevice && !isStandalone) {
      const isDismissed = sessionStorage.getItem("pwa_install_dismissed");
      if (!isDismissed) {
        setIsIOS(true);
        setShowInstallBanner(true);
      }
    }

    // Listen for beforeinstallprompt event (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      const isDismissed = sessionStorage.getItem("pwa_install_dismissed");
      if (!isDismissed && !isStandalone) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa_install_dismissed", "true");
    setShowInstallBanner(false);
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm bg-base-100/95 backdrop-blur-xl border border-primary/30 rounded-3xl p-4 shadow-2xl animate-bounce-in text-base-content">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-2xl text-white shadow-md shrink-0">
          📲
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-extrabold text-sm text-base-content tracking-tight">
            Install Connexa App
          </h4>
          <p className="text-xs text-base-content/70 mt-0.5 leading-relaxed">
            {isIOS
              ? "Tap the Share button ⎋ below and select 'Add to Home Screen'."
              : "Install as a native app on your phone for faster access & instant matching."}
          </p>

          <div className="flex items-center gap-2 mt-3">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="btn btn-primary btn-xs rounded-xl font-bold px-4 gap-1"
              >
                Install App
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="btn btn-ghost btn-xs text-base-content/60 hover:text-base-content rounded-xl"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-base-content/40 hover:text-base-content text-xs p-1"
          aria-label="Close install prompt"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;
