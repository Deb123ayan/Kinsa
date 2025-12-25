import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Singleton pattern to prevent multiple instances
let supabaseInstance: SupabaseClient | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'kinsa-auth-token',
      },
    })
  }
  return supabaseInstance
})()

// Email service function
export async function sendEmail(data: {
  to: string
  subject: string
  message: string
  from?: string
}) {
  try {
    const { data: result, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: data.to,
        subject: data.subject,
        message: data.message,
        from: data.from || 'noreply@kinsa-global.com'
      }
    })

    if (error) {
      throw error
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}