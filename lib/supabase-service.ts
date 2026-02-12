import { createClient } from "@/utils/supabase/client";

export interface Application {
  id: string;
  student_name: string;
  father_name: string;
  mother_name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  course_id: number;
  course_name: string;
  class: string;
  school: string;
  percentage: string;
  status: string;
  submitted_at: string;
  photo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: string;
  application_id: string;
  student_name: string;
  course_name: string;
  amount: number;
  upi_id: string;
  transaction_id: string;
  status: string;
  submitted_at: string;
  screenshot?: string;
  payment_type: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

class SupabaseService {
  private supabase = createClient();

  // Applications
  async createApplication(application: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<Application> {
    const id = `APP${Date.now()}`;
    const { data, error } = await this.supabase
      .from('applications')
      .insert([{ ...application, id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getApplications(): Promise<Application[]> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getApplicationById(id: string): Promise<Application | null> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  async updateApplicationStatus(id: string, status: string): Promise<Application> {
    const { data, error } = await this.supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Payments
  async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    const id = `PAY${Date.now()}`;
    const { data, error } = await this.supabase
      .from('payments')
      .insert([{ ...payment, id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPayments(): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  async getPaymentsByApplicationId(applicationId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('application_id', applicationId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updatePaymentStatus(id: string, status: string): Promise<Payment> {
    const { data, error } = await this.supabase
      .from('payments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Admin Users
  async createAdminUser(admin: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>): Promise<AdminUser> {
    const id = `ADMIN${Date.now()}`;
    const { data, error } = await this.supabase
      .from('admin_users')
      .insert([{ ...admin, id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    const { data, error } = await this.supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | null> {
    const { data, error } = await this.supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }
}

export const supabaseService = new SupabaseService();
