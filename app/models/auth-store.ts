// app/models/auth-store.ts

import { makeAutoObservable, runInAction } from "mobx"
import { supabase } from "app/services/api/supabase"
import { hydrateFromSupabase, migrateGuestDataToSupabase } from "app/services/api/habit-sync"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { habitStore } from "app/models/habit-store"

class AuthStore {
  user: any = null
  loading = false
  error: string | null = null

  // single source of truth for hydration

  constructor() {
    makeAutoObservable(this, {
      setUser: true, // mark setUser as an action
    })
    this.loadSession()

    supabase.auth.onAuthStateChange((_event, session) => {
      this.setUser(session?.user ?? null)
      // if (this.user) {
      //   migrateGuestDataToSupabase().then(() => hydrateFromSupabase())
      // }
    })
  }

  setUser(user: any) {
    runInAction(() => {
      this.user = user
    })
  }
  async loadSession() {
    const { data } = await supabase.auth.getSession()
    this.setUser(data?.session?.user ?? null)

    if (this.user) {
      await hydrateFromSupabase()
      return
    } else {
      await habitStore.load()
    }
  }

  async signUp(email: string, password: string) {
    runInAction(() => {
      this.loading = true
      this.error = null
    })

    try {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        runInAction(() => {
          this.error = signUpError.message
        })
        return
      }

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        runInAction(() => {
          this.error = signInError.message
        })
        return
      }

      this.setUser(signInData.user)

      // ⭐ ensure guest data is loaded
      await habitStore.load()

      // ⭐ migrate guest → cloud
      await migrateGuestDataToSupabase()

      // ⭐ hydrate cloud → store
      await hydrateFromSupabase()
    } finally {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  async signIn(email: string, password: string) {
    runInAction(() => {
      this.loading = true
      this.error = null
    })

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      runInAction(() => {
        this.error = error.message
        this.loading = false
      })
      return
    }

    this.setUser(data.user)

    await habitStore.load()
    await migrateGuestDataToSupabase()
    await hydrateFromSupabase()

    runInAction(() => {
      this.loading = false
    })
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
      runInAction(() => {
        this.user = null
        this.error = null
        this.loading = false
      })
    } catch (e) {
      console.log("Logout error:", e)
    }
  }

  async deleteAccount() {
    try {
      const userId = this.user?.id
      if (!userId) return
  
      // 1. Call your deployed Edge Function
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { userId },
      })
  
      if (error) throw error
  
      // 2. Clear local storage
      await AsyncStorage.clear()
  
      // 3. Reset habit store
      habitStore.reset()
  
      // 4. Reset auth state
      runInAction(() => {
        this.user = null
        this.error = null
        this.loading = false
      })
    } catch (e) {
      console.log("Delete account error:", e)
    }
  }
  
  
}

export const authStore = new AuthStore()
