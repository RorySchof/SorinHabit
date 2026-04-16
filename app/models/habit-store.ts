// HABIT STORE --------------------------------------------------

import { types, flow, onSnapshot, applySnapshot } from "mobx-state-tree"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { HabitModel } from "../models/HabitModel"
import { ActivityLogModel } from "../models/ActivityLogModel" // adjust path if needed
import { subDays, format, parseISO, getDay } from "date-fns"
import { Instance } from "mobx-state-tree"
import * as Notifications from "expo-notifications"
import { supabase } from "app/services/api/supabase"
import { authStore } from "app/models/auth-store"
import { syncHabitToSupabase, syncActivityToSupabase } from "app/services/api/habit-sync"
import * as Haptics from "expo-haptics"


// REMINDER OFFSETS --------------------------------------------

const reminderOffsets: Record<string, number> = {
  "At the habit time": 0,
  "5 minutes before": 5,
  "10 minutes before": 10,
  "15 minutes before": 15,
  "30 minutes before": 30,
}

// REMINDER SCHEDULING -----------------------------------------

export const scheduleHabitReminder = flow(function* scheduleHabitReminder(habit) {
  console.log("🔔 scheduleHabitReminder called for:", habit.name)

  if (!habit.reminder || habit.deleted || habit.paused) {
    console.log("⛔ Skipping schedule — reminder missing or habit inactive:", habit.name)
    return
  }

  const offset = reminderOffsets[habit.reminder] ?? 0
  if (!habit.time || habit.time === "anytime") {
    console.log("⛔ Skipping schedule — no valid time:", habit.name)
    return
  }

  const [hours, minutes] = habit.time.split(":").map(Number)

  // ⛑️ Guardrail: prevent invalid time strings from breaking scheduling
if (isNaN(hours) || isNaN(minutes)) {
  console.log("❌ Invalid time format, skipping reminder:", habit.time)
  return
}

  const now = new Date()
  const trigger = new Date()
  trigger.setHours(hours, minutes, 0, 0)

  console.log("⏱ Raw trigger:", trigger.toString(), "Now:", now.toString())

  if (trigger <= now) {
    trigger.setDate(trigger.getDate() + 1)
    console.log("➡️ Trigger was in the past — moved to tomorrow:", trigger.toString())
  }

  trigger.setMinutes(trigger.getMinutes() - offset)
  console.log("⏳ Final trigger after offset:", trigger.toString(), "Offset:", offset)

  const id = yield Notifications.scheduleNotificationAsync({
    content: {
      title: "Habit Reminder",
      body: `Time for ${habit.name}`,
      sound: true,
    },
    trigger: {
      type: "calendar",
      hour: trigger.getHours(),
      minute: trigger.getMinutes(),
      repeats: true,
    } as Notifications.CalendarTriggerInput,
  })

  console.log("✅ Scheduled reminder:", habit.name, "ID:", id)
  habit.reminderId = id
})

export const cancelHabitReminder = flow(function* cancelHabitReminder(habit) {
  if (habit.reminderId) {
    console.log("🗑 Canceling reminder:", habit.name, "ID:", habit.reminderId)
    yield Notifications.cancelScheduledNotificationAsync(habit.reminderId)
    habit.reminderId = undefined
  } else {
    console.log("ℹ️ No reminder to cancel for:", habit.name)
  }
})


// DAY NAME → NUMBER MAP ---------------------------------------


const dayNameToNumber: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

// DAY STATUS GENERATION ---------------------------------------

function getDayStatuses(habit, chartLength, activityLog) {
  if (habit.deleted) {
    // treat deleted habits as unscheduled going forward
    return Array(chartLength).fill("unscheduled")
  }

  // 🔁 Convert day names to numbers
  const scheduledDays = habit.frequency.map((day) => dayNameToNumber[day])

  const dateRange = Array.from({ length: chartLength }).map((_, idx) => {
    const date = subDays(new Date(), chartLength - 1 - idx)
    return format(date, "yyyy-MM-dd")
  })

  const statuses = dateRange.map((date) => {
    const dayOfWeek = getDay(parseISO(date)) // 0 (Sun) to 6 (Sat)

    if (!scheduledDays.includes(dayOfWeek)) {
      return "unscheduled"
    }

    const log = activityLog.find((entry) => entry.habitId === habit.id && entry.date === date)

    if (!log) {
      return "missed"
    }

    if (log.count >= habit.target) return "green"
    if (log.count > 0) return "yellow"

    return "missed"
  })
  return statuses
}

// STORAGE KEY --------------------------------------------------

const STORAGE_KEY = "HabitStoreSnapshot"

// HABIT DATA TYPE ---------------------------------------------

type HabitData = {
  name: string
  emoji: string
  time: string
  // date?: string
  date: string

  category: string
  target: number
  unit: string
  color: string
  frequency: string[]
  reminder?: string
}

// HABIT STORE MODEL -------------------------------------------

