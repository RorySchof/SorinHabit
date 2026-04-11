// Fake habit screen

// import React, { useState } from "react"
// import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"

// import { View, Button, Text, SafeAreaView, ScrollView,TouchableOpacity } from "react-native"
// import { observer } from "mobx-react-lite"
// import { habitStore } from "app/models/habit-store"
// import { WeekCalendar, CalendarProvider } from "react-native-calendars"
// import {
//   startOfDay,
//   endOfDay,
//   startOfWeek,
//   endOfWeek,
//   startOfMonth,
//   endOfMonth,
//   format,
//   addDays,
//   subDays,
// } from "date-fns"

// import { useMemo } from "react"
// import { eachDayOfInterval } from "date-fns"

// import { AnimatedCircularProgress } from "react-native-circular-progress"

// import { colors, spacing } from "../theme"

// import { Alert } from "react-native"
// import { useRef, useCallback, useEffect } from "react"
// import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
// import { Icon } from "app/components"
// import layout from "app/utils/layout"
// import { $tabBarStyles } from "app/navigators/styles"
// import { navigate } from "app/navigators"
// import { days } from "app/screens/create-new-habit"





// // import { ErrorBototalCompletedundary } from "react-error-boundary"


// const $taskContainer = {
//   flexDirection: "row",
//   justifyContent: "space-between",
//   alignItems: "center",
//   paddingVertical: spacing.sm,
//   paddingHorizontal: spacing.md,
//   borderRadius: 12,
//   backgroundColor: "#fff",
//   elevation: 2,
// }

// const $taskLeftContainer = {
//   flexDirection: "row",
//   alignItems: "center",
//   gap: 12,
// }

// const $taskEmojiContainer = {
//   width: 34,
//   height: 34,
//   justifyContent: "center",
//   alignItems: "center",
//   borderRadius: 8,
//   backgroundColor: "#F5F5F5",
// }

// const $emojiText = {
//   fontSize: 20,
// }

// const $bottomSheetContainer = {
//   borderRadius: 24,
//   overflow: "hidden",
// }

// const $bottomSheet = {
//   paddingHorizontal: spacing.md,
// }

// const $bottomSheetIcons = {
//   flexDirection: "row",
//   justifyContent: "space-between",
//   marginBottom: spacing.sm,
// }

// const $daysContainer = {
//   flexDirection: "row",
//   justifyContent: "space-between",
//   marginVertical: spacing.md,
// }

// const $dayContainerStyle = {
//   paddingVertical: 6,
//   paddingHorizontal: 12,
//   borderRadius: 8,
//   backgroundColor: "#E3F2FD",
// }

// const $dayStyle = {
//   fontWeight: "600",
//   color: "#333",
// }

// const $frequencyContainer = {
//   flexDirection: "row",
//   alignItems: "center",
// }

// const $labelStyle = {
//   fontWeight: "bold",
//   marginBottom: spacing.xs,
// }

// const $labelRequired = {
//   color: "red",
//   marginLeft: 4,
// }

// const $reminder = {
//   flexDirection: "row",
//   justifyContent: "space-between",
//   alignItems: "center",
//   marginTop: spacing.sm,
//   paddingVertical: spacing.sm,
//   paddingHorizontal: spacing.md,
//   backgroundColor: "#F5F5F5",
//   borderRadius: 10,
// }


// export function getSummaryByPeriod(
//   habits: HabitModelType[],
//   activityLog: ActivityLogModelType[],
//   period: string = "W",
// ) {
//   // console.time("getSummary")
//   const summaries: { date: string; completed: number; target: number }[] = []
//   const today = new Date()

//   let startDate: Date
//   let endDate: Date

//   switch (period) {
//     case "D":
//       startDate = startOfDay(today)
//       endDate = endOfDay(today)
//       break
//     case "W":
//       startDate = startOfWeek(today, { weekStartsOn: 1 })
//       endDate = endOfWeek(today, { weekStartsOn: 1 })
//       break
//     case "M":
//       startDate = startOfMonth(today)
//       endDate = endOfMonth(today)
//       break
//     case "30":
//       startDate = subDays(today, 29)
//       endDate = today
//       break
//     case "90":
//       startDate = subDays(today, 89)
//       endDate = today
//       break
//     default:
//       startDate = startOfWeek(today, { weekStartsOn: 1 })
//       endDate = endOfWeek(today, { weekStartsOn: 1 })
//   }

