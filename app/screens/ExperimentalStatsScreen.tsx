// STATS SCREEN --------------------------------------------------

import { observer } from "mobx-react-lite"
import React, { FC, useMemo, useState } from "react"
import { View, ViewStyle, TouchableOpacity, TextStyle, Image, ImageStyle } from "react-native"
import { BarChart, barDataItem, PieChart, pieDataItem } from "react-native-gifted-charts"
import { Text, Screen } from "app/components"
import layout from "app/utils/layout"
import { colors, spacing } from "../theme"
import { StatisticsScreenProps } from "app/navigators/types"
import { habitStore } from "../models/habit-store"
import { eachDayOfInterval, subDays, format } from "date-fns"
import { parseISO } from "date-fns"
import { ScrollView } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback } from "react"
import CheckMarkBlue from "assets/images/CheckMarkBlue.png"
// import { $habitIconImage } from "app/screens/home"

// FUNCTIONS & HELPERS --------------------------------------------------

const DEFAULT_HABIT_ICON = "✔️"

// Label selection for charts
function getLabelForRange(date: Date, chartLength: number, index: number): string {
  if (chartLength === 1) {
    return format(date, "EEE")
  }
  if (chartLength <= 7) {
    return format(date, "EEE")
  }
  if (chartLength <= 31) {
    return format(date, "d")
  }
  return format(date, "d")
}

// Build daily % completion dataset (overview chart)
function buildOverviewChartData(habitStore, chartLength: number) {
  const today = new Date()
  const days = Array.from({ length: chartLength }).map((_, idx) => {
    const date = subDays(today, chartLength - 1 - idx)
    return {
      date,
      formatted: format(date, "yyyy-MM-dd"),
      label: format(date, "d"),
    }
  })

  return days.map((day) => {
    const scheduled = habitStore.habits.filter((h: any) => {
      if (h.paused) return false

      const createdStr = h.createdAt.includes("T") ? h.createdAt.split("T")[0] : h.createdAt
      const dayOfWeek = format(day.date, "EEEE")

      return createdStr <= day.formatted && (h.frequency ?? []).includes(dayOfWeek)
    })

    const completed = scheduled.filter((h) =>
      habitStore.activityLog.some(
        (log) => log.habitId === h.id && log.date === day.formatted && log.count >= h.target,
      ),
    )

    const percent =
      scheduled.length > 0 ? Math.round((completed.length / scheduled.length) * 100) : 0

    return {
      value: percent,
      label: day.label,
      frontColor: "#304FFE",
    }
  })
}

// Debug logger for scheduled/completed habits
function debugHabitsForRange(chartLength: number, weeklyCompletionData) {
  const today = new Date()
  const days = Array.from({ length: chartLength }).map((_, idx) => {
    const date = subDays(today, chartLength - 1 - idx)
    return {
      date,
      formatted: format(date, "yyyy-MM-dd"),
      dayOfWeek: format(date, "EEEE"),
    }
  })

  habitStore.habits
    .filter((habit) => !habit.paused)
    .forEach((habit) => {
      const scheduledDays = days.filter((day) => {
        const freq = habit.frequency ?? []
        const createdStr = format(new Date(habit.createdAt), "yyyy-MM-dd")
        return freq.includes(day.dayOfWeek) && createdStr <= day.formatted
      })

      let complete = 0
      let partial = 0
      let missed = 0
      let totalLogged = 0

      scheduledDays.forEach((day) => {
        const logEntry = habitStore.activityLog.find(
          (entry) => entry.habitId === habit.id && entry.date === day.formatted,
        )

        if (logEntry) {
          totalLogged += logEntry.count
          if (logEntry.count >= habit.target) complete++
          else if (logEntry.count > 0) partial++
          else missed++
        } else {
          missed++
        }
      })

      const completionPercent = scheduledDays.length
        ? Math.round((complete / scheduledDays.length) * 100)
        : 0

      const expectedTotal = scheduledDays.length * habit.target
      const avgProgress = expectedTotal > 0 ? Math.min((totalLogged / expectedTotal) * 100, 100) : 0
      const uiHabit = weeklyCompletionData.find((d) => d.habitName === habit.name)
      const uiAvg = uiHabit?.avgProgress ?? null
      const diff = uiAvg !== null ? uiAvg - Math.round(avgProgress) : null
    })
}

