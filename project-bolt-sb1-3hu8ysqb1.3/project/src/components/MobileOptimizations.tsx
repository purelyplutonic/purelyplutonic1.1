import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const MobileOptimizations: React.FC = () => {
  useEffect(() => {
    // Mobile-specific optimizations
    if (Capacitor.isNativePlatform()) {
      // Prevent zoom on input focus (iOS)
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }

      // Add mobile-specific CSS classes
      document.body.classList.add('mobile-app');
      
      // Handle safe area insets
      document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
    }

    // Handle back button on Android
    const handleBackButton = () => {
      // Custom back button logic here
      return false; // Prevent default behavior
    };

    if (Capacitor.getPlatform() === 'android') {
      document.addEventListener('backbutton', handleBackButton);
      return () => document.removeEventListener('backbutton', handleBackButton);
    }
  }, []);

  return null;
};

export default MobileOptimizations;