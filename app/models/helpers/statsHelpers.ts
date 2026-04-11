import { HabitModel } from "../HabitModel"
import { ActivityLogModel } from "../ActivityLogModel"
import { Instance } from "mobx-state-tree"

type HabitModelType = Instance<typeof HabitModel>
type ActivityLogModelType = Instance<typeof ActivityLogModel>

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  addDays,
  subDays,
} from "date-fns"

/**
 * Returns an array of daily summaries of total completed activities and targets
 * @param habits Array of habit objects
 * @param activityLog Array of activity log entries
 * @param period "D" | "W" | "M" | "30" | "90" for day, week, month, 30 days, 90 days
 */
export function getSummaryByPeriod(
  habits: HabitModelType[],
  activityLog: ActivityLogModelType[],
  period: string = "W",
) {
  const summaries: { date: string; completed: number; target: number }[] = []

  const today = new Date()

  let startDate: Date
  let endDate: Date

  switch (period) {
    case "D":
      startDate = startOfDay(today)
      endDate = endOfDay(today)
      break
    case "W":
      startDate = startOfWeek(today, { weekStartsOn: 1 }) // Monday start
      endDate = endOfWeek(today, { weekStartsOn: 1 })
      break
    case "M":
      startDate = startOfMonth(today)
      endDate = endOfMonth(today)
      break
    case "30":
      startDate = subDays(today, 29)
      endDate = today
      break
    case "90":
      startDate = subDays(today, 89)
      endDate = today
      break
    default:
      startDate = startOfWeek(today, { weekStartsOn: 1 })
      endDate = endOfWeek(today, { weekStartsOn: 1 })
  }

  for (
    let current = startDate;
    current <= endDate;
    current = addDays(current, 1)
  ) {
    const dateStr = format(current, "yyyy-MM-dd")
    const dayOfWeek = format(current, "EEEE") // e.g. "Monday", "Tuesday", etc.

    const totalTarget = habits.reduce((acc, habit) => {
      if (habit.frequency.includes(dayOfWeek)) {
        return acc + habit.target
      }
      return acc
    }, 0)

    const totalCompleted = activityLog
      .filter((entry) => entry.date?.slice(0, 10) === dateStr)
      .reduce((acc, entry) => acc + entry.count, 0)

    summaries.push({
      date: dateStr,
      completed: totalCompleted,
      target: totalTarget,
    })
  }

  return summaries
}

