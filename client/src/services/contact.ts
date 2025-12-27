import { supabase } from '@/lib/supabase';

export interface ContactQuery {
  id: number;
  created_at: string;
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContactQuery(data: ContactFormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('contact_us')
      .insert({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message
      });

    if (error) {
      console.error('Error storing contact query:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to submit contact query:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function getContactQueries(): Promise<ContactQuery[]> {
  try {
    const { data, error } = await supabase
      .from('contact_us')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact queries:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch contact queries:', error);
    throw error;
  }
}

export async function getUserContactQueries(email: string): Promise<ContactQuery[]> {
  try {
    const { data, error } = await supabase
      .from('contact_us')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user contact queries:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch user contact queries:', error);
    throw error;
  }
}