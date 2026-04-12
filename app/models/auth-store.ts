// // app/models/auth-store.ts

// import { makeAutoObservable } from "mobx"
// import { supabase } from "app/services/api/supabase"
// import { hydrateFromSupabase, migrateGuestDataToSupabase } from "app/services/api/habit-sync"

// class AuthStore {
//   user: any = null
//   loading = false
//   error: string | null = null

//   constructor() {
//     makeAutoObservable(this)
//     this.loadSession()

//     // Keep user in sync with Supabase events
//     supabase.auth.onAuthStateChange((_event, session) => {
//       this.user = session?.user ?? null
//       if (this.user) {
//         // 🔗 run migration first, then hydrate
//         migrateGuestDataToSupabase().then(() => hydrateFromSupabase())
//       }
//     })
//   }

//   async loadSession() {
//     const { data } = await supabase.auth.getSession()
//     this.user = data?.session?.user ?? null
//     if (this.user) {
//       // 🔗 hydrate on app startup if session exists
//       await hydrateFromSupabase()
//     }
//   }

//   async signUp(email: string, password: string) {
//     this.loading = true
//     this.error = null
//     const { data, error } = await supabase.auth.signUp({ email, password })
//     if (error) this.error = error.message
//     this.user = data?.user ?? null
//     this.loading = false

//     if (this.user) {
//       // 🔗 hydrate after sign‑up
//       await hydrateFromSupabase()
//     }
//   }

//   async signIn(email: string, password: string) {
//     this.loading = true
//     this.error = null
//     const { data, error } = await supabase.auth.signInWithPassword({ email, password })
//     if (error) this.error = error.message
//     this.user = data?.user ?? null
//     this.loading = false

//     if (this.user) {
//       // 🔗 hydrate after sign‑in
//       await hydrateFromSupabase()
//     }
//   }

//   async signOut() {
//     await supabase.auth.signOut()
//     this.user = null
//     // optional: clear local habits/logs here if you want a clean guest state
//   }
// }

// export const authStore = new AuthStore()


// app/models/auth-store.ts
import { makeAutoObservable } from "mobx"
import { supabase } from "app/services/api/supabase"
import { hydrateFromSupabase, migrateGuestDataToSupabase } from "app/services/api/habit-sync"

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
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) this.error = error.message
    this.setUser(data?.user ?? null)
    this.loading = false

    if (this.user) {
      await hydrateFromSupabase()
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
    await supabase.auth.signOut()
    this.setUser(null)
    // optional: clear local habits/logs here if you want a clean guest state
  }
}

export const authStore = new AuthStore()
