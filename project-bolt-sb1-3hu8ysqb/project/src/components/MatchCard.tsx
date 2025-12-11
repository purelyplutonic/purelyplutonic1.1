import React from 'react';
import { Check, X, Star, Percent, Heart } from 'lucide-react';
import { Match } from '../context/UserContext';

interface MatchCardProps {
  match: Match;
  onLike: () => void;
  onSuperLike: () => void;
  onSkip: () => void;
  superLikesRemaining: number;
  isPremium: boolean;
  isSuperLiked?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  onLike, 
  onSuperLike, 
  onSkip,
  superLikesRemaining,
  isPremium,
  isSuperLiked
}) => {
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent card click (profile view)
    action();
  };

  return (
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
        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
          <div className="flex items-center space-x-1 px-2 py-1">
            <Percent className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">{match.compatibilityScore}%</span>
          </div>
        </div>
        
        {isSuperLiked && (
          <div className="absolute top-2 left-2 bg-yellow-100 rounded-full p-1 shadow">
            <div className="flex items-center space-x-1 px-2 py-1">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Super Liked You!</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-gray-900">{match.name}</h3>
          {match.coupleStatus && (
            <div className="flex items-center text-rose-500" title={`${match.coupleStatus === 'married' ? 'Married' : 'In a relationship'}`}>
              <Heart className="h-4 w-4 fill-current" />
            </div>
          )}
        </div>

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
            onClick={(e) => handleAction(e, onSkip)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <button 
            onClick={(e) => handleAction(e, onSuperLike)}
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
            onClick={(e) => handleAction(e, onLike)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
          >
            <Check className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;