import React, { useState } from 'react';
import { User, useUser } from '../context/UserContext';

interface OnboardingProps {
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

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { setCurrentUser } = useUser();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<Partial<User>>({
    id: Math.random().toString(36).substring(2, 9),
    name: '',
    bio: '',
    interests: [],
    socialStyle: 'ambivert',
    lookingFor: ''
  });
  
  const [interestInput, setInterestInput] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [interestCategory, setInterestCategory] = useState<string | null>(null);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      setCurrentUser(userData as User);
      onComplete();
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
      // Check if interest already exists
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
    
    const categoryIndex = interestCategories.indexOf(interestCategory) - 1;
    const interestsPerCategory = 12;
    const startIndex = categoryIndex * interestsPerCategory;
    const endIndex = startIndex + interestsPerCategory;
    
    return predefinedInterests.slice(startIndex, endIndex);
  };

  const filteredInterests = getFilteredInterests();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600">Purely Plutonic</h1>
          <p className="text-gray-600 mt-2">Find genuine friendships, no dating.</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map((i) => (
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
              <h2 className="text-xl font-semibold mb-4">Let's get to know you</h2>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  What should we call you?
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
              <div className="mb-4">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Tell us a bit about yourself
                </label>
                <textarea
                  id="bio"
                  value={userData.bio}
                  onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                  placeholder="Share a little about yourself..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How would you describe your social style?
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

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">What are your interests?</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select your hobbies and interests to help us find compatible friends for you.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your selected interests:
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
                  Browse by category:
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
                  Popular interests:
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-md">
                  {filteredInterests.map((interest, index) => (
                    <button
                      key={`${interest}-${index}`}
                      type="button"
                      onClick={() => addPredefinedInterest(interest)}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-purple-100 hover:text-purple-800 transition-colors"
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a custom interest:
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
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Add a profile picture</h2>
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
                        <span className="text-4xl text-gray-400">
                          {userData.name ? userData.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                    </div>
                  )}
                  
{!userData.profilePicture && (
  <div className="w-full">
    <label className="block w-full cursor-pointer">
      <div className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700">
        Choose Profile Photo
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onloadend = () => {
            setUserData({
              ...userData,
              profilePicture: reader.result as string
            });
          };
          reader.readAsDataURL(file);
        }}
      />
    </label>

    <p className="text-xs text-gray-500 mt-2 text-center">
      Choose a photo from your device
    </p>
  </div>
)}


          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">What kind of friends are you looking for?</h2>
              <p className="text-sm text-gray-600 mb-4">
                Help us understand what you're looking for in a friendship.
              </p>
              
              <div className="mb-4">
                <label htmlFor="lookingFor" className="block text-sm font-medium text-gray-700 mb-1">
                  I'm looking for friends who...
                </label>
                <textarea
                  id="lookingFor"
                  value={userData.lookingFor}
                  onChange={(e) => setUserData({ ...userData, lookingFor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  rows={4}
                  placeholder="Share what you're looking for in a friendship..."
                />
              </div>
              
              <div className="mt-8">
                <p className="text-sm text-gray-600 mb-2">
                  By completing this profile, you agree to our Terms of Service and Privacy Policy.
                </p>
                <p className="text-sm text-gray-600">
                  Remember, Purely Plutonic is for friendships only. No dating or romantic connections.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={`px-4 py-2 rounded-md ${
                step === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {step < 4 ? 'Next' : 'Complete Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;