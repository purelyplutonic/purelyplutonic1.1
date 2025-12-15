import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  gender: string[];
  looking_for: string[];
  social_style: 'introvert' | 'ambivert' | 'extrovert';
  interests: Array<{ id: string; name: string; }>;
  headline?: string;
  about_me?: string;
  profile_picture?: string;
  location?: { latitude: number; longitude: number; };
  created_at?: string;
  updated_at?: string;
};

export type Match = {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'accepted' | 'declined';
  is_super_like: boolean;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type MeetupInvite = {
  id: string;
  sender_id: string;
  receiver_id: string;
  match_id: string;
  place: {
    name: string;
    address: string;
    type: string;
  };
  datetime: string;
  proposed_datetime?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'proposed_change';
  created_at: string;
  updated_at: string;
};

// Auth functions
export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name: email.split('@')[0],
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      throw new Error(error.message);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('An unexpected error occurred during sign up')
    };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No user data returned after sign in');
    }

    // Check if email is verified
    if (!authData.user.email_confirmed_at) {
      await supabase.auth.signOut();
      const error = new Error('Please verify your email before signing in. Check your inbox for the verification link.');
      (error as any).code = 'email_not_verified';
      throw error;
    }

    // Fetch the user's profile data
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profileData) {
      throw new Error('No profile found. Please complete your profile setup.');
    }

    return {
      user: authData.user,
      profile: profileData,
      session: authData.session
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error instanceof Error ? error : new Error('An unexpected error occurred during sign in');
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function resendVerificationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  });

  if (error) {
    throw error;
  }
}

// User profile functions
export async function createUserProfile(profile: Omit<UserProfile, 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert([profile], {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Create profile error:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Create profile error:', error);
    throw error instanceof Error ? error : new Error('Failed to create user profile');
  }
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Match functions
export async function createMatch(user1Id: string, user2Id: string, isSuperLike: boolean = false) {
  const { data, error } = await supabase
    .from('matches')
    .insert([{
      user1_id: user1Id,
      user2_id: user2Id,
      status: 'pending',
      is_super_like: isSuperLike
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateMatchStatus(matchId: string, status: 'accepted' | 'declined') {
  const { data, error } = await supabase
    .from('matches')
    .update({ status })
    .eq('id', matchId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUserMatches(userId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      user1:user1_id(id, name, profile_picture, headline),
      user2:user2_id(id, name, profile_picture, headline)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

// Message functions
export async function sendMessage(matchId: string, senderId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      match_id: matchId,
      sender_id: senderId,
      content
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getMatchMessages(matchId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function markMessageAsRead(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId);

  if (error) {
    throw error;
  }
}

// Real-time subscriptions
export function subscribeToMatches(userId: string, callback: (match: Match) => void) {
  return supabase
    .channel('matches')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `user1_id=eq.${userId},user2_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
}

export function subscribeToMessages(matchId: string, callback: (message: Message) => void) {
  return supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`
      },
      callback
    )
    .subscribe();
}

// Meetup invite functions
export async function createMeetupInvite(invite: Omit<MeetupInvite, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('meetup_invites')
    .insert([invite])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateMeetupInviteStatus(inviteId: string, status: 'accepted' | 'declined' | 'cancelled') {
  const { data, error } = await supabase
    .from('meetup_invites')
    .update({ status })
    .eq('id', inviteId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function proposeMeetupTimeChange(inviteId: string, proposedDatetime: string) {
  const { data, error } = await supabase
    .from('meetup_invites')
    .update({ 
      status: 'proposed_change',
      proposed_datetime: proposedDatetime
    })
    .eq('id', inviteId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function acceptProposedTime(inviteId: string) {
  const { data, error } = await supabase
    .from('meetup_invites')
    .update({ 
      status: 'accepted',
      datetime: supabase.raw('proposed_datetime'),
      proposed_datetime: null
    })
    .eq('id', inviteId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUserMeetupInvites(userId: string) {
  const { data, error } = await supabase
    .from('meetup_invites')
    .select(`
      *,
      sender:sender_id(id, name, profile_picture),
      receiver:receiver_id(id, name, profile_picture),
      match:match_id(*)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export function subscribeToMeetupInvites(userId: string, callback: (invite: MeetupInvite) => void) {
  return supabase
    .channel('meetup_invites')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'meetup_invites',
        filter: `receiver_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
}

// Location-based search
export async function searchUsersByLocation(
  latitude: number,
  longitude: number,
  radiusInKm: number,
  userId: string
) {
  // Using PostGIS would be better, but for now we'll do a simple radius search
  const { data, error } = await supabase.rpc('search_users_by_location', {
    p_latitude: latitude,
    p_longitude: longitude,
    p_radius: radiusInKm,
    p_user_id: userId
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function uploadProfilePicture(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `profile-pictures/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(filePath);

  return publicUrl;
}