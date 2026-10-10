export type UserRole = "user" | "admin";

export interface UserProfile {
  id?: string;
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  points?: number;
  created_at?: string;
}
