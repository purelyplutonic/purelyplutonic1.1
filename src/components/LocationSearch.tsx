import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { Search, MapPin, Sliders, Check, X, Star, ArrowLeft, ArrowRight, Lock } from 'lucide-react';

// Default center (San Francisco)
const defaultCenter = { lat: 37.7749, lng: -122.4194 };

const LocationSearch: React.FC = () => {
  const { 
    isPremium, 
    locationMatches, 
    searchMatchesByLocation, 
    userLocation, 
    setUserLocation,
    superLikesRemaining,
    acceptMatch,
    superLikeMatch,
    declineMatch,
    upgradeToPermium
  } = useUser();

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState(50);
  const [center, setCenter] = useState(defaultCenter);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<'distance' | 'interests'>('distance');
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [showMatchDetail, setShowMatchDetail] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          setCenter(userPos);
          setLocationPermissionStatus('granted');
          
          // Search for matches near user's location
          searchMatchesByLocation(userPos, searchRadius);
        },
        () => {
          setLocationPermissionStatus('denied');
          // Use default location if permission denied
          searchMatchesByLocation(defaultCenter, searchRadius);
        }
      );
    } else {
      setLocationPermissionStatus('denied');
      // Use default location if geolocation not supported
      searchMatchesByLocation(defaultCenter, searchRadius);
    }
  }, [setUserLocation, searchMatchesByLocation, searchRadius]);

  // Request location permission on component mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Handle search submission
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // For free users, check if they're trying to search too far from their location
    if (!isPremium && userLocation) {
      // This would normally use a geocoding service to convert the search query to coordinates
      // For demo purposes, we'll just use a random location within 150km of the user
      const randomOffset = () => (Math.random() - 0.5) * 2 * 1.5; // +/- 1.5 degrees (roughly 150km)
      const searchLocation = {
        lat: userLocation.lat + randomOffset(),
        lng: userLocation.lng + randomOffset()
      };
      
      // Calculate approximate distance
      const distance = Math.sqrt(
        Math.pow(searchLocation.lat - userLocation.lat, 2) + 
        Math.pow(searchLocation.lng - userLocation.lng, 2)
      ) * 111; // Rough conversion to km
      
      if (distance > 100) {
        // If search location is too far, show premium prompt
        setShowPremiumPrompt(true);
        return;
      }
      
      setCenter(searchLocation);
      searchMatchesByLocation(searchLocation, searchRadius);
    } else {
      // For premium users or if no user location, use the search query directly
      // This would normally use a geocoding service
      // For demo, we'll use New York coordinates if the query contains "new york" or "ny"
      if (searchQuery.toLowerCase().includes('new york') || searchQuery.toLowerCase().includes('ny')) {
        const nyLocation = { lat: 40.7128, lng: -74.0060 };
        setCenter(nyLocation);
        searchMatchesByLocation(nyLocation, searchRadius);
      } else {
        // Default to searching near San Francisco
        setCenter(defaultCenter);
        searchMatchesByLocation(defaultCenter, searchRadius);
      }
    }
  };

  // Handle radius change
  const handleRadiusChange = (radius: number) => {
    // For free users, limit radius to 100km
    const newRadius = isPremium ? radius : Math.min(radius, 100);
    setSearchRadius(newRadius);
    
    if (center) {
      searchMatchesByLocation(center, newRadius);
    }
  };

  // Handle marker click
  const handleMarkerClick = (matchId: string) => {
    setSelectedMarker(matchId);
    
    // Find the match index and set it as active
    const index = locationMatches.findIndex(m => m.id === matchId);
    if (index !== -1) {
      setActiveMatchIndex(index);
    }
  };

  // Sort matches based on selected option
  const sortedMatches = [...locationMatches].sort((a, b) => {
    if (sortOption === 'distance') {
      return (a.location?.distance || 0) - (b.location?.distance || 0);
    } else {
      return b.compatibilityScore - a.compatibilityScore;
    }
  });

  // Handle match actions
  const handleLike = (matchId: string) => {
    acceptMatch(matchId);
    
    // Move to next match if available
    if (activeMatchIndex < sortedMatches.length - 1) {
      setActiveMatchIndex(activeMatchIndex + 1);
    } else {
      setShowMatchDetail(false);
    }
  };

  const handleSuperLike = (matchId: string) => {
    if (superLikesRemaining > 0 || isPremium) {
      superLikeMatch(matchId);
      
      // Move to next match if available
      if (activeMatchIndex < sortedMatches.length - 1) {
        setActiveMatchIndex(activeMatchIndex + 1);
      } else {
        setShowMatchDetail(false);
      }
    } else {
      setShowPremiumPrompt(true);
    }
  };

  const handleSkip = (matchId: string) => {
    declineMatch(matchId);
    
    // Move to next match if available
    if (activeMatchIndex < sortedMatches.length - 1) {
      setActiveMatchIndex(activeMatchIndex + 1);
    } else {
      setShowMatchDetail(false);
    }
  };

  // Navigate through matches
  const goToNextMatch = () => {
    if (activeMatchIndex < sortedMatches.length - 1) {
      setActiveMatchIndex(activeMatchIndex + 1);
    }
  };

  const goToPrevMatch = () => {
    if (activeMatchIndex > 0) {
      setActiveMatchIndex(activeMatchIndex - 1);
    }
  };

  // View match details
  const viewMatchDetails = (index: number) => {
    setActiveMatchIndex(index);
    setShowMatchDetail(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Find Friends by Location</h2>
          
          {/* Search Bar */}
          <div className="flex mb-4">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter a city or location..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-l-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              title="Filters"
            >
              <Sliders className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          {/* Location Permission Status */}
          {locationPermissionStatus === 'denied' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <MapPin className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Location access denied.</strong> Enable location services in your browser settings for better results, or search for a specific city.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Radius ({searchRadius} km)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="5"
                      max={isPremium ? "500" : "100"}
                      value={searchRadius}
                      onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                      className="w-40 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    {!isPremium && (
                      <div className="ml-2 text-xs text-gray-500 flex items-center">
                        <Lock className="h-3 w-3 mr-1" />
                        Max 100km
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSortOption('distance')}
                      className={`px-3 py-1 text-sm rounded-full ${
                        sortOption === 'distance'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Closest First
                    </button>
                    <button
                      onClick={() => setSortOption('interests')}
                      className={`px-3 py-1 text-sm rounded-full ${
                        sortOption === 'interests'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Most Compatible
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Map Placeholder (since we're not loading the actual Google Maps) */}
          <div className="h-96 bg-gray-100 flex items-center justify-center rounded-lg mb-6">
            <div className="text-center p-6">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Map View</h3>
              <p className="text-sm text-gray-500 max-w-md">
                Map integration is disabled in this demo to avoid API key issues. In a production environment, this would display an interactive map with user locations and match pins.
              </p>
            </div>
          </div>
          
          {/* Match List */}
          {showMatchDetail ? (
            <div className="bg-white rounded-lg">
              {sortedMatches.length > 0 && (
                <div className="relative">
                  <button 
                    onClick={() => setShowMatchDetail(false)}
                    className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md z-10"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  
                  <div className="h-80 bg-gray-200">
                    {sortedMatches[activeMatchIndex].profilePicture ? (
                      <img 
                        src={sortedMatches[activeMatchIndex].profilePicture} 
                        alt={sortedMatches[activeMatchIndex].name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                        <span className="text-6xl font-bold text-white">{sortedMatches[activeMatchIndex].name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{sortedMatches[activeMatchIndex].name}</h2>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{sortedMatches[activeMatchIndex].location?.distance} km away</span>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{sortedMatches[activeMatchIndex].socialStyle}</span>
                        </div>
                      </div>
                      {sortedMatches[activeMatchIndex].isSuperLiked && (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                          Super Liked You!
                        </span>
                      )}
                    </div>
                    
                    {sortedMatches[activeMatchIndex].headline && (
                      <div className="mb-6">
                        <p className="text-lg font-medium text-gray-800 italic">"{sortedMatches[activeMatchIndex].headline}"</p>
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">About Me</h3>
                      <p className="text-gray-700 whitespace-pre-line">{sortedMatches[activeMatchIndex].aboutMe || sortedMatches[activeMatchIndex].bio}</p>
                    </div>
                    
                    <div className="mb-8">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {sortedMatches[activeMatchIndex].interests.map((interest) => (
                          <span 
                            key={interest.id} 
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                          >
                            {interest.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => handleSkip(sortedMatches[activeMatchIndex].id)}
                        className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      >
                        <X className="h-8 w-8" />
                      </button>
                      
                      <button 
                        onClick={() => handleSuperLike(sortedMatches[activeMatchIndex].id)}
                        className={`flex items-center justify-center w-16 h-16 rounded-full transition-colors ${
                          superLikesRemaining > 0 || isPremium
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={superLikesRemaining === 0 && !isPremium}
                        title={superLikesRemaining === 0 && !isPremium ? "No Super Likes remaining" : "Super Like"}
                      >
                        <Star className="h-8 w-8" />
                      </button>
                      
                      <button 
                        onClick={() => handleLike(sortedMatches[activeMatchIndex].id)}
                        className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                      >
                        <Check className="h-8 w-8" />
                      </button>
                    </div>
                    
                    {/* Navigation buttons */}
                    <div className="flex justify-between mt-6">
                      <button
                        onClick={goToPrevMatch}
                        disabled={activeMatchIndex === 0}
                        className={`p-2 rounded-full ${
                          activeMatchIndex === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div className="text-sm text-gray-500">
                        {activeMatchIndex + 1} of {sortedMatches.length}
                      </div>
                      <button
                        onClick={goToNextMatch}
                        disabled={activeMatchIndex === sortedMatches.length - 1}
                        className={`p-2 rounded-full ${
                          activeMatchIndex === sortedMatches.length - 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {sortedMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedMatches.map((match, index) => (
                    <div key={match.id} className="cursor-pointer" onClick={() => viewMatchDetails(index)}>
                      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg relative">
                        <div className="relative h-48">
                          {match.profilePicture ? (
                            <img 
                              src={match.profilePicture} 
                              alt={match.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                              <span className="text-4xl font-bold text-white">{match.name.charAt(0)}</span>
                            </div>
                          )}
                          
                          {/* Distance badge */}
                          <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                            <div className="flex items-center space-x-1 px-2 py-1">
                              <MapPin className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium">{match.location?.distance} km</span>
                            </div>
                          </div>
                          
                          {match.isSuperLiked && (
                            <div className="absolute top-2 left-2 bg-yellow-100 rounded-full p-1 shadow">
                              <div className="flex items-center space-x-1 px-2 py-1">
                                <Star className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium">Super Liked You!</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900">{match.name}</h3>
                          
                          {match.headline && (
                            <p className="text-sm text-gray-700 mb-2 italic">"{match.headline}"</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {match.interests.slice(0, 3).map((interest) => (
                              <span 
                                key={interest.id} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                              >
                                {interest.name}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex justify-between mt-4">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSkip(match.id);
                              }}
                              className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            >
                              <X className="h-6 w-6" />
                            </button>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSuperLike(match.id);
                              }}
                              className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                                superLikesRemaining > 0 || isPremium
                                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                              disabled={superLikesRemaining === 0 && !isPremium}
                            >
                              <Star className="h-6 w-6" />
                            </button>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(match.id);
                              }}
                              className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                            >
                              <Check className="h-6 w-6" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found in this area</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Try adjusting your search radius or searching in a different location.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Premium Upgrade Prompt */}
      {showPremiumPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Upgrade to Premium</h3>
            <p className="text-gray-600 mb-6">
              {superLikesRemaining === 0 
                ? "You've used your free Super Like for today. Upgrade to Premium for unlimited Super Likes!"
                : "Free users can only search within 100km of their location. Upgrade to Premium to search anywhere in the world!"}
            </p>
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-purple-800 mb-2">Premium Features:</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Search for matches anywhere in the world</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Unlimited Super Likes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Unlimited undos</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>See who Super Liked you</span>
                </li>
              </ul>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPremiumPrompt(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  upgradeToPermium();
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

export default LocationSearch;