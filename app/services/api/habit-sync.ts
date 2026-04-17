// // app/services/habit-sync.ts

// import { supabase } from "app/services/api/supabase"
// import { authStore } from "app/models/auth-store"
// import { habitStore } from "app/models/habit-store"
// // import { hydrateFromSupabase } from "app/services/api/habit-sync"
// // import { v4 as uuidv4 } from "uuid"
// // import uuid from "react-native-uuid"   // ⬅️ swap out the old import



// // Sync a habit to Supabase
// export async function syncHabitToSupabase(habit: any) {
//   const userId = authStore.user?.id
//   if (!userId) return

//     // ⭐ Debug log — what are we actually sending?
//     console.log("SYNCING HABIT TO SUPABASE:", habit)

//   try {
//     const { data, error } = await supabase
//       .from("habits")
//       .insert({
//         user_id: userId,
//         name: habit.name,
//         emoji: habit.emoji,
//         time: habit.time,
//         category: habit.category,
//         target: habit.target,
//         unit: habit.unit,
//         color: habit.color,
//         frequency: habit.frequency,
//         paused: habit.paused ?? false,
//         deleted: habit.deleted ?? false,
//       })
//       .select()
//       .single()

//     if (error) {
//       console.log("Supabase insert error:", error.message)
//     } else if (data?.id) {
//       // ✅ Reconcile inside an MST action
//       habitStore.reconcileHabitId(habit.id, String(data.id))
//     }
//   } catch (e) {
//     console.log("Supabase insert exception:", e)
//   }
//   }

// // Sync an activity log entry

// export async function syncActivityToSupabase(
//   habitId: string,
//   date: string,
//   count: number
// ) {
//   const userId = authStore.user?.id
//   if (!userId) return

//   try {
//     const { error } = await supabase
//       .from("activity_log")
//       .upsert(
//         {
//           user_id: userId,
//           habit_id: habitId,
//           date,
//           count,
//         },
//         { onConflict: "user_id,habit_id,date" } // ✅ single string
//       )

//     if (error) {
//       console.log("❌ Supabase activity upsert error:", error.message)
//     } else {
//       console.log("✅ Supabase activity synced:", habitId, date, count)
//     }
//   } catch (e) {
//     console.log("Supabase activity upsert exception:", e)
//   }
// }

// export async function hydrateFromSupabase() {
//   const userId = authStore.user?.id
//   if (!userId) return

//   try {
//     const { data: habits, error: habitsError } = await supabase
//       .from("habits")
//       .select("*")
//       .eq("user_id", userId)

//     const { data: logs, error: logsError } = await supabase
//       .from("activity_log")
//       .select("*")
//       .eq("user_id", userId)

//     if (habitsError) {
//       console.log("Supabase habits fetch error:", habitsError.message)
//     }
//     if (logsError) {
//       console.log("Supabase logs fetch error:", logsError.message)
//     }

//     if (habits && logs) {
//       // 🔄 Normalize Supabase rows into plain JS objects
//       const normalizedHabits = habits.map((h) => ({
//         ...h,
//         finished: h.finished ?? false,
//         frequency: Array.isArray(h.frequency)
//           ? h.frequency
//           : (() => {
//               try {
//                 return JSON.parse(h.frequency || "[]")
//               } catch {
//                 return []
//               }
//             })(),
//       }))

//       const normalizedLogs = logs.map((l) => ({
//         ...l,
//         habitId: l.habit_id ?? l.habitId,
//       }))

//       // 👇 Debug log belongs here
//       console.log("Service → calling store hydrate with:", normalizedHabits.length, normalizedLogs.length)

      

//       // ✅ Delegate mutations to the MST store action
//       habitStore.hydrateFromSupabase(normalizedHabits, normalizedLogs)

//       console.log("✅ hydrateFromSupabase called store action with",
//         normalizedHabits.length, "habits and",
//         normalizedLogs.length, "logs")
//     }
//   } catch (e) {
//     console.log("hydrateFromSupabase exception:", e)
//   }
// }



// // Migrate all local guest habits + logs into Supabase on login


// export async function migrateGuestDataToSupabase() {
//   const userId = authStore.user?.id
//   if (!userId) return

//   console.log("🚀 Starting guest data migration for user:", userId)

//   // 1. Load guest snapshot
//   await habitStore.load()

//   const localHabits = habitStore.habits.slice()
//   const localLogs = habitStore.activityLog.slice()

//   if (localHabits.length === 0 && localLogs.length === 0) {
//     console.log("No guest data to migrate")
//     return
//   }

//   // 2. Insert habits (always insert — never check IDs)
//   const { data: insertedHabits, error: habitError } = await supabase
//     .from("habits")
//     .insert(
//       localHabits.map((h) => ({
//         user_id: userId,
//         name: h.name,
//         emoji: h.emoji,
//         time: h.time,
//         date: h.date,
//         created_at: h.createdAt,
//         category: h.category,
//         target: h.target,
//         unit: h.unit,
//         color: h.color,
//         frequency: h.frequency,
//         paused: h.paused ?? false,
//         deleted: h.deleted ?? false,
//       }))
//     )
//     .select()

