import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid) {
    if (!uid) {
      setProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", uid)
        .single();

      if (error) {
        console.error("Error loading user profile:", error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Unexpected error loading profile:", err);
      setProfile(null);
    }
  }

  useEffect(() => {
    // Check active session
    async function checkUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          await loadProfile(session.user.id);
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setLoading(false);
      }
    }

    checkUser();

    // Listen to changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const register = async (email, password, nom, prenom, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nom,
          prenom,
          role,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        reloadProfile: () => loadProfile(user?.id),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