//   for (let current = startDate; current <= endDate; current = addDays(current, 1)) {
//     const dateStr = format(current, "yyyy-MM-dd")
//     const dayOfWeek = format(current, "EEEE")

//     const totalTarget = habits.reduce((acc, habit) => {
//       if (habit.frequency.includes(dayOfWeek)) {
//         return acc + habit.target
//       }
//       return acc
//     }, 0)

//     const totalCompleted = activityLog
//       .filter((entry) => entry.date?.slice(0, 10) === dateStr)
//       .reduce((acc, entry) => acc + entry.count, 0)

//     summaries.push({
//       date: dateStr,
//       completed: totalCompleted,
//       target: totalTarget,
//     })
//   }

//   // console.timeEnd("getSummary")
//   return summaries
// }




// interface HabitType {
//   id: string
//   emoji: string
//   name: string
//   time: string
//   finished: boolean
//   current?: number
//   target?: number
//   paused?: boolean
// }

// interface HabitProps {
//   task: HabitType
//   navigation: any
// }

// export const Habit = observer(function Habit({ task, navigation }: HabitProps) {
//   const bottomSheetRef = useRef<BottomSheetModal>(null)
//   const [isSheetOpen, setIsSheetOpen] = useState(false)

//   const handleOpenSheet = useCallback(() => {
//     bottomSheetRef.current?.present()
//     setIsSheetOpen(true)
//   }, [])

//   const renderBackdrop = useCallback(
//     (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={0} appearsOnIndex={1} />,
//     [],
//   )

//   useEffect(() => {
//     navigation.getParent()?.setOptions({
//       tabBarStyle: isSheetOpen ? { display: "none" } : $tabBarStyles,
//     })
//   }, [isSheetOpen])

//   const isCompleted = Number(task.current ?? 0) >= Number(task.target ?? 1)

//   return (
//     <>
//       <TouchableOpacity
//         style={[$taskContainer, { opacity: task.finished ? 0.6 : 1 }]}
//         onPress={handleOpenSheet}
//       >
//         {/* Left side: emoji + name */}
//         <View style={$taskLeftContainer}>
//           <View style={$taskEmojiContainer}>
//             <Text text={task.emoji} size="lg" style={$emojiText} />
//           </View>
//           <View>
//             <Text
//               text={task.name}
//               numberOfLines={1}
//               ellipsizeMode="tail"
//               style={{ maxWidth: layout.window.width * 0.4 }}
//             />
//           </View>
//         </View>

//         {/* Right side: icons */}
//         <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 0, gap: 12 }}>
//           {isCompleted ? (
//             <MaterialCommunityIcons name="check-circle" size={24} color="#304FFE" />
//           ) : (
//             <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color="#ccc" />
//           )}

//           <TouchableOpacity
//             onPress={() => habitStore.togglePauseHabit(task.id)}
//             style={{
//               padding: 4,
//               borderRadius: 6,
//               backgroundColor: task.paused ? "lightgreen" : "transparent",
//             }}
//           >
//             <MaterialCommunityIcons
//               name={task.paused ? "pause-circle" : "pause-circle-outline"}
//               size={24}
//               color={task.paused ? colors.palette.accent500 : colors.palette.neutral500}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() =>
//               Alert.alert(
//                 "Delete Habit",
//                 `Are you sure you want to delete "${task.name}"?`,
//                 [
//                   { text: "Cancel", style: "cancel" },
//                   {
//                     text: "Delete",
//                     style: "destructive",
//                     onPress: () => habitStore.removeHabit(task.id),
//                   },
//                 ],
//                 { cancelable: true },
//               )
//             }
//           >
//             <MaterialCommunityIcons
//               name="trash-can-outline"
//               size={24}
//               color={colors.palette.neutral500}
//             />
//           </TouchableOpacity>
//         </View>
//       </TouchableOpacity>

