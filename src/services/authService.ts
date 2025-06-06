
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  created_at?: string;
  updated_at?: string;
}

export const authService = {
  async signIn(email: string, password: string) {
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  },

  async getAllProfiles(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
    
    return data || [];
  },

  async createUserProfile(email: string, name: string, role: 'admin' | 'user' = 'user', password?: string) {
    // Create user directly in profiles table since we can't use admin API
    const tempPassword = password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + '123!';
    
    // First create the auth user with admin privileges
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name,
        role
      }
    });
    
    if (adminError) {
      // If admin API fails, try direct database insert (fallback)
      const userId = crypto.randomUUID();
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          name,
          role
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }
      
      return { user: data, tempPassword };
    }
    
    return { user: adminData.user, tempPassword };
  }
};
