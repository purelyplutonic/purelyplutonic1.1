import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Edit, LogOut, Settings, CreditCard, Bell, Shield, HelpCircle, Star, Heart } from 'lucide-react';
import VerificationModal from './VerificationModal';
import VerificationBadge from './VerificationBadge';
import LoadingSpinner from './LoadingSpinner';
import CoupleLinkingModal from './CoupleLinkingModal';
import { supabase } from '../lib/supabase'; 

const ProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser, setIsAuthenticated, isPremium, upgradeToPermium } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(currentUser);
  const [activeSection, setActiveSection] = useState<
  'profile' | 'settings' | 'subscription' | 'help'
>('profile');

  const [isLoading, setIsLoading] = useState(!currentUser);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showCoupleLinkingModal, setShowCoupleLinkingModal] = useState(false);
  const [coupleInfo, setCoupleInfo] = useState<{ partnerName: string; status: string } | null>(null);
  
  useEffect(() => {
    if (currentUser) {
      setEditedUser(currentUser);
      setIsLoading(false);
      loadCoupleInfo();
    }
  }, [currentUser]);

  const loadCoupleInfo = async () => {
    if (!currentUser) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .or(`user1_id.eq.${session.session.user.id},user2_id.eq.${session.session.user.id}`)
        .eq('confirmed', true)
        .maybeSingle();

      if (error || !data) {
        setCoupleInfo(null);
        return;
      }

      const partnerId = data.user1_id === session.session.user.id ? data.user2_id : data.user1_id;
      const { data: partnerData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', partnerId)
        .maybeSingle();

      if (partnerData) {
        setCoupleInfo({
          partnerName: partnerData.name,
          status: data.status,
        });
      }
    } catch (err) {
      console.error('Error loading couple info:', err);
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }
  
  if (!currentUser || !editedUser) return null;
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setCurrentUser(editedUser);
    }
    setIsEditing(!isEditing);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedUser({
      ...editedUser,
      [name]: value
    });
  };
  
  const handleProfilePictureSubmit = () => {
    if (profilePictureUrl.trim()) {
      setEditedUser({
        ...editedUser,
        profilePicture: profilePictureUrl
      });
      setProfilePictureUrl('');
    }
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleVerificationSuccess = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        verificationSent: true
      });
    }
  };

  const handleCoupleLinkingSuccess = () => {
    loadCoupleInfo();
  };

  const unlinkCouple = async () => {
    if (!currentUser || !window.confirm('Are you sure you want to unlink your accounts?')) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { error } = await supabase
        .from('couples')
        .delete()
        .or(`user1_id.eq.${session.session.user.id},user2_id.eq.${session.session.user.id}`)
        .eq('confirmed', true);

      if (error) throw error;

      setCoupleInfo(null);
    } catch (err) {
      console.error('Error unlinking couple:', err);
      alert('Failed to unlink accounts');
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Sidebar */}
          <div className="md:w-1/4 border-r border-gray-200">

            <div className="p-6 text-center border-b border-gray-200">
              <div className="relative inline-block">
                {currentUser.profilePicture ? (
                  <img 
                    src={currentUser.profilePicture} 
                    alt={currentUser.name} 
                    className="h-24 w-24 rounded-full object-cover mx-auto"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center mx-auto">
                    <span className="text-3xl font-bold text-white">{currentUser.name.charAt(0)}</span>
                  </div>
                )}
                {isPremium && (
                  <div className="absolute bottom-0 right-0 bg-yellow-400 text-xs text-white px-2 py-1 rounded-full">
                    Premium
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center mt-4 space-x-2">
                <h2 className="text-xl font-semibold text-gray-900">{currentUser.name}</h2>
                <VerificationBadge status={currentUser.verified ? 'verified' : 'unverified'} />
              </div>
              <p className="text-sm text-gray-500 capitalize">{currentUser.socialStyle}</p>
              {!currentUser.verified && (
                <button
                  onClick={() => setShowVerificationModal(true)}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-800 flex items-center justify-center mx-auto"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Get Verified
                </button>
              )}
              {coupleInfo && (
                <div className="mt-3 px-3 py-2 bg-rose-50 rounded-lg">
                  <div className="flex items-center justify-center text-rose-700">
                    <Heart className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium capitalize">{coupleInfo.status}</span>
                  </div>
                  <p className="text-xs text-rose-600 text-center mt-1">with {coupleInfo.partnerName}</p>
                </div>
              )}
            </div>
            <nav className="p-4">
              <button
                onClick={() => setActiveSection('profile')}
                className={`w-full text-left px-4 py-2 rounded-md mb-1 flex items-center ${
                  activeSection === 'profile' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Edit className="h-5 w-5 mr-3" />
                Profile
              </button>
              <button
                onClick={() => setActiveSection('settings')}
                className={`w-full text-left px-4 py-2 rounded-md mb-1 flex items-center ${
                  activeSection === 'settings' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </button>
              <button
                onClick={() => setActiveSection('subscription')}
                className={`w-full text-left px-4 py-2 rounded-md mb-1 flex items-center ${
                  activeSection === 'subscription' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="h-5 w-5 mr-3" />
                Subscription
              </button>
              <button
                onClick={() => setActiveSection('help')}
                className={`w-full text-left px-4 py-2 rounded-md mb-1 flex items-center ${
                  activeSection === 'help' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <HelpCircle className="h-5 w-5 mr-3" />
                Help & Support
              </button>
              <div className="border-t border-gray-200 my-4"></div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-50 flex items-center"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Log Out
              </button>
            </nav>
          </div>
          {/* Main Content */}
          <div className="md:w-3/4 p-6">
            {activeSection === 'profile' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">My Profile</h2>
                  <button
                    onClick={handleEditToggle}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Profile Picture Section */}
                  {isEditing && (
                    <div>

                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={profilePictureUrl}
                          onChange={(e) => setProfilePictureUrl(e.target.value)}
                          placeholder="Enter profile picture URL"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                        <button
                          onClick={handleProfilePictureSubmit}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Headline Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Headline</h3>
                    {isEditing ? (
                      <input
                        type="text"
                        name="headline"
                        value={editedUser.headline || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Add a headline that appears in matches"
                        maxLength={60}
                      />
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 italic">"{currentUser.headline || 'No headline added yet'}"</p>
                      </div>
                    )}
                  </div>
                  
                  {/* About Me Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">About Me</h3>
                    {isEditing ? (
                      <textarea
                        name="aboutMe"
                        value={editedUser.aboutMe || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        rows={4}
                        placeholder="Tell others about yourself..."
                      />
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-line">{currentUser.aboutMe || 'No information added yet'}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Looking For Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">What I'm Looking For</h3>
                    {isEditing ? (
                      <textarea
                        name="lookingFor"
                        value={editedUser.lookingFor || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        rows={3}
                        placeholder="Tell Friends More About What You're Looking For"
                      />
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-line">
                          {currentUser.lookingFor || 'Tell Friends More About What You\'re Looking For'}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Interests Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Interests</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {currentUser.interests && currentUser.interests.map(interest => (
                          <span
                            key={interest.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                          >
                            {interest.name}
                          </span>
                        ))}
                        {(!currentUser.interests || currentUser.interests.length === 0) && (
                          <p className="text-gray-500 italic">No interests added yet</p>
                        )}
                      </div>
                      {isEditing && (
                        <button className="mt-3 text-sm text-purple-600 hover:text-purple-800 flex items-center">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Interests
                        </button>
                      )}
                    </div>
                  </div>
      </div>
    </>
  )}
  {activeSection === 'settings' && (
<>
  <div className="mb-6">
    <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
  </div>
  
  <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={currentUser.email}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <button className="text-sm text-purple-600 hover:text-purple-800">
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">New Matches</h4>
                          <p className="text-xs text-gray-500">Get notified when you match with someone</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Messages</h4>
                          <p className="text-xs text-gray-500">Get notified when you receive a new message</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Super Likes</h4>
                          <p className="text-xs text-gray-500">Get notified when someone Super Likes you</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Email Notifications</h4>
                          <p className="text-xs text-gray-500">Receive email notifications for important updates</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Relationship Status</h3>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      {coupleInfo ? (
                        <div>
                          <div className="flex items-center mb-2">
                            <Heart className="h-5 w-5 text-rose-500 mr-2" />
                            <span className="font-medium text-gray-900 capitalize">{coupleInfo.status}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">Linked with {coupleInfo.partnerName}</p>
                          <button
                            onClick={unlinkCouple}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Unlink Accounts
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600 mb-3">
                            Link your account with your partner to show you're in a relationship
                          </p>
                          <button
                            onClick={() => setShowCoupleLinkingModal(true)}
                            className="flex items-center text-sm text-rose-600 hover:text-rose-800"
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            Link Accounts
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Show Online Status</h4>
                          <p className="text-xs text-gray-500">Let others see when you're online</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Show Last Active Status</h4>
                          <p className="text-xs text-gray-500">Let others see when you were last active</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
    </div>
  </>
)}

{activeSection === 'subscription' && (
  <>
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-gray-900">Subscription</h2>
    </div>
    
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {isPremium ? 'Premium Subscription' : 'Free Plan'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {isPremium 
                          ? 'You have access to all premium features' 
                          : 'Upgrade to Premium for unlimited Super Likes and more features'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {!isPremium && (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Upgrade to Premium</h3>
                      <p className="text-gray-600">Get unlimited Super Likes and more premium features</p>
                    </div>
                    
                    <div className="p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Premium Features</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <div className="flex-shrink-0">
                            <Star className="h-5 w-5 text-yellow-500" />
                          </div>
                          <p className="ml-3 text-sm text-gray-700">Unlimited Super Likes</p>
                        </li>
                        <li className="flex items-start">
                          <div className="flex-shrink-0">
                            <Bell className="h-5 w-5 text-blue-500" />
                          </div>
                          <p className="ml-3 text-sm text-gray-700">See who Super Liked you</p>
                        </li>
                        <li className="flex items-start">
                          <div className="flex-shrink-0">
                            <Shield className="h-5 w-5 text-green-500" />
                          </div>
                          <p className="ml-3 text-sm text-gray-700">Unlimited undos</p>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-6 bg-gray-50">
                      <button
                        onClick={upgradeToPermium}
                        className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
                      >
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {activeSection === 'help' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Help & Support</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-md">
                        <button className="w-full text-left px-4 py-3 flex justify-between items-center focus:outline-none">
                          <span className="text-sm font-medium text-gray-900">What is Purely Plutonic?</span>
                          <span className="ml-6 h-7 flex items-center">
                            <svg className="h-6 w-6 transform rotate-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </button>
                        <div className="px-4 pb-3">
                          <p className="text-sm text-gray-700">
                            Purely Plutonic is a friendship-only app designed to help you find genuine platonic connections. Unlike dating apps, we focus exclusively on helping you build meaningful friendships.
                          </p>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-md">
                        <button className="w-full text-left px-4 py-3 flex justify-between items-center focus:outline-none">
                          <span className="text-sm font-medium text-gray-900">How do Super Likes work?</span>
                          <span className="ml-6 h-7 flex items-center">
                            <svg className="h-6 w-6 transform rotate-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-md">
                        <button className="w-full text-left px-4  py-3 flex justify-between items-center focus:outline-none">
                          <span className="text-sm font-medium text-gray-900">How do I report inappropriate behavior?</span>
                          <span className="ml-6 h-7 flex items-center">
                            <svg className="h-6 w-6 transform rotate-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-md">
                        <button className="w-full text-left px-4 py-3 flex justify-between items-center focus:outline-none">
                          <span className="text-sm font-medium text-gray-900">Can I change my location?</span>
                          <span className="ml-6 h-7 flex items-center">
                            <svg className="h-6 w-6 transform rotate-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Support</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Need help with something not covered in our FAQs? Our support team is here to help.
                    </p>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                      Contact Support
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Legal Information</h3>
                    <div className="space-y-2">
                      <button className="text-sm text-purple-600 hover:text-purple-800 block">
                        Terms of Service
                      </button>
                      <button className="text-sm text-purple-600 hover:text-purple-800 block">
                        Privacy Policy
                      </button>
                      <button className="text-sm text-purple-600 hover:text-purple-800 block">
                        Community Guidelines
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {showVerificationModal && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          onSuccess={handleVerificationSuccess}
          profilePictureUrl={currentUser.profilePicture}
        />
      )}

      {showCoupleLinkingModal && (
        <CoupleLinkingModal
          isOpen={showCoupleLinkingModal}
          onClose={() => setShowCoupleLinkingModal(false)}
          onSuccess={handleCoupleLinkingSuccess}
        />
      )}
    </div>
  );
};

export default ProfilePage;