//       <BottomSheetModal
//         ref={bottomSheetRef}
//         snapPoints={[500, "70%"]}
//         backdropComponent={renderBackdrop}
//         style={$bottomSheetContainer}
//         onDismiss={() => setIsSheetOpen(false)}
//       >
//         <BottomSheetView style={$bottomSheet}>
//           <View style={$bottomSheetIcons}>
//             <View style={$taskEmojiContainer}>
//               <Text text={task.emoji} size="lg" style={$emojiText} />
//             </View>
//             <View style={$taskEmojiContainer}>
//               <Icon
//                 icon="pencil"
//                 size={16}
//                 onPress={() => navigate("EditHabit", { habitId: task.id })}
//               />
//             </View>
//           </View>

//           <Text text={task.name} preset="heading" size="xl" />

//           <View style={$daysContainer}>
//             {days?.map((d, idx) => (
//               <View key={`day-${d.day}-${idx}`} style={$dayContainerStyle}>
//                 <Text text={d.abbr} style={$dayStyle} size="md" />
//               </View>
//             ))}
//           </View>

//           <View style={{ marginBottom: spacing.md }}>
//             <View style={$frequencyContainer}>
//               <Text preset="formLabel" text="Habit time" style={$labelStyle} />
//               <Text text="*" style={$labelRequired} />
//             </View>
//             <View
//               style={{
//                 backgroundColor: colors.palette.neutral200,
//                 width: layout.window.width * 0.25,
//                 padding: spacing.sm,
//                 borderRadius: spacing.sm,
//               }}
//             >
//               <Text text={task.time} />
//             </View>
//           </View>

//           <View>
//             <View>
//               <Text preset="formLabel" text="Reminders" style={$labelStyle} />
//             </View>
//             <View style={$reminder}>
//               <Text text="30 minutes before" size="md" />
//               <Icon icon="caretRight" />
//             </View>
//           </View>
//         </BottomSheetView>
//       </BottomSheetModal>
//     </>
//   )
// })






// export const FakeHabitScreen = observer(({ navigation }) => {
//   const today = new Date()
//   const formattedToday = today.toISOString().split("T")[0]

//   const [selected, setSelected] = useState(formattedToday)
//   const [period, setPeriod] = useState("30")
//   const [showRaw, setShowRaw] = useState(false)

//   const summary = getSummaryByPeriod(habitStore.habits, habitStore.activityLog, period)

//   const handleAdd = () => {
//     habitStore.addHabit("Health")
//   }

//   const handleInjectActivity = () => {
//     habitStore.logActivity(formattedToday, 3)
//   }

//   const totalCompleted = summary.reduce((acc, s) => acc + s.completed, 0)
//   const totalTarget = summary.reduce((acc, s) => acc + s.target, 0)

// const weeklyCompletionData = useMemo(() => {
//   if (!habitStore.habits.length || !habitStore.activityLog.length) return []

//   const today = new Date()
//   const startOfWeek = new Date(today)
//   startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday start

//   const weekDatesSet = new Set(
//     eachDayOfInterval({ start: startOfWeek, end: today }).map((date) =>
//       format(date, "yyyy-MM-dd")
//     )
//   )

//   return habitStore.habits.map((habit) => {
//     const logs = habitStore.activityLog.filter((entry) =>
//       weekDatesSet.has(entry.date?.slice(0, 10))
//     )
//     const totalCount = logs.reduce((acc, entry) => acc + entry.count, 0)
//     const targetCount = habit.target * weekDatesSet.size
//     const avgProgress = targetCount === 0 ? 0 : Math.round((totalCount / targetCount) * 100)

//     return {
//       habitName: habit.name,
//       avgProgress,
//       emoji: habit.emoji || "🔥",
//     }
//   })
// }, [habitStore.habits, habitStore.activityLog])

// // more stuff

// const chartLength = 7 // or use dynamic value based on selected period

