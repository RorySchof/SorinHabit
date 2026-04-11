
// app/services/supabase.ts
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://inykbrspygwzopyngtlu.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlueWticnNweWd3em9weW5ndGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTAyNjgsImV4cCI6MjA4MDQ4NjI2OH0.CZTRaUZmjA09UVtw254n0TxaXGLbC-sUaJIsFZBQu_8" // your anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})