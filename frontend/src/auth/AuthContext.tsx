import { createContext } from "react";
import type { UserProfile } from "./types";
type User = any;

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signupWithGoogle: () => Promise<void>
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