// const habitWeeklyStatus = useMemo(() => {
//   const today = new Date()
//   const days = Array.from({ length: chartLength }).map((_, idx) => {
//     const date = subDays(today, 6 - idx)
//     return {
//       date,
//       formatted: format(date, "yyyy-MM-dd"),
//       dayOfWeek: format(date, "EEEE"),
//     }
//   })

//   return habitStore.habits
//     .filter((habit) => !habit.paused)
//     .map((habit) => {
//       const dayStatuses = days.map((day) => {
//         if (!habit.frequency.includes(day.dayOfWeek)) return "grey"

//         const logEntry = habitStore.activityLog.find(
//           (entry) => entry.habitId === habit.id && entry.date === day.formatted
//         )

//         if (logEntry) {
//           if (logEntry.count >= habit.target) return "green"
//           if (logEntry.count > 0) return "yellow"
//           return "red"
//         }
//         return "red"
//       })

//       return {
//         habitName: habit.name,
//         targetText: `${habit.target} ${habit.unit ?? ""} per day`,
//         dayStatuses,
//       }
//     })
// }, [habitStore.habits, habitStore.activityLog])

// const habitWeeklyBreakdown = useMemo(() => {
//   const today = new Date()
//   const days = Array.from({ length: chartLength }).map((_, idx) =>
//     subDays(today, chartLength - 1 - idx)
//   )

//   const breakdown: Record<string, { completed: number; partial: number; missed: number }> = {}

//   habitStore.habits
//     .filter((habit) => !habit.paused)
//     .forEach((habit) => {
//       let completed = 0
//       let partial = 0
//       let missed = 0

//       days.forEach((date) => {
//         const formattedDate = format(date, "yyyy-MM-dd")
//         const dayOfWeek = format(date, "EEEE")

//         if (!habit.frequency.includes(dayOfWeek)) return

//         const logEntry = habitStore.activityLog.find(
//           (entry) => entry.habitId === habit.id && entry.date === formattedDate
//         )

//         if (logEntry) {
//           if (logEntry.count >= habit.target) completed += 1
//           else if (logEntry.count > 0) partial += 1
//           else missed += 1
//         } else {
//           missed += 1
//         }
//       })

//       breakdown[habit.id] = { completed, partial, missed }
//     })

//   return breakdown
// }, [habitStore.habits, habitStore.activityLog])



// // check ins



// const checkIns = habitStore.habits
//   .filter((habit) => habit.category === "health")
//   .map((habit) => {
//     const todayCount = habitStore.activityLog
//       .filter((entry) => entry.habitId === habit.id && entry.date === selected)
//       .reduce((acc, entry) => acc + entry.count, 0)

//     return {
//       emoji: habit.emoji || "💧",
//       title: habit.name,
//       name: habit.unit || "",
//       amount: `${todayCount}/${habit.target}`,
//       color: habit.color || "#304FFE",
//       fill: (todayCount / habit.target) * 100,
//     }
//   })

//   const $bottomContainer: ViewStyle = {
//   gap: 10,
// }

//   const filteredHabits = habitStore.habits.filter((habit) => !habit.paused)


//     const getTodayCount = (habitId: string) => {
//       const today = selectedLocalDateStr
//       const logEntry = habitStore.activityLog.find(
//         (entry) => entry.habitId === habitId && entry.date === today,
//       )
//       return logEntry ? logEntry.count : 0
//     }


//         const selectedDateObj = parseLocalDate(selected)

    
//   const selectedLocalDateStr = getLocalDateString(selectedDateObj)


//    function getLocalDateString(date: Date) {
//     const year = date.getFullYear()
//     const month = (date.getMonth() + 1).toString().padStart(2, "0")
//     const day = date.getDate().toString().padStart(2, "0")
//     return `${year}-${month}-${day}`
//   }



//      function parseLocalDate(dateString: string): Date {
//     const [year, month, day] = dateString.split("-").map(Number)
//     return new Date(year, month - 1, day)
//   }

//  return (
//     <BottomSheetModalProvider>
//     <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "white" }}>
//       <View style={{ flex: 1 }}>

