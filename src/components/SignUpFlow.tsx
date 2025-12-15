import React, { useState } from 'react';
import { User, useUser } from '../context/UserContext';
import { ArrowLeft, ArrowRight, Check, Upload } from 'lucide-react';
import { createUserProfile, signUp } from '../lib/supabase';

interface SignUpFlowProps {
  onComplete: () => void;
}

// Predefined list of common interests and hobbies
const predefinedInterests = [
  // Creative & Arts
  "Reading", "Writing", "Photography", "Painting", "Drawing", "Crafts", "DIY Projects", "Poetry", 
  "Calligraphy", "Sculpture", "Art Galleries", "Museums",
  
  // Music & Entertainment
  "Music", "Concerts", "Playing Instruments", "Singing", "Movies", "TV Shows", "Theater", "Comedy", 
  "Podcasts", "Karaoke", "Film Festivals", "Vinyl Records",
  
  // Food & Drink
  "Cooking", "Baking", "Wine Tasting", "Craft Beer", "Coffee", "Tea", "Food Festivals", "Restaurants", 
  "Vegan Cuisine", "Barbecue", "Baking Bread", "Mixology",
  
  // Outdoors & Nature
  "Hiking", "Camping", "Gardening", "Bird Watching", "Fishing", "Stargazing", "Beach", "Mountains", 
  "National Parks", "Rock Climbing", "Kayaking", "Paddleboarding", "Hunting",
  
  // Sports & Fitness
  "Running", "Cycling", "Yoga", "Fitness", "Swimming", "Tennis", "Basketball", "Soccer", "Golf", 
  "Martial Arts", "Weightlifting", "Dancing", "Pilates", "Surfing", "Pickleball",
  
  // Games & Recreation
  "Gaming", "Board Games", "Card Games", "Chess", "Puzzles", "Escape Rooms", "Trivia", "Role-Playing Games", 
  "Video Games", "Tabletop Games", "Collecting",
  
  // Travel & Culture
  "Travel", "Languages", "History", "Architecture", "Cultural Events", "Road Trips", "Solo Travel", 
  "Backpacking", "City Exploration", "International Cuisine",
  
  // Technology & Science
  "Coding", "Science", "Astronomy", "Robotics", "AI", "Gadgets", "3D Printing", 
  "Electronics", "Space Exploration",
  
  // Lifestyle & Social
  "Volunteering", "Meditation", "Mindfulness", "Book Clubs", "Networking", "Public Speaking", 
  "Fashion", "Interior Design", "Sustainability", "Minimalism",
  
  // Animals & Pets
  "Pets", "Dogs", "Cats", "Horseback Riding", "Animal Rescue", "Wildlife Conservation", "Exotic Animals"
];

