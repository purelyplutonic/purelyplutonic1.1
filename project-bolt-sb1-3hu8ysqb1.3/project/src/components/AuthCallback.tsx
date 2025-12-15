import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import LoadingSpinner from './LoadingSpinner';

const AuthCallback: React.FC = () => {
  const { setIsAuthenticated, setCurrentUser } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          setError('No session found. Please try signing in again.');
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile error:', profileError);
        }

        if (profileData) {
          setCurrentUser({
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            gender: profileData.gender || [],
            lookingToMeet: profileData.looking_for || [],
            bio: profileData.about_me || '',
            headline: profileData.headline || '',
            aboutMe: profileData.about_me || '',
            lookingFor: '',
            profilePicture: profileData.profile_picture,
            interests: profileData.interests || [],
            socialStyle: profileData.social_style || 'ambivert',
            password: '',
            confirmPassword: '',
            verificationSent: false,
            verified: true,
            isPremium: false,
            superLikesRemaining: 1,
            lastResetDate: new Date()
          });
        }

        setIsAuthenticated(true);
        setSuccess(true);

        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Failed to verify email');
      }
    };

    handleEmailVerification();
  }, [setIsAuthenticated, setCurrentUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <span className="text-red-600 text-2xl">✕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified. Redirecting you to the app...
          </p>
          <LoadingSpinner size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <LoadingSpinner size="lg" text="Verifying your email..." />
      </div>
    </div>
  );
};

export default AuthCallback;