//         {/* Calendar Navbar */}
//         <View
//           style={{
//             height: 100,
//             width: "100%",
//             borderBottomWidth: 1,
//             borderColor: "#ccc",
//             backgroundColor: "#fff",
//             marginBottom: 0,
//           }}
//         >
//           <CalendarProvider date={selected}>
//             <WeekCalendar
//               current={selected}
//               onDayPress={(day) => setSelected(day.dateString)}
//               markedDates={{
//                 [selected]: { selected: true, selectedColor: "#3399ff" },
//               }}
//               firstDay={1}
//             />
//           </CalendarProvider>
//         </View>

//               {/* Coral Header — ADD IT HERE */}
//       <View style={{ height: 60, backgroundColor: "lightcoral", justifyContent: "center" }}>
//         <Text
//           style={{
//             fontSize: 20,
//             fontWeight: "bold",
//             color: "#fff",
//             textAlign: "center",
//           }}
//         >
//           {format(new Date(selected), "EEEE, MMMM d")}
//         </Text>
//       </View>


//       {/* 🔽 Drop Cards Here */}

// <View style={{ paddingVertical: 10, paddingLeft: 12 }}>
//   <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//     {checkIns.map((checkIn, i) => {
//       const habit = habitStore.habits.find(h => h.name === checkIn.title)
//       const habitId = habit?.id

//       return (
//         <View
//           key={`${checkIn.title}-${i}`}
//           style={{
//             backgroundColor: "#fff",
//             borderRadius: 16,
//             padding: 12,
//             marginRight: 12,
//             width: 140,
//             elevation: 2,
//             shadowColor: "#000",
//             shadowOpacity: 0.1,
//             shadowRadius: 2,
//           }}
//         >
//           {/* Emoji + Title */}
//           <Text style={{ fontSize: 24 }}>{checkIn.emoji}</Text>
//           <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 6 }}>
//             {checkIn.title}
//           </Text>

//           {/* Circular Progress Bar */}
//           <AnimatedCircularProgress
//             size={85}
//             width={10}
//             fill={checkIn.fill}
//             rotation={360}
//             tintColor={checkIn.color}
//             backgroundColor="#eee"
//             style={{ alignSelf: "center", marginBottom: 10 }}
//           >
//             {() => (
//               <View style={{ alignItems: "center" }}>
//                 <Text>{checkIn.amount}</Text>
//                 <Text>{checkIn.name}</Text>
//               </View>
//             )}
//           </AnimatedCircularProgress>

//           {/* Increment & Decrement Buttons */}
//           <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
//             <TouchableOpacity
//               onPress={() => habitStore.incrementHabit(habitId, selected)}
//               style={{
//                 padding: 6,
//                 backgroundColor: "#E3F2FD",
//                 borderRadius: 8,
//                 width: 40,
//                 alignItems: "center",
//               }}
//             >
//               <Text style={{ fontSize: 18 }}>＋</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={() => habitStore.decrementHabit(habitId, selected)}
//               style={{
//                 padding: 6,
//                 backgroundColor: "#FFEBEE",
//                 borderRadius: 8,
//                 width: 40,
//                 alignItems: "center",
//               }}
//             >
//               <Text style={{ fontSize: 18 }}>－</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )
//     })}
//   </ScrollView>
// </View>

// <View style={{ flex: 1 }}>
//   {/* ✅ Today Section (non-scrollable, always visible) */}
//   <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.lg }}>
//     <Text tx="homeScreen.today" preset="subheading" />
//     <View style={$bottomContainer}>
//       {filteredHabits.map((habit, idx) => {
//         const todayCount = getTodayCount(habit.id)
//         const transformedHabit = {
//           id: habit.id,
//           name: habit.name || "Unnamed Habit",
//           emoji: habit.emoji || "🔥",
//           time: habit.time || "08:00",
//           current: todayCount,
//           target: habit.target || 1,
//           finished: habit.finished ?? false,
//           paused: habit.paused,
//         }

//         return (
          
//           <View key={`${habit.id}-${idx}`} style={{ marginBottom: 12 }}>
//             <Habit task={transformedHabit} navigation={navigation} />
//           </View>
//         )
//       })}
//     </View>
//   </View>

