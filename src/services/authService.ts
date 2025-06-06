
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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('name', emailOrName)
        .single();
      
      if (profileError || !profile) {
        console.log('Profile lookup error:', profileError);
        throw new Error('User not found with that name');
      }
      
      email = profile.email;
      console.log('Found email for name:', email);
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
    console.log('Creating user with:', { email, name, role });
    
    const tempPassword = password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + '123!';
    
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: tempPassword,
      });
      
      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }
      
      console.log('Auth user created:', authData.user?.id);
      
      if (authData.user) {
        // Wait a bit for the auth user to be fully created
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Now create the profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            name,
            role
          })
          .select()
          .single();
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
          // If profile creation fails, try to clean up the auth user
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error(`Failed to create user profile: ${profileError.message}`);
        }
        
        console.log('Profile created successfully:', profileData);
      }
      
      return { user: authData.user, tempPassword };
    } catch (error) {
      console.error('User creation failed:', error);
      throw error;
    }
  }
};
