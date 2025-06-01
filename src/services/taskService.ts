
import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_to: string;
  due_date: string;
  created_at?: string;
  updated_at?: string;
}

export const taskService = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
    
    return (data || []).map(task => ({
      ...task,
      status: task.status as Task['status'],
      priority: task.priority as Task['priority']
    }));
  },

  async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }
    
    return {
      ...data,
      status: data.status as Task['status'],
      priority: data.priority as Task['priority']
    };
  },

  async update(id: string, task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...task, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }
    
    return {
      ...data,
      status: data.status as Task['status'],
      priority: data.priority as Task['priority']
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: Task['status']): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
    
    return {
      ...data,
      status: data.status as Task['status'],
      priority: data.priority as Task['priority']
    };
  }
};