//   if (habitError) {
//     console.log("Habit migration error:", habitError)
//     return
//   }

//   // 3. Reconcile IDs
//   insertedHabits.forEach((row, idx) => {
//     const localId = localHabits[idx].id
//     const cloudId = row.id
//     habitStore.reconcileHabitId(localId, cloudId)
//     habitStore.reconcileLogHabitId(localId, cloudId)
//   })

//   // 4. Insert logs
//   const { error: logError } = await supabase
//     .from("activity_log")
//     .insert(
//       localLogs.map((l) => ({
//         user_id: userId,
//         habit_id: l.habitId,
//         date: l.date,
//         count: l.count,
//       }))
//     )

//   if (logError) {
//     console.log("Log migration error:", logError)
//   }

//   // 5. Hydrate from cloud
//   await hydrateFromSupabase()

//   console.log("✅ Guest data migrated and hydrated from Supabase")
// }






// app/services/habit-sync.ts

import { supabase } from "app/services/api/supabase"
import { authStore } from "app/models/auth-store"
import { habitStore } from "app/models/habit-store"
import { getSnapshot } from "mobx-state-tree"

// -------------------------------------------------------------
// SYNC HABIT
// -------------------------------------------------------------
export async function syncHabitToSupabase(habit: any) {
  const userId = authStore.user?.id
  if (!userId) return

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
      console.log("❌ Habit sync error:", error.message)
      return
    }

    if (data?.id) {
      habitStore.reconcileHabitId(habit.id, String(data.id))
    }
  } catch (e) {
    console.log("❌ Habit sync exception:", e)
  }
}

// -------------------------------------------------------------
// SYNC ACTIVITY
// -------------------------------------------------------------
export async function syncActivityToSupabase(habitId: string, date: string, count: number) {
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
        { onConflict: "user_id,habit_id,date" }
      )

    if (error) {
      console.log("❌ Activity sync error:", error.message)
    }
  } catch (e) {
    console.log("❌ Activity sync exception:", e)
  }
}

// -------------------------------------------------------------
// HYDRATE FROM SUPABASE
// -------------------------------------------------------------
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

    if (habitsError) console.log("❌ Fetch habits error:", habitsError.message)
    if (logsError) console.log("❌ Fetch logs error:", logsError.message)

    if (!habits || !logs) return

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

    console.log(
      `📥 Hydrating from Supabase → ${normalizedHabits.length} habits, ${normalizedLogs.length} logs`
    )

    habitStore.hydrateFromSupabase(normalizedHabits, normalizedLogs)
  } catch (e) {
    console.log("❌ Hydration exception:", e)
  }
}

// -------------------------------------------------------------
// MIGRATE GUEST DATA → SUPABASE
// -------------------------------------------------------------

export async function migrateGuestDataToSupabase() {
  const userId = authStore.user?.id
  if (!userId) return

  console.log("🚀 Migrating guest data for:", userId)

  // Ensure guest data is loaded
  await habitStore.load()

  const localHabits = habitStore.habits.slice()
  const localLogs = habitStore.activityLog.slice()

  if (localHabits.length === 0 && localLogs.length === 0) {
    console.log("ℹ️ No guest data to migrate")
    return
  }

  // Insert habits
  const { data: insertedHabits, error: habitError } = await supabase
    .from("habits")
    .insert(
      localHabits.map((h) => ({
        user_id: userId,
        name: h.name,
        emoji: h.emoji,
        time: h.time,
        created_at: h.createdAt,
        category: h.category,
        target: h.target,
        unit: h.unit,
        color: h.color,
        frequency: h.frequency,
        paused: h.paused ?? false,
        deleted: h.deleted ?? false,
      }))
    )
    .select()

  if (habitError) {
    console.log("❌ Habit migration error:", habitError.message)
    return
  }

  // Reconcile IDs in MST
  insertedHabits.forEach((row, idx) => {
    const localId = localHabits[idx].id
    const cloudId = row.id
    habitStore.reconcileHabitId(localId, cloudId)
    habitStore.reconcileLogHabitId(localId, cloudId)
  })

  // ⭐ Build logs from UPDATED MST snapshots (not localLogs)
  const logsToInsert = habitStore.activityLog.map((log) => {
    const snap = getSnapshot(log)
    return {
      user_id: userId,
      habit_id: snap.habitId,   // now the Supabase UUID
      date: snap.date,
      count: snap.count,
    }
  })

  // Insert logs
  const { error: logError } = await supabase
    .from("activity_log")
    .insert(logsToInsert)

  if (logError) {
    console.log("❌ Log migration error:", logError.message)
  }

  console.log("📤 Guest data migrated → hydrating…")

  await hydrateFromSupabase()

  console.log("✅ Migration complete")
}