// Date helpers
function getPastDates(chartLength: number): string[] {
  const dates: string[] = []
  const today = new Date()

  for (let i = chartLength - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    dates.push(date.toISOString().slice(0, 10)) // YYYY-MM-DD
  }

  return dates
}

function getDailyCounts(dates: string[], completions: { date: string }[]) {
  const counts: { dateStr: string; count: number }[] = []

  for (const dateStr of dates) {
    const count = completions.filter((c) => c.date === dateStr).length
    counts.push({ dateStr, count })
  }

  return counts
}

// Color helper
function lightenColor(color: string, amount: number = 30): string {
  try {
    if (color.startsWith("hsl")) {
      const match = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/.exec(color)
      if (!match) return color
      const h = parseInt(match[1], 10)
      const s = parseFloat(match[2])
      const l = Math.min(100, parseFloat(match[3]) + amount)
      return `hsl(${h}, ${s}%, ${l}%)`
    }

    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)

    const rNorm = r / 255
    const gNorm = g / 255
    const bNorm = b / 255
    const max = Math.max(rNorm, gNorm, bNorm)
    const min = Math.min(rNorm, gNorm, bNorm)
    const l = (max + min) / 2

    let h = 0,
      s = 0
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)
          break
        case gNorm:
          h = (bNorm - rNorm) / d + 2
          break
        case bNorm:
          h = (rNorm - gNorm) / d + 4
          break
      }
      h *= 60
    }

    const newL = Math.min(100, l * 100 + amount)
    return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(newL)}%)`
  } catch {
    return color // fallback
  }
}

// Scheduling helper
function isScheduledForDate(habit, date) {
  const dayOfWeek = format(date, "EEEE")
  const createdStr = habit.createdAt.includes("T") ? habit.createdAt.split("T")[0] : habit.createdAt
  const dateStr = format(date, "yyyy-MM-dd")

  return habit.frequency.includes(dayOfWeek) && createdStr <= dateStr
}

// TYPES --------------------------------------------------------------

type FilterKey = "D" | "W" | "M" | "3M" | "6M" | "Y"

// SCREEN -------------------------------------------------------------

export const ExperimentalStatsScreen: FC<StatisticsScreenProps> = observer(
  function StatisticsScreen() {
    // STATE ----------------------------------------------------------
    const [refreshKey, setRefreshKey] = useState(0) // to reload the screen when navigated to
    const [filter, setFilter] = React.useState<FilterKey>("W")

    // EFFECTS --------------------------------------------------------

    // Refresh when navigating back
    useFocusEffect(
      useCallback(() => {
        setRefreshKey((prev) => prev + 1)
      }, []),
    )

    // Debug logger for current range
    useFocusEffect(
      useCallback(() => {
        debugHabitsForRange(filterDaysMap[filter], weeklyCompletionData)
      }, [filter, weeklyCompletionData]),
    )

    // FILTERS --------------------------------------------------------

    const filters = [
      { title: "Day", abbr: "D", id: 1 },
      { title: "Week", abbr: "W", id: 2 },
      { title: "Month", abbr: "M", id: 3 },
      { title: "Three Months", abbr: "3M", id: 4 },
      { title: "Six Months", abbr: "6M", id: 5 },
      { title: "Year", abbr: "Y", id: 6 },
    ]

    const filterDaysMap: Record<FilterKey, number> = {
      D: 1,
      W: 7,
      M: 30,
      "3M": 90,
      "6M": 180,
      Y: 365,
    }

    const chartLength = filterDaysMap[filter] ?? 7

    // OVERVIEW CHART DATA -------------------------------------------

    const overviewChartData = useMemo(
      () => buildOverviewChartData(habitStore, chartLength),
      [habitStore, chartLength],
    )

    React.useEffect(() => {
      const habits = habitStore.getHabitsWithStatuses(chartLength)
    }, [filter])

    const habits = habitStore.getHabitsWithStatuses(chartLength)
    const completions = habitStore.activityLog
    const dates = getPastDates(chartLength)
    const dailyCounts = getDailyCounts(dates, completions)
    const chartData = formatChartData(dailyCounts)

    // MASTER MATRIX --------------------------------------------------

    const habitMatrix = useMemo(() => {
      const matrix = []

      for (const dateStr of dates) {
        const date = parseISO(dateStr)
        const dayOfWeek = format(date, "EEEE")

        const daySummary = {
          date: dateStr,
          habits: [],
          complete: 0,
          partial: 0,
          missed: 0,
        }

        const scheduledHabits = habitStore.habits.filter((habit) => {
          if (habit.paused || habit.deleted) return false
          if (!habit.frequency.includes(dayOfWeek)) return false

          const createdStr = habit.createdAt.includes("T")
            ? habit.createdAt.split("T")[0]
            : habit.createdAt

          return createdStr <= dateStr
        })

        for (const habit of scheduledHabits) {
          const logEntry = habitStore.activityLog.find(
            (entry) => entry.habitId === habit.id && entry.date === dateStr,
          )

          let status = "missed"
          if (logEntry) {
            if (logEntry.count >= habit.target) status = "complete"
            else if (logEntry.count > 0) status = "partial"
          }

          daySummary.habits.push({
            habitId: habit.id,
            name: habit.name,
            status,
            count: logEntry?.count || 0,
            target: habit.target,
          })

          daySummary[status] += 1
        }

        matrix.push(daySummary)
      }

      return matrix
    }, [refreshKey, habitStore.habits, habitStore.activityLog, chartLength])

    // STREAK CALCULATION --------------------------------------------


    // WEEKLY COMPLETION ----------------------------------------------

    const weeklyCompletionData = useMemo(() => {
      if (!habitStore.habits.length || !habitStore.activityLog.length) return []

      const today = new Date()
      const startDate = subDays(today, chartLength - 1)
      const dateRange = eachDayOfInterval({ start: startDate, end: today })

      const activityMap = new Map<string, number>()
      for (const log of habitStore.activityLog) {
        const logDate = format(parseISO(log.date), "yyyy-MM-dd")
        if (dateRange.some((d) => format(d, "yyyy-MM-dd") === logDate)) {
          const current = activityMap.get(log.habitId) || 0
          activityMap.set(log.habitId, current + log.count)
        }
      }

      const activeHabits = habitStore.habits
        .filter((h) => !h.paused && !h.deleted)
        .filter((habit) => {
          const createdStr = habit.createdAt.includes("T")
            ? habit.createdAt.split("T")[0]
            : habit.createdAt

          return dateRange.some((date) => {
            const dateStr = format(date, "yyyy-MM-dd")
            const dayOfWeek = format(date, "EEEE").toLowerCase()
            const normalizedFrequency = habit.frequency?.map((d) => d.toLowerCase()) || []

            return normalizedFrequency.includes(dayOfWeek) && createdStr <= dateStr
          })
        })

      return activeHabits.map((habit) => {
        let scheduledDays = 0

        for (const date of dateRange) {
          const dateStr = format(date, "yyyy-MM-dd")
          const dayOfWeek = format(date, "EEEE").toLowerCase()
          const normalizedFrequency = habit.frequency?.map((d) => d.toLowerCase()) || []

          const createdStr = habit.createdAt.includes("T")
            ? habit.createdAt.split("T")[0]
            : habit.createdAt

          if (normalizedFrequency.includes(dayOfWeek) && createdStr <= dateStr) {
            scheduledDays += 1
          }
        }

        const totalCount = activityMap.get(habit.id) || 0
        const expectedTotal = scheduledDays * habit.target
        const avgProgress =
          expectedTotal > 0 ? Math.min((totalCount / expectedTotal) * 100, 100) : 0

        return {
          habitName: habit.name,
          emoji: habit.emoji || "🔥",
          avgProgress: Math.round(avgProgress),
        }
      })
    }, [
      refreshKey,
      chartLength,
      habitStore.habits.map((h) => h.id + h.target + h.frequency.join("")).join(","),
      habitStore.activityLog.length,
    ])

    // DAILY EFFORT --------------------------------------------------

    const dailyEffortData = useMemo(() => {
      return Array.from({ length: chartLength }).map((_, idx) => {
        const date = subDays(new Date(), chartLength - 1 - idx)
        const formattedDate = format(date, "yyyy-MM-dd")
        const dayOfWeek = format(date, "EEEE")
        const label = getLabelForRange(date, chartLength, idx)

        const scheduledHabits = habitStore.habits.filter(
          (habit) =>
            habit.frequency.includes(dayOfWeek) &&
            !habit.paused &&
            format(new Date(habit.createdAt), "yyyy-MM-dd") <= formattedDate,
        )

        let totalTarget = 0
        let totalLogged = 0

        for (const habit of scheduledHabits) {
          totalTarget += habit.target

          const logEntry = habitStore.activityLog.find(
            (entry) => entry.habitId === habit.id && entry.date === formattedDate,
          )

          if (logEntry) {
            totalLogged += logEntry.count
          }
        }

        const percentage = totalTarget > 0 ? Math.round((totalLogged / totalTarget) * 100) : 0

        return { value: percentage, frontColor: "#304FFE" }
      })
    }, [refreshKey, chartLength, habitStore.habits, habitStore.activityLog])

    // WEEKLY HABIT BREAKDOWN ----------------------------------------

    const habitWeeklyBreakdown = useMemo(() => {
      const today = new Date()
      const days = Array.from({ length: chartLength }).map((_, idx) =>
        subDays(today, chartLength - 1 - idx),
      )

      const breakdown: Record<string, { completed: number; partial: number; missed: number }> = {}

      habitStore.habits
        .filter((habit) => !habit.paused && !habit.deleted)
        .forEach((habit) => {
          let completed = 0
          let partial = 0
          let missed = 0

          days.forEach((date) => {
            const formattedDate = format(date, "yyyy-MM-dd")
            const dayOfWeek = format(date, "EEEE")

            const normalizedFrequency = habit.frequency?.map((d) => d.toLowerCase()) || []
            const normalizedDay = dayOfWeek.toLowerCase()

            if (!normalizedFrequency.includes(normalizedDay)) return
            if (!isScheduledForDate(habit, date)) return

            const logEntry = habitStore.activityLog.find(
              (entry) => entry.habitId === habit.id && entry.date === formattedDate,
            )

            if (logEntry) {
              if (logEntry.count >= habit.target) {
                completed += 1
              } else if (logEntry.count > 0) {
                partial += 1
              } else {
                missed += 1
              }
            } else {
              missed += 1
            }
          })

          breakdown[habit.id] = { completed, partial, missed }
        })

      return breakdown
    }, [refreshKey, habitStore.habits, habitStore.activityLog])

    // COMPLETION SUMMARY --------------------------------------------

    const completionSummary = useMemo(() => {
      let complete = 0
      let partial = 0
      let missed = 0

      const today = new Date()
      const days = Array.from({ length: chartLength }).map((_, i) =>
        subDays(today, chartLength - 1 - i),
      )

      days.forEach((date) => {
        const formattedDate = format(date, "yyyy-MM-dd")
        const dayOfWeek = format(date, "EEEE")
        const scheduledHabits = habitStore.habits.filter((h) => {
          if (h.paused || h.deleted) return false
          if (!h.frequency.includes(dayOfWeek)) return false

          const createdStr = h.createdAt.includes("T") ? h.createdAt.split("T")[0] : h.createdAt

          return createdStr <= formattedDate
        })

        if (scheduledHabits.length === 0) {
          return
        }

        let completedCount = 0
        let partialCount = 0

        scheduledHabits.forEach((habit) => {
          const entry = habitStore.activityLog.find(
            (log) => log.habitId === habit.id && log.date === formattedDate,
          )

          if (!entry) return

          if (entry.count >= habit.target) {
            completedCount++
          } else if (entry.count > 0) {
            partialCount++
          }
        })

        const total = scheduledHabits.length

        if (completedCount === total) {
          complete++
        } else if (completedCount > 0 || partialCount > 0) {
          partial++
        } else {
          missed++
        }
      })

      return { complete, partial, missed }
    }, [refreshKey, chartLength, habitStore.habits, habitStore.activityLog])

    // HABIT WEEKLY STATUS -------------------------------------------

    const habitWeeklyStatus = useMemo(() => {
      const today = new Date()
      const days = Array.from({ length: chartLength }).map((_, idx) => {
        const date = subDays(today, chartLength - 1 - idx) // oldest to newest
        return {
          date,
          formatted: format(date, "yyyy-MM-dd"),
          dayOfWeek: format(date, "EEEE"),
        }
      })

      return habitStore.habits
        .filter((habit) => {
          if (habit.paused || habit.deleted) return false
          return days.some((day) => {
            const normalizedFrequency = habit.frequency?.map((d) => d.toLowerCase()) || []
            const createdStr = habit.createdAt.includes("T")
              ? habit.createdAt.split("T")[0]
              : habit.createdAt

            return (
              normalizedFrequency.includes(day.dayOfWeek.toLowerCase()) &&
              createdStr <= day.formatted
            )
          })
        })
        .map((habit) => {
          const dayStatuses = days.map((day) => {
            const isScheduled = habit.frequency.includes(day.dayOfWeek)
            const createdStr = habit.createdAt.includes("T")
              ? habit.createdAt.split("T")[0]
              : habit.createdAt

            const isBeforeCreation = createdStr > day.formatted

            if (!isScheduled || isBeforeCreation) {
              return "grey"
            }

            const logEntry = habitStore.activityLog.find(
              (entry) => entry.habitId === habit.id && entry.date === day.formatted,
            )

            if (logEntry) {
              if (logEntry.count >= habit.target) {
                return "green"
              }
              if (logEntry.count > 0) {
                return "yellow"
              }
              return "red"
            }
            return "red"
          })

          const completedCount = dayStatuses.filter((s) => s === "green").length
          const partialCount = dayStatuses.filter((s) => s === "yellow").length
          const missedCount = dayStatuses.filter((s) => s === "red").length
          const unscheduledCount = dayStatuses.filter((s) => s === "grey").length

          return {
            habitName: habit.name,
            targetText: `${habit.target} ${habit.unit} per day`,
            dayStatuses,
            completedCount,
            partialCount,
            missedCount,
            unscheduledCount,
          }
        })
    }, [refreshKey, habitStore.habits, habitStore.activityLog, chartLength])

    // HABIT STREAKS --------------------------------------------------

    const habitStreaks = useMemo(() => {
      const streaks: Record<string, number> = {}

      habitStore.habits
        .filter((habit) => !habit.paused && !habit.deleted)
        .forEach((habit) => {
          // Call your store's helper function instead of inline logic
          streaks[habit.id] = habitStore.calculateHabitStreak(habit)
        })

      return streaks
    }, [refreshKey, habitStore.habits, habitStore.activityLog])

    // WEEKLY TOTALS --------------------------------------------------

    const habitWeeklyTotals = useMemo(() => {
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday start

      const weekDatesSet = new Set(
        eachDayOfInterval({ start: startOfWeek, end: today }).map((date) =>
          format(date, "yyyy-MM-dd"),
        ),
      )

      const totals: Record<string, number> = {}

      habitStore.habits
        .filter((habit) => !habit.paused && !habit.deleted)
        .forEach((habit) => {
          const totalCount = habitStore.activityLog
            .filter((log) => log.habitId === habit.id && weekDatesSet.has(log.date))
            .reduce((acc, log) => acc + log.count, 0)

          totals[habit.id] = totalCount
        })

      return totals
    }, [refreshKey, habitStore.habits, habitStore.activityLog])

    // AGGREGATE TOTALS ----------------------------------------------

    const filteredHabits = habitStore.habits.filter((habit) => !habit.paused)
    const totalCompleted = filteredHabits.reduce((acc, habit) => acc + habit.current, 0)
    const totalTarget = filteredHabits.reduce((acc, habit) => acc + habit.target, 0)
    const percentage = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0

    // BAR + PIE DATA -------------------------------------------------

    const data: barDataItem[] = filteredHabits.map((habit) => ({
      value: habit.current,
      label: habit.name,
      frontColor: colors.palette.primary600,
      gradientColor: colors.palette.primary100,
    }))

    const pieData: pieDataItem[] = [
      { value: 80, color: colors.palette.secondary500, focused: true },
      { value: 20, color: colors.palette.accent500 },
    ]

    const renderDot = (color: string) => <View style={[$dotStyle, { backgroundColor: color }]} />

    const renderLegendComponent = () => (
      <View style={$legendContainer}>
        <View style={$legend}>
          {renderDot(colors.palette.secondary500)}
          <Text>Excellent: 80%</Text>
        </View>
        <View style={$legend}>
          {renderDot(colors.palette.accent500)}
          <Text>Okay: 20%</Text>
        </View>
      </View>
    )

    // DAILY PERCENTAGE DATA -----------------------------------------

    const dailyPercentageData = Array.from({ length: chartLength }).map((_, idx) => {
      const date = subDays(new Date(), chartLength - 1 - idx)
      const formattedDate = format(date, "yyyy-MM-dd")
      const dayOfWeek = format(date, "EEEE")
      const label = getLabelForRange(date, chartLength, idx)

      const normalizedDay = dayOfWeek.toLowerCase()
      const scheduledHabits = habitStore.habits.filter((habit) => {
        const normalizedFrequency = habit.frequency?.map((d) => d.toLowerCase()) || []

        const createdStr = habit.createdAt.includes("T")
          ? habit.createdAt.split("T")[0]
          : habit.createdAt

        return (
          normalizedFrequency.includes(normalizedDay) &&
          !habit.paused &&
          !habit.deleted &&
          createdStr <= formattedDate
        )
      })

      const totalScheduled = scheduledHabits.length

      const completedCount = scheduledHabits.reduce((sum, habit) => {
        const logEntry = habitStore.activityLog.find(
          (entry) => entry.habitId === habit.id && entry.date === formattedDate,
        )
        if (logEntry && logEntry.count >= habit.target) {
          return sum + 1
        }
        return sum
      }, 0)

      const percentage =
        totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0

      return {
        value: percentage,
        totalScheduled,
        completedCount,
        frontColor: "#304FFE",
      }
    })

    // HYBRID X-AXIS LABELS ------------------------------------------
    const xLabels = Array.from({ length: chartLength }).map((_, idx) => {
      const date = subDays(new Date(), chartLength - 1 - idx)
      return getLabelForRange(date, chartLength, idx)
    })

    // RANGE COMPLETION ----------------------------------------------

    const percentageChartData = dailyPercentageData

    const totals = percentageChartData.slice(-chartLength).reduce(
      (acc, day) => {
        acc.scheduled += day.totalScheduled
        acc.completed += day.completedCount
        return acc
      },
      { scheduled: 0, completed: 0 },
    )

    const rangeCompletion =
      totals.scheduled > 0 ? Math.round((totals.completed / totals.scheduled) * 100) : 0

    const todayPercentage = rangeCompletion

    // STREAK RECONCILIATION -----------------------------------------

    // CHART DATA FORMATTER ------------------------------------------

    function formatChartData(dailyCounts: { dateStr: string; count: number }[]) {
      return dailyCounts.map(({ dateStr, count }) => ({
        label: format(parseISO(dateStr), "MMM d"), // e.g. "Jul 23"
        value: count,
        frontColor: "#304FFE", // optional: customize bar color
      }))
    }

    // RENDER ---------------------------------------------------------

    return (
      <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
        {/* HEADER -------------------------------------------------- */}
        <View style={$topContainer}></View>

        {/* FILTERS ------------------------------------------------- */}
        <View style={$filtersContainer}>
          {filters.map((f, idx) => (
            <View key={`${f.id}-${f.abbr}`} style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                style={filter === f.abbr ? $activeFilter : {}}
                onPress={() => setFilter(f.abbr)}
              >
                <Text text={f.abbr} preset="bold" style={filter === f.abbr ? $activeText : {}} />
              </TouchableOpacity>
              {filters.length > idx + 1 && (
                <Text text="•" preset="bold" style={{ marginHorizontal: 4 }} />
              )}
            </View>
          ))}
        </View>

        {/* COMPLETION SUMMARY -------------------------------------- */}
        <View style={$sectionCard}>
          {/* Perfect */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: "#304FFE",
                marginBottom: 8,
              }}
            />
            <Text style={{ fontSize: 16, fontWeight: "500", color: "#444" }}>Complete</Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#000", marginTop: 4 }}>
              {completionSummary.complete} days
            </Text>
          </View>

          {/* Divider */}
          <View style={{ width: 1, backgroundColor: "#ccc" }} />

          {/* Partial */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: "#8C9EFF",
                marginBottom: 8,
              }}
            />
            <Text style={{ fontSize: 16, fontWeight: "500", color: "#444" }}>Partial</Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#000", marginTop: 4 }}>
              {completionSummary.partial} days
            </Text>
          </View>

          {/* Divider */}
          <View style={{ width: 1, backgroundColor: "#ccc" }} />

          {/* Missed */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: "#616161",
                marginBottom: 8,
              }}
            />
            <Text style={{ fontSize: 16, fontWeight: "500", color: "#444" }}>Missed</Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#000", marginTop: 4 }}>
              {completionSummary.missed} days
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "column",
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            backgroundColor: "#fff",
            paddingVertical: 16,
            paddingHorizontal: 16,
            marginTop: 0,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          {/* habits completed graph  */}

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#000", marginBottom: 8 }}>
              Habits Completed
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#304FFE" }}>
              {rangeCompletion}%
            </Text>
          </View>

          <View style={{ overflow: "hidden", width: "100%" }}>
            <BarChart
              data={percentageChartData}
              xAxisLabelTexts={xLabels}
              barWidth={20}
              spacing={10}
              width={layout.window.width * 0.9}
              height={180}
              maxValue={100}
              barBorderRadius={6}
              yAxisThickness={0}
              xAxisColor="#E0E0E0"
              xAxisType="solid"
              xAxisLabelTextStyle={{ color: "#666", fontSize: 12 }}
              yAxisTextStyle={{ color: "#999", fontSize: 10 }}
              noOfSections={4}
              yAxisLabelTexts={["0%", "25%", "50%", "75%", "100%"]}
              showLine={false}
            />
          </View>
        </View>

        {/* Styles for Activty completion chart */}

        <View
          style={{
            flexDirection: "column",
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            backgroundColor: "#fff",
            paddingVertical: 16,

            marginTop: 0,
            elevation: 2, // Android
            shadowColor: "#000", // iOS
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          {/* Activity Completion Chart */}

          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#000",
              marginBottom: 8,
              paddingLeft: 16,
            }}
          >
            Tasks Completed
          </Text>

          {weeklyCompletionData.map((habit, idx) => (
            <View
              key={`${habit.habitName}-${idx}`}
              style={{ marginVertical: 12, paddingHorizontal: 16 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* FIXED-WIDTH ICON WRAPPER */}
                <View
                  style={{
                    width: 28,
                    height: 28,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 8,
                  }}
                >
                  {habit.emoji === DEFAULT_HABIT_ICON ? (
                    <Image source={CheckMarkBlue} style={$habitIconImageStats} />
                  ) : (
                    <Text text={habit.emoji} style={{ fontSize: 18 }} />
                  )}
                </View>

                <Text text={habit.habitName} style={{ flex: 1, fontSize: 16, color: "#444" }} />
                <Text text={`${habit.avgProgress}%`} style={{ fontWeight: "600", color: "#000" }} />
              </View>

              <View
                style={{
                  height: 8,
                  backgroundColor: "#ddd",
                  borderRadius: 4,
                  overflow: "hidden",
                  marginTop: 4,
                }}
              >
                <View
                  style={{
                    width: `${habit.avgProgress}%`,
                    backgroundColor: "#304FFE",
                    height: "100%",
                  }}
                />
              </View>
            </View>
          ))}
        </View>

        {/* HABIT CARDS -------------------------------------------------- */}

        {habitWeeklyStatus.map((habit, idx) => {
          const habitFromStore = habitStore.habits.find((h) => h.name === habit.habitName)
          const habitId = habitFromStore?.id ?? ""
          const habitColor = habitFromStore?.color ?? "#304FFE"

          const { currentStreak, longestStreak } = habitStore.calculateHabitStreaks(habitFromStore)

          return (
            <View
              key={`${habit.habitName}-${idx}`}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                backgroundColor: "#fff",
                paddingVertical: 16,
                marginTop: 0,
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 2 }}>
                {habit.habitName}
              </Text>
              <Text style={{ color: "#666", marginBottom: 6 }}>{habit.targetText}</Text>

              <View style={{ height: 1, backgroundColor: "#E0E0E0", marginVertical: 8 }} />

              <View style={{ maxHeight: 200 }}>
                <ScrollView>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 6,
                      justifyContent: "flex-start",
                    }}
                  >
                    {habit.dayStatuses.map((status, dayIdx) => {
                      return (
                        <View
                          key={dayIdx}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 4,

                            backgroundColor:
                              status === "green"
                                ? habitColor
                                : status === "yellow"
                                ? lightenColor(habitColor, 30)
                                : status === "red"
                                ? "#616161"
                                : status === "grey"
                                ? "#BDBDBD"
                                : "#FFFFFF",
                          }}
                        />
                      )
                    })}
                  </View>
                </ScrollView>
              </View>

              <View style={{ height: 1, backgroundColor: "#E0E0E0", marginVertical: 8 }} />

              <Text style={{ color: "#444" }}>🔥 Current Streak: {currentStreak} days</Text>

              <View style={{ height: 1, backgroundColor: "#E0E0E0", marginVertical: 8 }} />

              <Text style={{ color: "#444", marginTop: 2 }}>
                🏆 Longest Streak: {longestStreak} days
              </Text>

              <View style={{ height: 1, backgroundColor: "#E0E0E0", marginVertical: 8 }} />
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    backgroundColor: habitColor,
                    marginRight: 8,
                  }}
                />

                {/* Completed */}
                <Text>Completed: {habit.completedCount} days</Text>
              </View>

              <View style={{ height: 1, backgroundColor: "#E0E0E0", marginVertical: 8 }} />
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    backgroundColor: lightenColor(habitColor, 30),
                    marginRight: 8,
                  }}
                />
                {/* Partial */}
                <Text>Partial: {habit.partialCount} days</Text>
              </View>

              <View style={{ height: 1, backgroundColor: "#E0E0E0", marginVertical: 8 }} />
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    backgroundColor: `#616161`,
                    marginRight: 8,
                  }}
                />
                {/* Missed */}
                <Text>Missed: {habit.missedCount} days</Text>
              </View>

              <View style={{ height: 1, backgroundColor: "#E0E0E0", marginVertical: 8 }} />
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    backgroundColor: "#BDBDBD", // light grey for unscheduled
                    marginRight: 8,
                  }}
                />

                {/* Unscheduled */}
                <Text>Unscheduled: {habit.unscheduledCount ?? 0} days</Text>
              </View>
            </View>
          )
        })}
      </Screen>
    )
  },
)

// STYLES

const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  gap: spacing.xl,
  paddingBottom: 70,
}

const $topContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $filtersContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#ccc",
  elevation: 2, // Android
  shadowColor: "#000", // iOS
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
}

const $activeFilter: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  borderRadius: 99,
  width: 36,
  height: 36,
  justifyContent: "center",
  alignItems: "center",
}

const $activeText: TextStyle = {
  color: colors.palette.neutral100,
  textAlign: "center",
}

const $dotStyle: ViewStyle = {
  height: 10,
  width: 10,
  borderRadius: 5,
  marginRight: 10,
}

const $legendContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  marginBottom: 10,
}

const $legend: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  width: "50%",
}

const $section: ViewStyle = {}

const $sectionCard: ViewStyle = {
  ...$section,
  flexDirection: "row",
  flex: 1,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  backgroundColor: "#fff",
  paddingVertical: 16,
  elevation: 2,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
}

const $habitIconImageStats: ImageStyle = {
  width: 44,
  height: 44,
  resizeMode: "contain",
}
