// app/models/auth-store.ts
import { makeAutoObservable } from "mobx"
import { supabase } from "app/services/api/supabase"
import { hydrateFromSupabase, migrateGuestDataToSupabase } from "app/services/api/habit-sync"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { habitStore } from "app/models/habit-store"

class AuthStore {
  user: any = null
  loading = false
  error: string | null = null

  constructor() {
    makeAutoObservable(this, {
      setUser: true, // mark setUser as an action
    })
    this.loadSession()

    supabase.auth.onAuthStateChange((_event, session) => {
      this.setUser(session?.user ?? null)
      if (this.user) {
        migrateGuestDataToSupabase().then(() => hydrateFromSupabase())
      }
    })
  }

  setUser(user: any) {
    this.user = user
  }

  async loadSession() {
    const { data } = await supabase.auth.getSession()
    this.setUser(data?.session?.user ?? null)
    if (this.user) {
      await hydrateFromSupabase()
    }
  }

  async signUp(email: string, password: string) {
    this.loading = true
    this.error = null
  
    try {
      // 1. Create the account
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })
  
      if (signUpError) {
        this.error = signUpError.message
        return
      }
  
      // 2. Auto-login after signup
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })
  
      if (signInError) {
        this.error = signInError.message
        return
      }
  
      // 3. Set user
      this.setUser(signInData.user)
  
      // 4. Hydrate habits (new user = empty)
      await hydrateFromSupabase()
  
    } finally {
      this.loading = false
    }
  }
  

  async signIn(email: string, password: string) {
    this.loading = true
    this.error = null
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) this.error = error.message
    this.setUser(data?.user ?? null)
    this.loading = false

    if (this.user) {
      await hydrateFromSupabase()
    }
  }

  async signOut() {
    try {
      // 1. Supabase logout
      await supabase.auth.signOut()
  
      // 2. Clear ALL local storage (guest data, cached habits, etc.)
      await AsyncStorage.clear()
  
      // 3. Reset MST stores
      habitStore.reset()
      // settingsStore.reset()   ← only if you have one
      // userStore.reset()       ← only if you have one
  
      // 4. Reset auth store itself
      this.user = null
      this.error = null
      this.loading = false
  
    } catch (e) {
      console.log("Logout error:", e)
    }
  }
}
  
export const authStore = new AuthStore()
