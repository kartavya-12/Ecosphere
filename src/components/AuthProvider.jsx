import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session and rigorously verify it's not a stale/deleted user
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        supabase.auth.signOut();
        setLoading(false);
      } else {
        fetchProfile(user);
      }
    }).catch(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetchProfile(user);
        } else {
          setUser(null);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Safety fallback: if loading takes more than 5s, forced exit
    const timer = setTimeout(() => setLoading(false), 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function fetchProfile(authUser) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      let profileData = data;
      
      // If no profile exists, automatically construct and inject one to satisfy database constraints
      if (error && error.code === 'PGRST116') {
        const newProfile = {
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email.split('@')[0] || 'User',
          role: authUser.user_metadata?.role || 'community',
          trees_planted: 0,
          cleanup_drives: 0,
          rank: 'Eco-Warrior'
        };
        const { error: insertErr } = await supabase.from('profiles').insert([newProfile]);
        if (insertErr) {
           console.error("Failed to inject missing profile. Stale session?", insertErr);
           await supabase.auth.signOut();
           setUser(null);
           setLoading(false);
           return;
        }
        profileData = newProfile;
      } else if (error) {
        throw error;
      }

      setUser({
        id: authUser.id,
        email: authUser.email,
        name: profileData?.name || authUser.user_metadata?.name || 'User',
        role: profileData?.role || authUser.user_metadata?.role || 'community',
        trees_planted: profileData?.trees_planted || 0,
        cleanup_drives: profileData?.cleanup_drives || 0,
        rank: profileData?.rank || 'Eco-Warrior',
      });
    } catch (err) {
      console.error('Auth Profile Fetch Error:', err);
      // Stale or corrupted session, better to clear it to avoid FK errors downstream
      await supabase.auth.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setLoading(false);
      throw error;
    }
    if (data.user) {
      await fetchProfile(data.user);
    } else {
      setLoading(false);
    }
    return data.user;
  }

  async function signup({ name, org_name, department, role, email, password }) {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });
    
    if (error) {
      setLoading(false);
      throw error;
    }

    // Create profile entry
    if (data.user) {
      await supabase.from('profiles').insert([
        { id: data.user.id, name, org_name, department, role }
      ]);
      await fetchProfile(data.user);
    } else {
      setLoading(false);
    }
    
    return data.user;
  }

  async function verifyOTP(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });
    if (error) throw error;
    return data.user;
  }

  async function resendOTP(email) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw error;
  }

  async function googleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });
    if (error) throw error;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, verifyOTP, resendOTP, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
