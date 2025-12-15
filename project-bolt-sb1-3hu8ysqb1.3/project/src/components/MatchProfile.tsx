import React from 'react';
import { ArrowLeft, Star, X, Check, Heart } from 'lucide-react';
import { Match } from '../context/UserContext';

interface MatchProfileProps {
  match: Match;
  onClose: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onSkip: () => void;
  superLikesRemaining: number;
  isPremium: boolean;
}

const MatchProfile: React.FC<MatchProfileProps> = ({ 
  match, 
  onClose, 
  onLike, 
  onSuperLike, 
  onSkip,
  superLikesRemaining,
  isPremium
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative">
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md z-10"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="h-80 bg-gray-200">
          {match.profilePicture ? (
            <img 
              src={match.profilePicture} 
              alt={match.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
              <span className="text-6xl font-bold text-white">{match.name.charAt(0)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-gray-900">{match.name}</h2>
              {match.coupleStatus && (
                <div className="flex items-center text-rose-500" title={`${match.coupleStatus === 'married' ? 'Married' : 'In a relationship'}`}>
                  <Heart className="h-5 w-5 fill-current" />
                </div>
              )}
            </div>
            <p className="text-gray-600">{match.socialStyle.charAt(0).toUpperCase() + match.socialStyle.slice(1)}</p>
          </div>
          {match.isSuperLiked && (
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
              Super Liked You!
            </span>
          )}
        </div>
        
        {match.headline && (
          <div className="mb-6">
            <p className="text-lg font-medium text-gray-800 italic">"{match.headline}"</p>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">About Me</h3>
          <p className="text-gray-700 whitespace-pre-line">{match.aboutMe || match.bio}</p>
        </div>
        
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {match.interests.map((interest) => (
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
            onClick={onSkip}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          
          <button 
            onClick={onSuperLike}
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
            onClick={onLike}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
          >
            <Check className="h-8 w-8" />
          </button>
        </div>
        
        {!isPremium && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              {superLikesRemaining > 0 
                ? `${superLikesRemaining} Super ${superLikesRemaining === 1 ? 'Like' : 'Likes'} remaining today` 
                : 'No Super Likes remaining today'}
            </p>
            {superLikesRemaining === 0 && (
              <button className="text-sm text-purple-600 font-medium hover:text-purple-800">
                Upgrade to Premium for unlimited Super Likes
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchProfile;