import { useEffect, useState } from 'react';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every hour
      r && setInterval(() => {
        console.log('Checking for updates...');
        r.update();
      }, 60 * 60 * 1000);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowPrompt(true);
    }
  }, [needRefresh]);

  const handleUpdate = async () => {
    await updateServiceWorker(true);
    // The page will reload automatically after service worker updates
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setNeedRefresh(false);
    // Show again after 1 hour
    setTimeout(() => setShowPrompt(true), 60 * 60 * 1000);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 bg-purple-600 text-white p-4 rounded-lg shadow-2xl z-50 animate-slide-up">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <ArrowPathIcon className="h-6 w-6 mr-2 animate-spin" />
          <h3 className="font-semibold">Update Available</h3>
        </div>
        <button onClick={handleDismiss} className="text-white/80 hover:text-white">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <p className="text-sm text-white/90 mb-3">
        A new version of Silverback is available. Update now for the latest features and fixes.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleUpdate}
          className="flex-1 bg-white text-purple-600 font-medium py-2 px-4 rounded hover:bg-gray-100 transition"
        >
          Update Now
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 border border-white/30 rounded hover:bg-white/10 transition"
        >
          Later
        </button>
      </div>
    </div>
  );
}
