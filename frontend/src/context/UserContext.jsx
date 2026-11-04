import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => {
    try {
      const local = localStorage.getItem('resuscan_profile');
      if (local) return JSON.parse(local);
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    // Non-blocking fetch with 1.2s timeout so it never hangs or freezes the page
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase request timeout')), 1200)
      );
      const queryPromise = supabase.from('profiles').select('*').limit(1).maybeSingle();
      const res = await Promise.race([queryPromise, timeoutPromise]);
      
      if (res && res.data) {
        setProfile(res.data);
        try {
          localStorage.setItem('resuscan_profile', JSON.stringify(res.data));
        } catch {}
      }
    } catch {
      // Gracefully fall back to local cached profile without throwing
      try {
        const local = localStorage.getItem('resuscan_profile');
        if (local) setProfile(JSON.parse(local));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <UserContext.Provider value={{ profile, refreshProfile: fetchProfile, loading, setProfile }}>
      {children}
    </UserContext.Provider>
  );
};
