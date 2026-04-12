// app/services/habit-sync.ts

import { supabase } from "app/services/api/supabase"
import { authStore } from "app/models/auth-store"
import { habitStore } from "app/models/habit-store"
// import { hydrateFromSupabase } from "app/services/api/habit-sync"
// import { v4 as uuidv4 } from "uuid"
import uuid from "react-native-uuid"   // ⬅️ swap out the old import



// Sync a habit to Supabase
export async function syncHabitToSupabase(habit: any) {
  const userId = authStore.user?.id
  if (!userId) return

    // ⭐ Debug log — what are we actually sending?
    console.log("SYNCING HABIT TO SUPABASE:", habit)

  try {
    const { data, error } = await supabase
      .from("habits")
      .insert({
        user_id: userId,
        name: habit.name,
        emoji: habit.emoji,
        time: habit.time,
        category: habit.category,
        target: habit.target,
        unit: habit.unit,
        color: habit.color,
        frequency: habit.frequency,
        paused: habit.paused ?? false,
        deleted: habit.deleted ?? false,
      })
      .select()
      .single()

    if (error) {
      console.log("Supabase insert error:", error.message)
    } else if (data?.id) {
      // ✅ Reconcile inside an MST action
      habitStore.reconcileHabitId(habit.id, String(data.id))
    }
  } catch (e) {
    console.log("Supabase insert exception:", e)
  }
  }

// Sync an activity log entry

export async function syncActivityToSupabase(
  habitId: string,
  date: string,
  count: number
) {
  const userId = authStore.user?.id
  if (!userId) return

  try {
    const { error } = await supabase
      .from("activity_log")
      .upsert(
        {
          user_id: userId,
          habit_id: habitId,
          date,
          count,
        },
        { onConflict: "user_id,habit_id,date" } // ✅ single string
      )

    if (error) {
      console.log("❌ Supabase activity upsert error:", error.message)
    } else {
      console.log("✅ Supabase activity synced:", habitId, date, count)
    }
  } catch (e) {
    console.log("Supabase activity upsert exception:", e)
  }
}

export async function hydrateFromSupabase() {
  const userId = authStore.user?.id
  if (!userId) return

  try {
    const { data: habits, error: habitsError } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)

    const { data: logs, error: logsError } = await supabase
      .from("activity_log")
      .select("*")
      .eq("user_id", userId)

    if (habitsError) {
      console.log("Supabase habits fetch error:", habitsError.message)
    }
    if (logsError) {
      console.log("Supabase logs fetch error:", logsError.message)
    }

    if (habits && logs) {
      // 🔄 Normalize Supabase rows into plain JS objects
      const normalizedHabits = habits.map((h) => ({
        ...h,
        finished: h.finished ?? false,
        frequency: Array.isArray(h.frequency)
          ? h.frequency
          : (() => {
              try {
                return JSON.parse(h.frequency || "[]")
              } catch {
                return []
              }
            })(),
      }))

      const normalizedLogs = logs.map((l) => ({
        ...l,
        habitId: l.habit_id ?? l.habitId,
      }))

      // 👇 Debug log belongs here
      console.log("Service → calling store hydrate with:", normalizedHabits.length, normalizedLogs.length)

      

      // ✅ Delegate mutations to the MST store action
      habitStore.hydrateFromSupabase(normalizedHabits, normalizedLogs)

      console.log("✅ hydrateFromSupabase called store action with",
        normalizedHabits.length, "habits and",
        normalizedLogs.length, "logs")
    }
  } catch (e) {
    console.log("hydrateFromSupabase exception:", e)
  }
}



// Migrate all local guest habits + logs into Supabase on login


export async function migrateGuestDataToSupabase() {
  const userId = authStore.user?.id
  if (!userId) return

  console.log("🚀 Starting guest data migration for user:", userId)

  try {
    // ⬅️ load guest snapshot from AsyncStorage
    await habitStore.load()

    const localHabits = habitStore.habits.slice()
    const localLogs = habitStore.activityLog.slice()


    const { data: supabaseHabits } = await supabase
      .from("habits")
      .select("id")
      .eq("user_id", userId)

    for (const habit of localHabits) {
      const exists = supabaseHabits?.find((h) => h.id === habit.id)
      if (!exists) {
        const newId = habit.id ?? (uuid.v4() as string)

        const { error } = await supabase.from("habits").insert({
          id: newId,
          user_id: userId,
          name: habit.name,
          emoji: habit.emoji,
          time: habit.time,
          category: habit.category,
          target: habit.target,
          unit: habit.unit,
          color: habit.color,
          frequency: habit.frequency,
          paused: habit.paused ?? false,
          deleted: habit.deleted ?? false,
        })

        if (!error) {
          console.log("✅ Inserted habit:", habit.name, "→", newId)
          habitStore.reconcileHabitId(habit.id, newId)
          habitStore.reconcileLogHabitId(habit.id, newId)
        }
      }
    }

    for (const log of localLogs) {
      const { error } = await supabase.from("activity_log").upsert({
        user_id: userId,
        habit_id: log.habitId,
        date: log.date,
        count: log.count,
      }, { onConflict: "user_id,habit_id,date" })

      if (!error) {
        console.log("✅ Log upsert succeeded:", log.habitId, log.date, log.count)
      }
    }

    await hydrateFromSupabase()
    console.log("✅ Guest data migrated and hydrated from Supabase")
  } catch (err) {
    console.log("Migration error:", err)
  }
}

