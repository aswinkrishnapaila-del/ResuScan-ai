import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(1).single();
      if (data) {
        setProfile(data);
        localStorage.setItem('resuscan_profile', JSON.stringify(data));
      } else {
        // Fallback to local storage if supabase returns nothing
        const local = localStorage.getItem('resuscan_profile');
        if (local) setProfile(JSON.parse(local));
        else setProfile(null);
      }
    } catch (err) {
      console.log("Supabase fetch failed, falling back to local storage:", err.message);
      const local = localStorage.getItem('resuscan_profile');
      if (local) setProfile(JSON.parse(local));
      else setProfile(null);
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
