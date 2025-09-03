import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { api } from "../api/client";

type User = { _id: string; name: string; email: string };

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

// ✅ Fournit une valeur par défaut (évite les erreurs de null)
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return;
      try {
        const { data } = await api.get<User>("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
      } catch {
        await SecureStore.deleteItemAsync("token");
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{ token: string }>("/auth/login", { email, password });
    await SecureStore.setItemAsync("token", data.token);
    const me = await api.get<User>("/users/me", {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    setUser(me.data);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post<{ token: string }>("/auth/register", { name, email, password });
    await SecureStore.setItemAsync("token", data.token);
    const me = await api.get<User>("/users/me", {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    setUser(me.data);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
