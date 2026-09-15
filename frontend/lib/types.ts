export interface Salon {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export type Role = "owner" | "manager" | "staff";

export interface AuthResponse {
  token: string;
  user: User;
  salon: Salon | null;
  role: Role | null;
}

export interface Customer {
  id: number;
  salon: number;
  name: string;
  phone: string;
  email: string;
  date_of_birth: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}