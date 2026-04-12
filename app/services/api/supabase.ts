// app/services/api/supabase.ts
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://skqykzqguuedmhohchmn.supabase.co"
const supabasePublishableKey = "sb_publishable_OnTIRmUOvve1rgPq7OZc6A_PctYko6e"

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
