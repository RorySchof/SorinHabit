// SANDBOX?


// app/screens/statistics.tsx
import React, { useState } from "react"
import { View, Text, StyleSheet, Dimensions, Button } from "react-native"
import { habitStore } from "app/models/habit-store"
import { subDays, format } from "date-fns"

export function StatisticsScreen() {
  const [chartLength, setChartLength] = useState(30)

  // Build daily percentage data like ExperimentalStatsScreen
  const percentageChartData = Array.from({ length: chartLength }).map((_, idx) => {
    const date = subDays(new Date(), chartLength - 1 - idx)
    const formattedDate = format(date, "yyyy-MM-dd")
    const dayOfWeek = format(date, "EEEE")
    const label = format(date, "EEE") // e.g. Mon, Tue

    // Habits scheduled for this day
    const scheduledHabits = habitStore.habits.filter(
      (habit) =>
        habit.frequency.includes(dayOfWeek) &&
        !habit.paused &&
        format(new Date(habit.createdAt), "yyyy-MM-dd") <= formattedDate,
    )

    const totalScheduled = scheduledHabits.length

    // Count how many of those scheduled habits were completed
    const completedCount = scheduledHabits.reduce((sum, habit) => {
      const logEntry = habitStore.activityLog.find(
        (entry) => entry.habitId === habit.id && entry.date === formattedDate,
      )
      if (logEntry && logEntry.count >= habit.target) {
        return sum + 1
      }
      return sum
    }, 0)

    const pct = totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0

   

    return { label, value: pct }
  })

  const screenWidth = Dimensions.get("window").width
  const yAxisWidth = 35
  const chartHeight = 150
  const barAreaWidth = screenWidth - yAxisWidth - 32
  const barWidth = barAreaWidth / percentageChartData.length

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sandbox Bar Chart</Text>
      <Text style={styles.subtitle}>Range: {chartLength} days</Text>

      {/* Toggle buttons */}
      <View style={styles.toggleRow}>
        {[7, 30, 60, 90].map((len) => (
          <Button key={len} title={`${len}`} onPress={() => setChartLength(len)} />
        ))}
      </View>



      {/* Card container */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Habits Completed</Text>

        <View style={[styles.chartWrapper, { height: chartHeight + 30 }]}>
          <View style={{ flexDirection: "row", flex: 1 }}>
            {/* Y-axis gutter */}
            <View style={[styles.yAxis, { width: yAxisWidth }]}>
              {[100, 75, 50, 25, 0].map((val, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.yAxisLabelContainer,
                    { bottom: (val / 100) * chartHeight },
                  ]}
                >
                  <Text style={styles.yAxisLabel}>{val}%</Text>
                </View>
              ))}
            </View>

            {/* Bars + labels */}
<View style={styles.barArea}>
  {/* Bars row */}
  <View style={styles.chartRow}>
    {percentageChartData.map((d, i) => {
      const cappedValue = Math.min(d.value, 100)
      const height = (cappedValue / 100) * chartHeight
      return (
        <View key={i} style={{ flex: 1, alignItems: "stretch" }}>
          <View
            style={{
              width: "100%",
              height,
              backgroundColor: "#304FFE",
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
            }}
          />
        </View>
      )
    })}
  </View>

  {/* Labels row */}
  <View style={styles.labelRow}>
    {percentageChartData.map((d, i) => (
      <Text
        key={i}
        style={{ flex: 1, fontSize: 7, textAlign: "center", color: "#333" }}
      >
        {d.label}
      </Text>
    ))}
  </View>
</View>




          </View>
        </View>
      </View>
    </View>
  )
}



const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { fontSize: 18, fontWeight: "700", color: "#000" },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 10 },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#444", marginBottom: 12 },
  chartWrapper: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    position: "relative",
  },
  yAxis: {
    position: "relative",
    justifyContent: "flex-end",
  },
  yAxisLabelContainer: {
    position: "absolute",
    left: 0,
  },
  yAxisLabel: {
    fontSize: 8,
    color: "#666",
  },
  barArea: {
    flex: 1,
    height: "100%",
    position: "relative",
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    width: "100%",
    height: "100%",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  barLabel: {
    fontSize: 7,
    color: "#333",
  },
})