//   {/* 🔽 Scrollable content starts here */}
//   <ScrollView contentContainerStyle={{ padding: spacing.md }}>
//     {/* Your existing scroll content goes here */}
//   </ScrollView>
// </View>


//         {/* Scrollable Content */}
//         <ScrollView
//           contentContainerStyle={{
//             padding: 20,
//             paddingTop: 0,
//             marginTop: 0,
//           }}
//         >
//           <Text style={{ fontSize: 24, marginBottom: 10 }}>Fake Habit Screen</Text>

//           <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 10 }}>
//             {["7", "30", "90"].map((p) => (
//               <Button key={p} title={`${p} Days`} onPress={() => setPeriod(p)} />
//             ))}
//           </View>

//           <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
//             Total: {totalCompleted} / {totalTarget}
//           </Text>

//           <Button title={showRaw ? "Show Summary" : "Show Raw Data"} onPress={() => setShowRaw(!showRaw)} />

//           {showRaw ? (
//             <>
//               <Text style={{ marginTop: 20, fontWeight: "bold" }}>Raw HabitStore:</Text>
//               <Text>{JSON.stringify(habitStore.habits, null, 2)}</Text>

//               <Text style={{ marginTop: 20, fontWeight: "bold" }}>Raw ActivityLog:</Text>
//               <Text>{JSON.stringify(habitStore.activityLog, null, 2)}</Text>
//             </>
//           ) : (
//             <>
//               <Text style={{ marginTop: 10, fontWeight: "bold" }}>{period}-Day Summary:</Text>
//               {summary.map((day) => (
//                 <Text key={day.date}>
//                   {day.date}: {day.completed} / {day.target}
//                 </Text>
//               ))}

//               {weeklyCompletionData.map((habit, idx) => (
//                 <View
//                   key={`${habit.habitName}-${idx}`}
//                   style={{ marginVertical: 12, paddingHorizontal: 16 }}
//                 >
//                   <View style={{ flexDirection: "row", alignItems: "center" }}>
//                     <Text style={{ fontSize: 18, marginRight: 8 }}>{habit.emoji}</Text>
//                     <Text style={{ flex: 1, fontSize: 16, color: "#444" }}>{habit.habitName}</Text>
//                     <Text style={{ fontWeight: "600", color: "#000" }}>{`${habit.avgProgress}%`}</Text>
//                   </View>

//                   <View
//                     style={{
//                       height: 8,
//                       backgroundColor: "#ddd",
//                       borderRadius: 4,
//                       overflow: "hidden",
//                       marginTop: 4,
//                     }}
//                   >
//                     <View
//                       style={{
//                         width: `${habit.avgProgress}%`,
//                         backgroundColor: habitStore.habits[idx]?.color ?? "#304FFE",
//                         height: "100%",
//                       }}
//                     />
//                   </View>
//                 </View>
//               ))}

//               {habitWeeklyStatus.map((habit, idx) => {
//                 const habitId = habitStore.habits[idx]?.id ?? "";
//                 const habitColor = habitStore.habits[idx]?.color ?? "#304FFE";

//                 return (
//                   <View
//                     key={`${habit.habitName}-${idx}`}
//                     style={{
//                       flex: 1,
//                       borderWidth: 1,
//                       borderColor: "#ccc",
//                       borderRadius: 8,
//                       backgroundColor: "#fff",
//                       paddingVertical: 16,
//                       marginTop: 16,
//                       elevation: 2,
//                       shadowColor: "#000",
//                       shadowOffset: { width: 0, height: 1 },
//                       shadowOpacity: 0.1,
//                       shadowRadius: 2,
//                       paddingHorizontal: 16,
//                     }}
//                   >
//                     <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 2 }}>
//                       {habit.habitName}
//                     </Text>
//                     <Text style={{ color: "#666", marginBottom: 6 }}>{habit.targetText}</Text>