const SignUpFlow: React.FC<SignUpFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<Partial<User>>({
    id: Math.random().toString(36).substring(2, 9),
    name: '',
    gender: [],
    lookingToMeet: [],
    bio: '',
    interests: [],
    socialStyle: 'ambivert',
    email: '',
    headline: '',
    aboutMe: '',
    verificationSent: false,
    verified: false,
    password: '',
    confirmPassword: '',
    superLikesRemaining: 1,
    isPremium: false,
    lastResetDate: new Date()
  });
  
  const [interestInput, setInterestInput] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [interestCategory, setInterestCategory] = useState<string | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      setSignUpError(null);

      if (!userData.email || !userData.password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await signUp(userData.email, userData.password);

      if (error) {
        throw error;
      }

      if (!data?.user) {
        throw new Error('Failed to create user account');
      }

      // Show verification sent message
      setEmailVerificationSent(true);

      // Store profile data for after verification
      await createUserProfile({
        id: data.user.id,
        name: userData.name || '',
        email: userData.email,
        gender: userData.gender || [],
        looking_for: userData.lookingToMeet || [],
        social_style: userData.socialStyle || 'ambivert',
        interests: userData.interests || [],
        headline: userData.headline,
        about_me: userData.aboutMe,
        profile_picture: userData.profilePicture
      });

    } catch (error) {
      console.error('Error during sign up:', error);
      setSignUpError(
        error instanceof Error ? error.message : 'An error occurred during sign up'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const addInterest = () => {
    if (interestInput.trim() && userData.interests) {
      setUserData({
        ...userData,
        interests: [
          ...userData.interests,
          { id: Math.random().toString(36).substring(2, 9), name: interestInput.trim() }
        ]
      });
      setInterestInput('');
    }
  };

  const addPredefinedInterest = (interest: string) => {
    if (userData.interests) {
      const exists = userData.interests.some(item => item.name.toLowerCase() === interest.toLowerCase());
      if (!exists) {
        setUserData({
          ...userData,
          interests: [
            ...userData.interests,
            { id: Math.random().toString(36).substring(2, 9), name: interest }
          ]
        });
      }
    }
  };

  const removeInterest = (id: string) => {
    if (userData.interests) {
      setUserData({
        ...userData,
        interests: userData.interests.filter(interest => interest.id !== id)
      });
    }
  };

  const handleProfilePictureSubmit = () => {
    if (profilePictureUrl.trim()) {
      setUserData({
        ...userData,
        profilePicture: profilePictureUrl
      });
    }
  };

  const toggleGender = (gender: string) => {
    const currentGenders = userData.gender || [];
    if (currentGenders.includes(gender)) {
      setUserData({
        ...userData,
        gender: currentGenders.filter(g => g !== gender)
      });
    } else {
      setUserData({
        ...userData,
        gender: [...currentGenders, gender]
      });
    }
  };

  const toggleLookingToMeet = (gender: string) => {
    const currentLookingToMeet = userData.lookingToMeet || [];
    if (currentLookingToMeet.includes(gender)) {
      setUserData({
        ...userData,
        lookingToMeet: currentLookingToMeet.filter(g => g !== gender)
      });
    } else {
      setUserData({
        ...userData,
        lookingToMeet: [...currentLookingToMeet, gender]
      });
    }
  };

  const handlePasswordChange = (password: string) => {
    setUserData({
      ...userData,
      password
    });
    
    if (userData.confirmPassword) {
      setPasswordsMatch(password === userData.confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (confirmPassword: string) => {
    setUserData({
      ...userData,
      confirmPassword
    });
    
    setPasswordsMatch(userData.password === confirmPassword);
  };

  // Categories for organizing interests
  const interestCategories = [
    "All Interests",
    "Creative & Arts",
    "Music & Entertainment",
    "Food & Drink",
    "Outdoors & Nature",
    "Sports & Fitness",
    "Games & Recreation",
    "Travel & Culture",
    "Technology & Science",
    "Lifestyle & Social",
    "Animals & Pets"
  ];

  // Filter interests based on selected category
  const getFilteredInterests = () => {
    if (interestCategory === null || interestCategory === "All Interests") {
      return predefinedInterests;
    }
    
    const categoryRanges = {
      "Creative & Arts": [0, 12],
      "Music & Entertainment": [12, 24],
      "Food & Drink": [24, 36],
      "Outdoors & Nature": [36, 48],
      "Sports & Fitness": [48, 60],
      "Games & Recreation": [60, 71],
      "Travel & Culture": [71, 81],
      "Technology & Science": [81, 90],
      "Lifestyle & Social": [90, 100],
      "Animals & Pets": [100, 107]
    };
    
    const range = categoryRanges[interestCategory as keyof typeof categoryRanges];
    return range ? predefinedInterests.slice(range[0], range[1]) : [];
  };

  const filteredInterests = getFilteredInterests();

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return userData.name && userData.gender && userData.gender.length > 0 && userData.lookingToMeet && userData.lookingToMeet.length > 0;
      case 2:
        return userData.interests && userData.interests.length > 0 && userData.socialStyle;
      case 3:
        return userData.email && userData.password && userData.confirmPassword && passwordsMatch && userData.password.length >= 6;
      case 4:
        return !!userData.profilePicture;
      case 5:
        return userData.headline && userData.aboutMe;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {signUpError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {signUpError}
          </div>
        )}

        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600">Purely Plutonic</h1>
          <p className="text-gray-600 mt-2">Find genuine friendships, no dating.</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  i === step
                    ? 'bg-purple-600 text-white'
                    : i < step
                    ? 'bg-purple-200 text-purple-800'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  What Should Your Friends Call You?
                </label>
                <input
                  type="text"
                  id="name"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Your name or username"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender (Select All That Apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Man', 'Woman', 'Couple', 'Other'].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => toggleGender(gender)}
                      className={`px-4 py-2 rounded-md ${
                        userData.gender && userData.gender.includes(gender)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who Are You Looking To Meet? (Select All That Apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Man', 'Woman', 'Couple', 'Other'].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => toggleLookingToMeet(gender)}
                      className={`px-4 py-2 rounded-md ${
                        userData.lookingToMeet && userData.lookingToMeet.includes(gender)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">What Do You Do For Fun?</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select your hobbies and interests to help us find compatible friends for you.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Selected Interests:
                </label>
                <div className="flex flex-wrap gap-2 min-h-10">
                  {userData.interests && userData.interests.map((interest) => (
                    <span
                      key={interest.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {interest.name}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest.id)}
                        className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-purple-400 hover:text-purple-600 focus:outline-none"
                      >
                        <span className="sr-only">Remove</span>
                        &times;
                      </button>
                    </span>
                  ))}
                  {userData.interests && userData.interests.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No interests added yet</p>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Browse By Category:
                </label>
                <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
                  {interestCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setInterestCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                        interestCategory === category
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popular Interests:
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-md">
                  {filteredInterests.map((interest, index) => (
                    <button
                      key={`${interest}-${index}`}
                      type="button"
                      onClick={() => addPredefinedInterest(interest)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        userData.interests?.some(i => i.name.toLowerCase() === interest.toLowerCase())
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-purple-100 hover:text-purple-800'
                      } transition-colors`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add A Custom Interest:
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Add an interest not listed above..."
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How Would You Describe Your Social Style?
                </label>
                <div className="flex space-x-4">
                  {['introvert', 'ambivert', 'extrovert'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setUserData({ ...userData, socialStyle: style as 'introvert' | 'extrovert' | 'ambivert' })}
                      className={`px-4 py-2 rounded-md ${
                        userData.socialStyle === style
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Email & Password</h2>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="your.email@example.com"
                />
              </div>

<div className="mb-4">
  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
    Create Password
  </label>
  <input
    type="password"
    id="password"
    value={userData.password}
    onChange={(e) => handlePasswordChange(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
    placeholder="Create a secure password"
  />
  {userData.password && userData.password.length < 6 && (
    <p className="text-xs text-amber-600 mt-1">
      Password must be at least 6 characters
    </p>
  )}
</div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={userData.confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                    !passwordsMatch && userData.confirmPassword
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                {!passwordsMatch && userData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Add A Profile Picture</h2>
              <p className="text-sm text-gray-600 mb-4">
                A friendly face helps potential friends connect with you.
              </p>
              
              <div className="mb-6">
                <div className="flex flex-col items-center justify-center">
                  {userData.profilePicture ? (
                    <div className="relative mb-4">
                      <img
                        src={userData.profilePicture}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setUserData({ ...userData, profilePicture: undefined })}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 focus:outline-none"
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                  )}
                  
                  {!userData.profilePicture && (
                    <div className="w-full">
                      <div className="flex">
                        <input
                          type="text"
                          value={profilePictureUrl}
                          onChange={(e) => setProfilePictureUrl(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Enter image URL..."
                        />
                        <button
                          type="button"
                          onClick={handleProfilePictureSubmit}
                          className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          Add
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Enter a URL for your profile picture
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Complete Your Profile</h2>
              
              <div className="mb-4">
                <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">
                  Headline (Appears In Matches)
                </label>
                <input
                  type="text"
                  id="headline"
                  value={userData.headline}
                  onChange={(e) => setUserData({ ...userData, headline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="A brief one-liner about yourself"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {userData.headline ? 60 - userData.headline.length : 60} characters remaining
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700 mb-1">
                  About Me
                </label>
                <textarea
                  id="aboutMe"
                  value={userData.aboutMe}
                  onChange={(e) => setUserData({ ...userData, aboutMe: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  rows={4}
                  placeholder="Tell potential friends about yourself and what you're looking for..."
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top 3 Interests (Shown With Your Profile)
                </label>
                <div className="flex flex-wrap gap-2">
                  {userData.interests && userData.interests.slice(0, 3).map((interest) => (
                    <span
                      key={interest.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {interest.name}
                    </span>
                  ))}
                  {userData.interests && userData.interests.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No interests selected</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  These are your first 3 interests. Go back to step 2 to change them.
                </p>
              </div>
              
              <div className="mt-8">
                <p className="text-sm ```text-gray-600 mb-2">
                  By completing this profile, you agree to our Terms of Service and Privacy Policy.
                </p>
                <p className="text-sm text-gray-600">
                  Remember, Purely Plutonic is for friendships only. No dating or romantic connections.
                </p>
              </div>
            </div>
          )}

          {emailVerificationSent ? (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <Check className="h-6 w-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Check Your Email!
                  </h3>
                  <p className="text-green-800 mb-3">
                    We've sent a verification email to <strong>{userData.email}</strong>
                  </p>
                  <p className="text-green-700 text-sm">
                    Click the link in the email to verify your account and start making friends!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1 || isLoading}
                className={`flex items-center px-4 py-2 rounded-md ${
                  step === 1 || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepComplete() || isLoading}
                className={`flex items-center px-4 py-2 rounded-md ${
                  !isStepComplete() || isLoading
                    ? 'bg-purple-300 text-white cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                    Loading...
                  </div>
                ) : (
                  <>
                    {step < 5 ? (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Complete Profile
                        <Check className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpFlow;