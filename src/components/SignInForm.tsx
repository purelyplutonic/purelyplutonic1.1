import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { signIn } from '../lib/supabase';
import { useUser } from '../context/UserContext';

interface SignInFormProps {
  onBack: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onBack }) => {
  const { setCurrentUser, setIsAuthenticated } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { user, profile } = await signIn(email, password);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Purely Plutonic</h1>
        <p className="text-gray-600 mt-2">Welcome back!</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Sign In</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md ${
              isLoading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInForm;