//                     <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
//                       {habit.dayStatuses.map((status, dayIdx) => (
//                         <View
//                           key={dayIdx}
//                           style={{
//                             width: 43,
//                             height: 43,
//                             borderRadius: 6,
//                             backgroundColor:
//                               status === "green"
//                                 ? habitColor
//                                 : status === "yellow"
//                                 ? `${habitColor}80`
//                                 : "#BDBDBD",
//                           }}
//                         />
//                       ))}
//                     </View>

//                     <Text style={{ color: "#444", marginBottom: 4 }}>
//                       🔥 Current Streak: {habitWeeklyBreakdown[habitId]?.completed ?? 0} days
//                     </Text>
//                     <Text style={{ color: "#444", marginBottom: 4 }}>
//                       🏆 Longest Streak: {habitWeeklyBreakdown[habitId]?.completed ?? 0} days
//                     </Text>
//                     <Text style={{ color: "#444", marginBottom: 4 }}>
//                       ✅ Completed: {habitWeeklyBreakdown[habitId]?.completed ?? 0} days
//                     </Text>
//                     <Text style={{ color: "#444", marginBottom: 4 }}>
//                       🟡 Partial: {habitWeeklyBreakdown[habitId]?.partial ?? 0} days
//                     </Text>
//                     <Text style={{ color: "#444" }}>
//                       ❌ Missed: {habitWeeklyBreakdown[habitId]?.missed ?? 0} days
//                     </Text>
//                   </View>
//                 );
//               })}
//             </>
//           )}

//           <Button title="Add Sample Habit" onPress={handleAdd} />
//           <Button title="Inject Fake Activity" onPress={handleInjectActivity} />

//           <Text style={{ marginTop: 20 }}>Number of habits: {habitStore.habits.length}</Text>
//           {habitStore.habits.map((habit) => (
//             <Text key={habit.id}>{habit.name}</Text>
//           ))}
//         </ScrollView>
//       </View>
//     </SafeAreaView>
//       </BottomSheetModalProvider>
//   );
// });


//   return (
//   <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "white" }}>
//     <View style={{ flex: 1 }}>
//       {/* Calendar Navbar */}
//       <View
//         style={{
//           height: 100,
//           width: "100%",
//           borderBottomWidth: 1,
//           borderColor: "#ccc",
//           backgroundColor: "#fff", // to confirm it's flush
//           marginBottom: 0,
//         }}
//       >
//         <CalendarProvider date={selected}>
//           <WeekCalendar
//             current={selected}
//             onDayPress={(day) => setSelected(day.dateString)}
//             markedDates={{
//               [selected]: { selected: true, selectedColor: "#3399ff" },
//             }}
//             firstDay={1}
//           />
//         </CalendarProvider>
//       </View>

//       {/* Scrollable Content */}
//       {/* <ErrorBoundary fallback={<Text style={{ color: "red" }}>Something broke!</Text>}> */}
//          <ScrollView
//         contentContainerStyle={{
//           padding: 20,
//           paddingTop: 0, // force flush with calendar
//           marginTop: 0,  // prevent stacking offset
//         }}
//       >
//           <Text style={{ fontSize: 24, marginBottom: 10 }}>Fake Habit Screen</Text>

//           <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 10 }}>
//             {["7", "30", "90"].map((p) => (
//               <Button key={p} title={`${p} Days`} onPress={() => setPeriod(p)} />
//             ))}
//           </View>

//           <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
//             Total: {totalCompleted} / {totalTarget}
//           </Text>

//           <Button title={showRaw ? "Show Summary" : "Show Raw Data"} onPress={() => setShowRaw(!showRaw)} />

//           {showRaw ? (
//             <>
//               <Text style={{ marginTop: 20, fontWeight: "bold" }}>Raw HabitStore:</Text>
//               <Text>{JSON.stringify(habitStore.habits, null, 2)}</Text>

//               <Text style={{ marginTop: 20, fontWeight: "bold" }}>Raw ActivityLog:</Text>
//               <Text>{JSON.stringify(habitStore.activityLog, null, 2)}</Text>
//             </>
//           ) : (
//             <>
//               <Text style={{ marginTop: 10, fontWeight: "bold" }}>{period}-Day Summary:</Text>
//               {summary.map((day) => (
//                 <Text key={day.date}>
//                   {day.date}: {day.completed} / {day.target}
//                 </Text>
//               ))}