export const HabitStoreModel = types
  .model("HabitStore", {
    habits: types.array(HabitModel),
    activityLog: types.array(ActivityLogModel),
  })

  // VIEWS ------------------------------------------------------
  .views((self) => ({
    getHabitsWithStatuses(chartLength: number) {
      return self.habits
        .filter((habit) => !habit.deleted) // ✅ skip deleted
        .map((habit) => ({
          ...habit,
          dayStatuses: getDayStatuses(habit, chartLength, self.activityLog),
        }))
    },
  }))

  // STORE-LEVEL ACTIONS ---------------------------------------
  .actions((self) => ({
    // ⭐ RESET STORE (used on logout)
  reset() {
    applySnapshot(self, {
      habits: [],
      activityLog: [],
    })
  },
    // ✅ New store-level action to reconcile log IDs
    reconcileLogHabitId(oldId: string, newId: string) {
      self.activityLog.forEach((log) => {
        if (log.habitId === oldId) {
          log.habitId = newId // ✅ allowed because we’re inside a store action
        }
      })
    },

    // MASTER STREAK FUNCTION

        calculateHabitStreaks(habit) {
      if (!habit) {
        return { currentStreak: 0, longestStreak: 0 }
      }

      if (habit.paused || habit.deleted) {
        return { currentStreak: 0, longestStreak: habit.longestStreak ?? 0 }
      }

      const createdAt = habit.createdAt ? new Date(habit.createdAt) : new Date(0)

      const scheduledDayNumbers = (habit.frequency ?? [])
        .map((name) => dayNameToNumber[name])
        .filter((n) => n !== undefined)

      const completedSet = new Set(
        self.activityLog
          .filter((log) => log.habitId === habit.id && log.count >= habit.target)
          .map((log) => log.date),
      )

      if (completedSet.size === 0) {
        habit.longestStreak = 0
        return { currentStreak: 0, longestStreak: 0 }
      }

      const today = new Date()
      const todayStr = format(today, "yyyy-MM-dd")

      const latestCompletedStr = [...completedSet]
        .filter((d) => d <= todayStr)
        .sort()
        .at(-1)

      let longest = 0
      let temp = 0

      for (let i = 0; i < 365 * 5; i++) {
        const date = subDays(today, i)
        if (date < createdAt) break

        const dayNum = getDay(date)
        if (!scheduledDayNumbers.includes(dayNum)) continue

        const ds = format(date, "yyyy-MM-dd")
        const completed = completedSet.has(ds)

        if (completed) {
          temp += 1
          if (temp > longest) longest = temp
        } else {
          temp = 0
        }
      }

      let current = 0

      if (latestCompletedStr) {
        let cursor = parseISO(latestCompletedStr)

        while (cursor >= createdAt) {
          const dayNum = getDay(cursor)
          if (!scheduledDayNumbers.includes(dayNum)) {
            cursor = subDays(cursor, 1)
            continue
          }

          const ds = format(cursor, "yyyy-MM-dd")
          const completed = completedSet.has(ds)

          if (!completed) break

          current += 1
          cursor = subDays(cursor, 1)
        }
      }

      habit.longestStreak = longest

      return { currentStreak: current, longestStreak: habit.longestStreak }
    },
  }))

  // MUTATION ACTIONS ------------------------------------------
  .actions((self) => ({
    addHabit(habitData: HabitData) {
      const newHabit = HabitModel.create({
        // id: String(Date.now()),
        // id: uuidv4(),
        id: String(Date.now()),
        name: habitData.name,
        emoji: habitData.emoji,
        time: habitData.time,
        date: habitData.date,
        createdAt: habitData.date,
        finished: false,
        category: habitData.category,
        current: 0,
        target: habitData.target,
        unit: habitData.unit,
        color: habitData.color,
        frequency: habitData.frequency,
        reminder: habitData.reminder,
      })

      self.habits.push(newHabit)
      scheduleHabitReminder(newHabit)
      syncHabitToSupabase(newHabit)

      return newHabit
    },

    hydrateFromSupabase(habits: any[], logs: any[]) {
      self.activityLog.clear()
      const normalizedHabits = habits.map((h) => ({
        id: h.id,
        name: h.name,
        emoji: h.emoji,
        time: h.time,
        date: h.date,
        createdAt: h.created_at ?? h.date,   // ⭐ FIX
        finished: h.finished ?? false,
        category: h.category,
        current: h.current ?? 0,
        target: h.target,
        unit: h.unit,
        color: h.color,
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
      

      self.habits.replace(normalizedHabits.map((h) => HabitModel.create(h)))

      const normalizedLogs = logs.map((l) => ({
        ...l,
        habitId: l.habit_id ?? l.habitId,
      }))

       // ⭐ FIX: replace logs so old MST nodes don’t linger
  self.activityLog.replace(
    normalizedLogs.map((l) => ActivityLogModel.create(l))
  )
    },

    reconcileHabitId(localId: string, supabaseId: string) {
      const habit = self.habits.find((h) => h.id === localId)
      if (habit) {
        habit.id = supabaseId
      }

      self.activityLog.forEach((log) => {
        if (log.habitId === localId) {
          log.habitId = supabaseId
        }
      })
    },

    // PROGRESS RECALCULATION --------------------------------------------------

    recalculateTodayProgressForHabit(habit) {
      const today = new Date().toISOString().split("T")[0] // e.g. "2025-08-29"
      const logEntry = self.activityLog.find(
        (log) => log.habitId === habit.id && log.date === today,
      )

      if (!logEntry) return // No progress logged today — nothing to recalculate

      const target = habit.target
      const count = logEntry.count

      logEntry.percentage = Math.min((count / target) * 100, 100)
    },

    // INCREMENT ---------------------------------------------------------------

    incrementHabit(id: string, dateStr: string) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      const habit = self.habits.find((h) => h.id === id)
      if (!habit) return
      if (habit.paused) return

      const today = dateStr
      let logEntry = self.activityLog.find((entry) => entry.habitId === id && entry.date === today)

      if (logEntry) {
        logEntry.count += 1
        habit.current = logEntry.count
      } else {
        self.activityLog.push({
          habitId: id,
          date: today,
          count: 1,
        })
        habit.current = 1
      }

      if (habit.current === habit.target) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }

      habitStore.recalculateTodayProgressForHabit(habit)
      habitStore.calculateHabitStreaks(habit)

      //  Supabase sync
      syncActivityToSupabase(id, dateStr, habit.current)
    },

    // DECREMENT ---------------------------------------------------------------

    decrementHabit(id: string, dateStr: string) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      const habit = self.habits.find((h) => h.id === id)
      if (!habit) return
      if (habit.paused) return

      const today = dateStr
      let logEntry = self.activityLog.find((entry) => entry.habitId === id && entry.date === today)

      if (logEntry && logEntry.count > 0) {
        logEntry.count -= 1
        habit.current = logEntry.count

        if (logEntry.count === 0) {
          const idx = self.activityLog.findIndex((e) => e === logEntry)
          if (idx !== -1) self.activityLog.splice(idx, 1)
        }
      } else {
        habit.current = Math.max((habit.current || 0) - 1, 0)
      }

      habitStore.recalculateTodayProgressForHabit(habit)
      habitStore.calculateHabitStreaks(habit)

      // Supabase sync
      syncActivityToSupabase(id, dateStr, habit.current)
    },

    // PAUSE / UNPAUSE ---------------------------------------------------------

    togglePauseHabit(habitId: string) {
      const habit = self.habits.find((h) => h.id === habitId)
      if (habit) {
        habit.paused = !habit.paused

        if (habit.paused) {
          cancelHabitReminder(habit)
        } else {
          scheduleHabitReminder(habit)
        }
      }
    },

    // STREAK CALCULATION (SIMPLE) --------------------------------------------

    calculateHabitStreak(habit: Habit) {
      const today = new Date()
      let streak = 0

      for (let i = 0; i < 365; i++) {
        const date = subDays(today, i)
        const formattedDate = format(date, "yyyy-MM-dd")
        const dayOfWeek = format(date, "EEEE")

        if (!habit.frequency.includes(dayOfWeek)) {
          continue
        }

        if (habit.paused || habit.deleted) continue
        const logEntry = self.activityLog.find(
          (entry) => entry.habitId === habit.id && entry.date === formattedDate,
        )

        if (logEntry && logEntry.count >= habit.target) {
          streak += 1
        } else {
          break
        }
      }

      return streak
    },

    // LOAD SNAPSHOT -----------------------------------------------------------

    async load() {
      try {
        const snapshotStr = await AsyncStorage.getItem(STORAGE_KEY)
        if (snapshotStr) {
          const snapshot = JSON.parse(snapshotStr)
          applySnapshot(self, snapshot)
        } else {
        }
      } catch (error) {}
    },

    // REMOVE HABIT ------------------------------------------------------------

    removeHabit(id: string) {
      const habit = self.habits.find((h) => h.id === id)
      if (habit) {
        cancelHabitReminder(habit)
        habit.deleted = true
      }
    },

    // UPDATE HABIT ------------------------------------------------------------

    updateHabit(id, updates) {
      const habit = self.habits.find((h) => h.id === id)
      if (habit) {
        console.log("✏️ Updating habit:", habit.name, "Updates:", updates)
    
        cancelHabitReminder(habit)
    
        Object.entries(updates).forEach(([key, value]) => {
          habit[key] = value
        })
    
        console.log("🔄 Rescheduling after update:", habit.name)
        scheduleHabitReminder(habit)
      }
    }
    
    

    // STREAK CALCULATION (FULL) ----------------------------------------------


  }))


// EXPORTS

export interface HabitStoreType extends Instance<typeof HabitStoreModel> {
  recalculateTodayProgressForHabit: (habit: any) => void
}

export const habitStore = HabitStoreModel.create({ habits: [], activityLog: [] }) as HabitStoreType

habitStore.load()

onSnapshot(habitStore, (snapshot) => {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    .then(() => {})
    .catch((error) => {})
})



