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
export interface Staff {
  id: number;
  salon: number;
  name: string;
  title: string;
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  salon: number;
  name: string;
  category: string;
  price: string;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Appointment {
  id: number;
  salon: number;
  customer: number;
  customer_name: string;
  staff: number;
  staff_name: string;
  service: number;
  service_name: string;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}
export interface DashboardData {
  today_revenue: string;
  today_appointment_count: number;
  total_customers: number;
  recent_appointments: {
    id: number;
    customer_name: string;
    service_name: string;
    staff_name: string;
    start_at: string;
    status: string;
  }[];
}
export interface SaleItem {
  id: number;
  service: number | null;
  description: string;
  price: string;
  quantity: number;
  line_total: string;
}

export interface Payment {
  id: number;
  method: "cash" | "card" | "other";
  amount: string;
  created_at: string;
}

export interface Sale {
  id: number;
  salon: number;
  customer: number;
  customer_name: string;
  appointment: number | null;
  discount: string;
  status: "open" | "paid" | "void";
  items: SaleItem[];
  payments: Payment[];
  subtotal: string;
  total: string;
  amount_paid: string;
  created_at: string;
  updated_at: string;
}