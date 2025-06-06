
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
  async signIn(emailOrName: string, password: string) {
    let email = emailOrName;
    
    // Check if the input looks like a name (doesn't contain @)
    if (!emailOrName.includes('@')) {
      // Look up email by name in profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('name', emailOrName)
        .single();
      
      if (!profile) {
        throw new Error('User not found with that name');
      }
      
      email = profile.email;
    }
    
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
    const tempPassword = password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + '123!';
    
    // Use regular signUp to create auth user and profile
    const { data, error } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: {
          name,
          role
        }
      }
    });
    
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    
    if (data.user) {
      // Manually insert into profiles table since the trigger might not work properly
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email,
          name,
          role
        });
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't throw here as the user was created successfully
      }
    }
    
    return { user: data.user, tempPassword };
  }
};
