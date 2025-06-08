
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  department: string;
  position: string;
  created_at?: string;
  updated_at?: string;
}

export const authService = {
  async signIn(name: string, password: string) {
    console.log('Attempting sign in with name:', name);
    
    // Look up email by name in employees table
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('email')
      .eq('name', name)
      .single();
    
    if (employeeError || !employee) {
      console.log('Employee lookup error:', employeeError);
      throw new Error('Employee not found with that name');
    }
    
    const email = employee.email;
    console.log('Found email for name:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }
    
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    // Get user email first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', user.email)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  },

  async getAllProfiles(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
    
    return data || [];
  }
};
