import React, { useState, useEffect } from 'react';
import { UserProvider } from './context/UserContext';
import LandingPage from './components/LandingPage';
import SignUpFlow from './components/SignUpFlow';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import { useUser } from './context/UserContext';
import { NotificationHandler } from './components/NotificationHandler';
import ErrorBoundary from './components/ErrorBoundary';
import MobileOptimizations from './components/MobileOptimizations';
import { supabase } from './lib/supabase';
import { LoadingSpinner } from './components/LoadingSpinner';
import SignInForm from './components/SignInForm';
import TermsOfService from './components/TermsOfService';
import AuthCallback from './components/AuthCallback';

function AppContent() {
  const { currentUser, isAuthenticated, setIsAuthenticated, setCurrentUser } = useUser();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthCallback, setIsAuthCallback] = useState(false);

  useEffect(() => {
    const isCallback = window.location.pathname === '/auth/callback';

    if (isCallback) {
      setIsAuthCallback(true);
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            setCurrentUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              gender: profile.gender,
              lookingToMeet: profile.looking_for,
              bio: profile.about_me || '',
              headline: profile.headline || '',
              aboutMe: profile.about_me || '',
              profilePicture: profile.profile_picture,
              interests: profile.interests,
              socialStyle: profile.social_style,
              password: '',
              confirmPassword: '',
              verificationSent: false,
              verified: profile.verification_status === 'verified',
              lookingFor: profile.looking_for.join(', '),
              isPremium: false,
              superLikesRemaining: 1,
              lastResetDate: new Date()
            });
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setIsAuthenticated, setCurrentUser]);

  const handleSignUpClick = () => {
    setShowSignUp(true);
    setShowSignIn(false);
  };

  const handleSignInClick = () => {
    setShowSignIn(true);
    setShowSignUp(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (isAuthCallback) {
    return <AuthCallback />;
  }

  if (showTerms) {
    return <TermsOfService onBack={() => setShowTerms(false)} />;
  }

  if (!isAuthenticated) {
    if (showSignUp) {
      return <SignUpFlow onComplete={async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            setCurrentUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              bio: profile.about_me,
              interests: profile.interests,
              socialStyle: profile.social_style,
              profilePicture: profile.profile_picture,
              headline: profile.headline,
              location: profile.location,
              gender: profile.gender,
              lookingToMeet: profile.looking_for
            });
            setIsAuthenticated(true);
          }
        }
        setShowSignUp(false);
      }} />;
    }
    if (showSignIn) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <SignInForm onBack={() => setShowSignIn(false)} />
        </div>
      );
    }
    return <LandingPage onSignUpClick={handleSignUpClick} onSignInClick={handleSignInClick} onTermsClick={() => setShowTerms(true)} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Dashboard />
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <MobileOptimizations />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
          <NotificationHandler />
          <AppContent />
        </div>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;