// app/services/api/supabase.ts
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ievvxilykivnmjqlsmzc.supabase.co"
const supabasePublishableKey = "sb_publishable_QvnhQKPnaUjosTuz9tLIhA_kUneQrw0"

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
