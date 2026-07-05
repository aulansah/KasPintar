import { createContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

// WAJIB di-export karena dipakai oleh useAuth.js
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function login(email, password) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async function register(email, password) {
    return await supabase.auth.signUp({
      email,
      password,
    });
  }

  async function logout() {
    return await supabase.auth.signOut();
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}