//               {weeklyCompletionData.map((habit, idx) => (
//   <View
//     key={`${habit.habitName}-${idx}`}
//     style={{ marginVertical: 12, paddingHorizontal: 16 }}
//   >
//     <View style={{ flexDirection: "row", alignItems: "center" }}>
//       <Text style={{ fontSize: 18, marginRight: 8 }}>{habit.emoji}</Text>
//       <Text style={{ flex: 1, fontSize: 16, color: "#444" }}>{habit.habitName}</Text>
//       <Text style={{ fontWeight: "600", color: "#000" }}>{`${habit.avgProgress}%`}</Text>
//     </View>

//     <View
//       style={{
//         height: 8,
//         backgroundColor: "#ddd",
//         borderRadius: 4,
//         overflow: "hidden",
//         marginTop: 4,
//       }}
//     >
//       <View
//   style={{
//     width: `${habit.avgProgress}%`,
//     backgroundColor:
//       habitStore.habits[idx]?.color ?? "#304FFE", // use habit's chosen color, fallback if missing
//     height: "100%",
//   }}
// />
//     </View>
//   </View>
// ))}

// {habitWeeklyStatus.map((habit, idx) => {
//   const habitId = habitStore.habits[idx]?.id ?? ""
//   const habitColor = habitStore.habits[idx]?.color ?? "#304FFE"

//   return (
//     <View
//       key={`${habit.habitName}-${idx}`}
//       style={{
//         flex: 1,
//         borderWidth: 1,
//         borderColor: "#ccc",
//         borderRadius: 8,
//         backgroundColor: "#fff",
//         paddingVertical: 16,
//         marginTop: 16,
//         elevation: 2,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 2,
//         paddingHorizontal: 16,
//       }}
//     >
//       <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 2 }}>
//         {habit.habitName}
//       </Text>
//       <Text style={{ color: "#666", marginBottom: 6 }}>{habit.targetText}</Text>

//       <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
//         {habit.dayStatuses.map((status, dayIdx) => (
//           <View
//             key={dayIdx}
//             style={{
//               width: 43,
//               height: 43,
//               borderRadius: 6,
//               backgroundColor:
//                 status === "green"
//                   ? habitColor
//                   : status === "yellow"
//                   ? `${habitColor}80`
//                   : "#BDBDBD",
//             }}
//           />
//         ))}
//       </View>

//       <Text style={{ color: "#444", marginBottom: 4 }}>
//         🔥 Current Streak: {habitWeeklyBreakdown[habitId]?.completed ?? 0} days
//       </Text>
//       <Text style={{ color: "#444", marginBottom: 4 }}>
//         🏆 Longest Streak: {habitWeeklyBreakdown[habitId]?.completed ?? 0} days
//       </Text>
//       <Text style={{ color: "#444", marginBottom: 4 }}>
//         ✅ Completed: {habitWeeklyBreakdown[habitId]?.completed ?? 0} days
//       </Text>
//       <Text style={{ color: "#444", marginBottom: 4 }}>
//         🟡 Partial: {habitWeeklyBreakdown[habitId]?.partial ?? 0} days
//       </Text>
//       <Text style={{ color: "#444" }}>
//         ❌ Missed: {habitWeeklyBreakdown[habitId]?.missed ?? 0} days
//       </Text>
//     </View>
//   )
// })}

//             </>
//           )}

//           <Button title="Add Sample Habit" onPress={handleAdd} />
//           <Button title="Inject Fake Activity" onPress={handleInjectActivity} />

//           <Text style={{ marginTop: 20 }}>Number of habits: {habitStore.habits.length}</Text>
//           {habitStore.habits.map((habit) => (
//             <Text key={habit.id}>{habit.name}</Text>
//           ))}
//         </ScrollView>
//       {/* </ErrorBoundary> */}
//    </SafeAreaView>
//   );
// });




import { View, Text } from 'react-native';

export default function PlaceholderScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Screen placeholder — nothing fancy, just alive.</Text>
    </View>
  );
}
