import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { type UserProfile } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const makeToken = (email: string, name?: string) => {
  const isAdmin = email.toLowerCase().includes("admin");
  const uid = isAdmin ? "admin_uid" : `user_${email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}`;
  const payload = {
    uid,
    email: email.toLowerCase(),
    name: name || (isAdmin ? "ReMat Admin" : email.split("@")[0]),
  };
  return btoa(JSON.stringify(payload));
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token") || null;
    if (savedToken) {
      try {
        const decoded = JSON.parse(atob(savedToken));
        setUser(decoded);
        setToken(savedToken);

        fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch profile");
            return res.json();
          })
          .then((data: UserProfile) => {
            setProfile(data);
          })
          .catch(() => {
            const isAdmin = decoded.email?.includes("admin");
            setProfile({
              id: decoded.uid,
              uid: decoded.uid,
              email: decoded.email,
              name: decoded.name,
              role: isAdmin ? "admin" : "user",
              points: isAdmin ? 0 : 250,
              created_at: new Date().toISOString(),
            });
          })
          .finally(() => setLoading(false));
      } catch {
        localStorage.removeItem("token");
        setUser(null);
        setProfile(null);
        setToken(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, _password: string) => {
    const idToken = makeToken(email);
    localStorage.setItem("token", idToken);
    const decoded = JSON.parse(atob(idToken));
    setUser(decoded);
    setToken(idToken);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          id: data.uid,
          uid: data.uid,
          email: data.email,
          name: data.name,
          role: data.role,
          points: 100,
          created_at: new Date().toISOString(),
        });
      } else {
        const isAdmin = email.toLowerCase().includes("admin");
        setProfile({
          id: decoded.uid,
          uid: decoded.uid,
          email: decoded.email,
          name: decoded.name,
          role: isAdmin ? "admin" : "user",
          points: isAdmin ? 0 : 250,
          created_at: new Date().toISOString(),
        });
      }
    } catch {
      const isAdmin = email.toLowerCase().includes("admin");
      setProfile({
        id: decoded.uid,
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        role: isAdmin ? "admin" : "user",
        points: isAdmin ? 0 : 250,
        created_at: new Date().toISOString(),
      });
    }
  };

  const signup = async (name: string, email: string, _password: string) => {
    const idToken = makeToken(email, name);
    localStorage.setItem("token", idToken);
    const decoded = JSON.parse(atob(idToken));
    setUser(decoded);
    setToken(idToken);

    try {
      await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
    } catch (e) {
      console.warn("Backend signup notification:", e);
    }

    const isAdmin = email.toLowerCase().includes("admin");
    setProfile({
      id: decoded.uid,
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      role: isAdmin ? "admin" : "user",
      points: isAdmin ? 0 : 100,
      created_at: new Date().toISOString(),
    });
  };

  const loginWithGoogle = async () => {
    await login("admin@remat.com", "rematadmin");
  };

  const signupWithGoogle = async () => {
    await signup("Google Eco Citizen", "google_user@remat.com", "dummy");
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setUser(null);
    setProfile(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        login,
        signup,
        loginWithGoogle,
        signupWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
