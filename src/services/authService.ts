
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
  async signIn(name: string, password: string) {
    console.log('Attempting sign in with name:', name);
    
    // Look up email by name in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('name', name)
      .single();
    
    if (profileError || !profile) {
      console.log('Profile lookup error:', profileError);
      throw new Error('Employee not found with that name');
    }
    
    const email = profile.email;
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

  async createEmployee(email: string, name: string, role: 'admin' | 'user' = 'user', password?: string) {
    console.log('Creating employee with:', { email, name, role });
    
    const tempPassword = password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + '123!';
    
    try {
      // Create the auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          data: {
            name: name,
            role: role
          }
        }
      });
      
      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }
      
      console.log('Auth user created:', authData.user?.id);
      
      // The trigger will automatically create the profile
      return { user: authData.user, tempPassword };
    } catch (error) {
      console.error('Employee creation failed:', error);
      throw error;
    }
  }
};
