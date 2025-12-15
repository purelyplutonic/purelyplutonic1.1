import React, { useState } from 'react';
import { UserCircle, Loader } from 'lucide-react';
import { signIn, signUp } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import TaglineCarousel from './TaglineCarousel';

interface LandingPageProps {
  onSignUpClick: () => void;
  onSignInClick: () => void;
  onTermsClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSignUpClick, onTermsClick }) => {
  const { setCurrentUser, setIsAuthenticated } = useUser();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSigningIn(true);

    try {
      const result = await signIn(email, password);

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.user) {
        setCurrentUser(result.user as any);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleQuickSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSigningUp(true);

    try {
      onSignUpClick();
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
          backgroundPosition: 'center',
          filter: 'brightness(0.7)'
        }}
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow px-4 text-center text-white">
        <div className="max-w-md w-full">
          <div className="mb-12">
            <div className="flex items-center justify-center mb-4">
              <UserCircle className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-6xl sm:text-7xl font-bold mb-8 text-white">Purely Plutonic</h1>
            
            <TaglineCarousel />
          </div>
          
          {showSignIn ? (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-white rounded">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  {isSigningIn ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
              
              <button
                onClick={() => setShowSignIn(false)}
                className="mt-4 text-sm text-white/80 hover:text-white"
              >
                Need an account? Sign up instead
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={onSignUpClick}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
              >
                Sign Up
              </button>
              
              <button
                onClick={() => setShowSignIn(true)}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition duration-200 border border-white/20"
              >
                Sign In
              </button>
            </div>
          )}
          
          <p className="mt-8 text-sm text-white/80">
            By signing up, you agree to our{' '}
            <button onClick={onTermsClick} className="underline hover:text-white transition">
              Terms of Service
            </button>{' '}
            and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;