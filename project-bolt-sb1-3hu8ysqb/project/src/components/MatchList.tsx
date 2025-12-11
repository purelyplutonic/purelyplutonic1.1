import React, { useState } from 'react';
import { Star, X, Check, Filter, ArrowUpDown, Users } from 'lucide-react';
import { Match, useUser } from '../context/UserContext';
import MatchCard from './MatchCard';
import MatchProfile from './MatchProfile';

// Predefined list of common interests and hobbies (same as SignUpFlow)
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

type SortOption = 'interests' | 'recent';
type FilterOptions = {
  gender: string[];
  socialStyle: ('introvert' | 'ambivert' | 'extrovert')[];
  interests: string[];
};

const MatchList: React.FC = () => {
  const { dailyMatches, acceptMatch, declineMatch, superLikeMatch, undoLastAction, superLikesRemaining, isPremium } = useUser();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('interests');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    gender: [],
    socialStyle: [],
    interests: []
  });
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);

  const handleViewProfile = (match: Match) => {
    setSelectedMatch(match);
  };

  const handleCloseProfile = () => {
    setSelectedMatch(null);
  };

  const handleLike = (matchId: string) => {
    acceptMatch(matchId);
    setSelectedMatch(null);
  };

  const handleSuperLike = (matchId: string) => {
    if (superLikesRemaining > 0 || isPremium) {
      superLikeMatch(matchId);
      setSelectedMatch(null);
    } else {
      setShowPremiumPrompt(true);
    }
  };

  const handleSkip = (matchId: string) => {
    declineMatch(matchId);
    setSelectedMatch(null);
  };

  const handleUndo = () => {
    undoLastAction();
  };

  const toggleFilter = (type: keyof FilterOptions, value: string) => {
    setFilterOptions(prev => {
      const current = [...prev[type]];
      if (current.includes(value)) {
        return {
          ...prev,
          [type]: current.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [type]: [...current, value]
        };
      }
    });
  };

  const filteredMatches = dailyMatches.filter(match => {
    // Filter by gender if any gender filters are applied
    if (filterOptions.gender.length > 0 && !filterOptions.gender.some(g => match.gender.includes(g))) {
      return false;
    }
    
    // Filter by social style if any social style filters are applied
    if (filterOptions.socialStyle.length > 0 && !filterOptions.socialStyle.includes(match.socialStyle)) {
      return false;
    }
    
    // Filter by interests if any interest filters are applied
    if (filterOptions.interests.length > 0) {
      const matchInterestNames = match.interests.map(i => i.name);
      if (!filterOptions.interests.some(interest => matchInterestNames.includes(interest))) {
        return false;
      }
    }
    
    return true;
  });

  // Sort matches based on selected sort option
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortOption === 'interests') {
      return b.compatibilityScore - a.compatibilityScore;
    } else if (sortOption === 'recent') {
      return b.lastActive.getTime() - a.lastActive.getTime();
    }
    return 0;
  });

  // Get all unique interests from all matches for filtering
  const allInterests = predefinedInterests;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {selectedMatch ? (
        <MatchProfile 
          match={selectedMatch} 
          onClose={handleCloseProfile}
          onLike={() => handleLike(selectedMatch.id)}
          onSuperLike={() => handleSuperLike(selectedMatch.id)}
          onSkip={() => handleSkip(selectedMatch.id)}
          superLikesRemaining={superLikesRemaining}
          isPremium={isPremium}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Today's Friend Suggestions</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowSortOptions(!showSortOptions)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  Sort
                </button>
                {showSortOptions && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button
                        onClick={() => {
                          setSortOption('interests');
                          setShowSortOptions(false);
                        }}
                        className={`${
                          sortOption === 'interests' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                        role="menuitem"
                      >
                        Most Shared Interests
                      </button>
                      <button
                        onClick={() => {
                          setSortOption('recent');
                          setShowSortOptions(false);
                        }}
                        className={`${
                          sortOption === 'recent' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                        role="menuitem"
                      >
                        Most Recently Active
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={handleUndo}
                disabled={!isPremium && !undoLastAction}
                className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  isPremium || undoLastAction
                    ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    : 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
                title={isPremium ? "Undo last action" : "Premium users can undo unlimited swipes"}
              >
                Undo
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Matches</h3>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Gender</h4>
                <div className="flex flex-wrap gap-2">
                  {['Man', 'Woman', 'Couple', 'Other'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => toggleFilter('gender', gender)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        filterOptions.gender.includes(gender)
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Social Style</h4>
                <div className="flex flex-wrap gap-2">
                  {['introvert', 'ambivert', 'extrovert'].map((style) => (
                    <button
                      key={style}
                      onClick={() => toggleFilter('socialStyle', style)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        filterOptions.socialStyle.includes(style as any)
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {allInterests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleFilter('interests', interest)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        filterOptions.interests.includes(interest)
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setFilterOptions({
                      gender: [],
                      socialStyle: [],
                      interests: []
                    });
                  }}
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {sortedMatches.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {filterOptions.gender.length > 0 || filterOptions.socialStyle.length > 0 || filterOptions.interests.length > 0
                  ? 'Try adjusting your filters to see more matches.'
                  : 'Check back tomorrow for new friend suggestions!'}
              </p>
              {(filterOptions.gender.length > 0 || filterOptions.socialStyle.length > 0 || filterOptions.interests.length > 0) && (
                <button
                  onClick={() => {
                    setFilterOptions({
                      gender: [],
                      socialStyle: [],
                      interests: []
                    });
                  }}
                  className="mt-4 text-sm text-purple-600 hover:text-purple-800"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedMatches.map((match) => (
                <div key={match.id} className="cursor-pointer" onClick={() => handleViewProfile(match)}>
                  <MatchCard 
                    match={match} 
                    onLike={() => handleLike(match.id)}
                    onSuperLike={() => handleSuperLike(match.id)}
                    onSkip={() => handleSkip(match.id)}
                    superLikesRemaining={superLikesRemaining}
                    isPremium={isPremium}
                    isSuperLiked={match.isSuperLiked}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Premium Upgrade Prompt */}
      {showPremiumPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Upgrade to Premium</h3>
            <p className="text-gray-600 mb-6">
              You've used your free Super Like for today. Upgrade to Premium for unlimited Super Likes and more features!
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPremiumPrompt(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  // Handle premium upgrade
                  setShowPremiumPrompt(false);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchList;