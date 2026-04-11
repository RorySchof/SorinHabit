// // HOME SCREEN\ old one

// import { observer } from "mobx-react-lite"
// import React, { FC, useMemo, useState, useCallback, useEffect, useRef } from "react"
// import {
//   Image,
//   View,
//   ScrollView,
//   TouchableOpacity,
//   Pressable,
//   ViewStyle,
//   TextStyle,
//   ImageStyle,
//   Alert,
// } from "react-native"
// import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
// import { AnimatedCircularProgress } from "react-native-circular-progress"
// import { Card, Text, Toggle, Screen, Icon } from "app/components"
// import layout from "app/utils/layout"
// import { navigate } from "../navigators"
// import { colors, spacing } from "../theme"
// import { HomeNavProps, HomeStackScreenProps } from "app/navigators/types"
// import { habitStore } from "app/models/habit-store"
// import { WeekCalendar, CalendarProvider } from "react-native-calendars"
// import { SafeAreaView } from "react-native-safe-area-context"
// import { useFocusEffect } from "@react-navigation/native"
// import WeekStrip from "app/components/WeekStrip"
// import dayjs from "dayjs"

// import { PanGestureHandler } from "react-native-gesture-handler"

// import AsyncStorage from "@react-native-async-storage/async-storage"

// import { Animated } from "react-native"

// import * as Haptics from "expo-haptics"




// //INTERFACE

// interface HabitType {
//   id: number
//   emoji: string
//   name: string
//   time: string
//   finished: boolean
//   current?: number
//   target?: number
//   unit?: string
//   color?: string
//   frequency?: string[]
//   category?: string
//   createdAt?: string
// }

// interface DayCardProps {
//   day: string
//   date: string
//   progress: number
// }

// interface HomeScreenProps extends HomeStackScreenProps<"Home"> {}

// interface HabitProps {
//   task: HabitType
//   navigation: HomeNavProps
// }

// //COMPONENTS
// export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen({ navigation }) {
//   const today = new Date()
//   const formattedToday = getLocalDateString(today)
//   const [selected, setSelected] = useState(formattedToday)
//   const [calendarKey, setCalendarKey] = useState(0)

//   const scrollRef = useRef<ScrollView | null>(null)

//   const [showSwipeHint, setShowSwipeHint] = useState(true)

//   // Prompt to use swipe

//   useEffect(() => {
//     AsyncStorage.getItem("hasSeenSwipeHint").then((value) => {
//       if (!value) {
//         setShowSwipeHint(true)
//       }
//     })
//   }, [])

//   const dismissSwipeHint = () => {
//     setShowSwipeHint(false)
//     AsyncStorage.setItem("hasSeenSwipeHint", "true")
//   }

//   // end prompt

//   useFocusEffect(
//     useCallback(() => {
//       setCalendarKey((prev) => prev + 1) // 👈 forces remount
//     }, []),
//   )

//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       setCalendarKey((prev) => prev + 1)
//     }, 50)

//     return () => clearTimeout(timeout)
//   }, [selected])

//   function parseLocalDate(dateString: string): Date {
//     const [year, month, day] = dateString.split("-").map(Number)
//     return new Date(year, month - 1, day)
//   }

//   const selectedDateObj = parseLocalDate(selected)

//   function getLocalDateString(date: Date) {
//     const year = date.getFullYear()
//     const month = (date.getMonth() + 1).toString().padStart(2, "0")
//     const day = date.getDate().toString().padStart(2, "0")
//     return `${year}-${month}-${day}`
//   }

//   const selectedLocalDateStr = getLocalDateString(selectedDateObj)

//   const getTodayCount = (habitId: string) => {
//     const today = selectedLocalDateStr
//     const logEntry = habitStore.activityLog.find(
//       (entry) => entry.habitId === habitId && entry.date === today,
//     )
//     return logEntry ? logEntry.count : 0
//   }

//   const selectedDay = selectedDateObj.toLocaleDateString("en-US", { weekday: "long" })

//   // const selectedDay = selectedDateObj.toLocaleDateString("en-US", { weekday: "short" })

//   const { habits, activityLog } = habitStore

//   // const filteredHabits = habits.filter((habit) => {
//   //   if (!habit.createdAt || !habit.frequency) return false
//   //   if (habit.deleted) return false

//   //   const habitCreatedAtDate = new Date(habit.createdAt)
//   //   const habitLocalDateStr = getLocalDateString(habitCreatedAtDate)
//   //   const includesDay = habit.frequency.includes(selectedDay)
//   //   const isBeforeOrOnSelectedDate = habitLocalDateStr <= selectedLocalDateStr
//   //   const shouldInclude = isBeforeOrOnSelectedDate && includesDay

//   //   return shouldInclude
//   // })






//   const filteredHabits = habits.filter((habit) => {
//     if (!habit.createdAt || !habit.frequency) return false
//     if (habit.deleted) return false

//     const habitLocalDateStr = habit.createdAt
//     const includesDay = habit.frequency.includes(selectedDay)
//     const isBeforeOrOnSelectedDate = habitLocalDateStr <= selectedLocalDateStr

//     console.log("🔍 Filtering habit:", habit.name)
//     console.log("   createdAt (raw):", habit.createdAt)
//     console.log("   habitLocalDateStr:", habitLocalDateStr)
//     console.log("   selectedLocalDateStr:", selectedLocalDateStr)
//     console.log("   includesDay:", includesDay)
//     console.log("   isBeforeOrOnSelectedDate:", isBeforeOrOnSelectedDate)
//     console.log("CREATED RAW:", habit.createdAt)

//     const shouldInclude = isBeforeOrOnSelectedDate && includesDay
//     return shouldInclude
//   })

//   // Calendar marked dates from filteredHabits

//   const markedDates: Record<string, any> = {}
//   filteredHabits.forEach((habit) => {
//     const dateKey = habit.createdAt!.split("T")[0]
//     markedDates[dateKey] = {
//       marked: true,
//       dotColor: habit.color || colors.palette.primary400,
//     }
//   })

//   // Ensure selected date is marked as selected

//   markedDates[selected] = {
//     ...(markedDates[selected] || {}),
//     selected: true,
//     selectedColor: "#304FFE",
//   }

//   const checkIns = filteredHabits
//     .filter((habit) => habit.category === "health")
//     .map((habit) => {
//       const todayCount = getTodayCount(habit.id)
//       return {
//         emoji: habit.emoji || "💧",
//         title: habit.name,
//         name: habit.unit || "",
//         amount: `${todayCount}/${habit.target}`,
//         color: habit.color || colors.palette.primary300,
//         fill: (todayCount / habit.target) * 100,
//       }
//     })

//   // Day progress data based on selected day and frequency

//   const dayProgressData = useMemo(() => {
//     const dateObj = new Date(selected)

//     // const dayLabel = dateObj.toLocaleDateString("en-US", { weekday: "short" })

//     const dayLabel = dateObj.toLocaleDateString("en-US", { weekday: "long" })

//     const dayNumber = dateObj.getDate().toString()

//     const dayHabits = filteredHabits.filter((habit) => habit.frequency?.includes(dayLabel))

//     const totalTarget = dayHabits.reduce((sum, h) => sum + h.target!, 0)
//     const totalCurrent = dayHabits.reduce((sum, h) => sum + getTodayCount(h.id), 0)
//     const progress = totalTarget === 0 ? 0 : Math.round((totalCurrent / totalTarget) * 100)

//     return [
//       {
//         day: dayLabel,
//         date: dayNumber,
//         progress,
//       },
//     ]
//   }, [
//     selected,
//     filteredHabits
//       .map((h) => `${h.name}-${getTodayCount(h.id)}-${h.target}-${h.frequency}`)
//       .join(","),
//   ])

//   // RENDER

//   return (
//     <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: "#fff" }}>
//       {/* ⬆️ Calendar as navbar */}
//       <View
//         style={{
//           height: 60,
//           paddingHorizontal: spacing.md,
//           backgroundColor: "#FFFFFF",
//           borderWidth: 1,
//           borderColor: colors.palette.neutral300,
//           overflow: "hidden",
//           flexDirection: "row",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <TouchableOpacity
//           onPress={() => setSelected(dayjs(selected).subtract(1, "week").format("YYYY-MM-DD"))}
//           style={{ paddingHorizontal: 10 }}
//         >
//           <Text size="md" weight="bold" style={{ color: "#304FFE" }}>
//             {"‹"}
//           </Text>
//         </TouchableOpacity>

//         <CalendarProvider date={selected} onDateChanged={setSelected}>
//           <WeekStrip selectedDate={selected} onSelectDate={(date) => setSelected(date)} />
//         </CalendarProvider>

//         <TouchableOpacity
//           onPress={() => setSelected(dayjs(selected).add(1, "week").format("YYYY-MM-DD"))}
//           style={{ paddingHorizontal: 10 }}
//         >
//           <Text size="md" weight="bold" style={{ color: "#304FFE" }}>
//             {"›"}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* 👇 Scrollable main content */}

//       <Screen preset="scroll" safeAreaEdges={["bottom"]} contentContainerStyle={$container}>
//         {/* ✅ Check-In Cards */}

//         <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
//           <Text tx="homeScreen.check_in" preset="subheading" />

//           {/* ⭐ Floating hint ABOVE the cards */}

//           {showSwipeHint && (
//             <Pressable onPress={dismissSwipeHint}>
//               <Text
//                 style={{
//                   fontSize: 12,
//                   color: colors.palette.neutral500,
//                   marginTop: -4,
//                   marginBottom: spacing.xs,
//                   marginLeft: 2,
//                 }}
//               >
//                 swipe up/down to adjust ×
//               </Text>
//             </Pressable>
//           )}
//           <ScrollView
//             ref={scrollRef} // 👈 attach here
//             contentContainerStyle={$middleContainer}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             scrollEnabled={true}
//             directionalLockEnabled={true}
//           >
//             {/* NEW Checkin cards with swipe */}
//             {checkIns.map((checkIn, i) => {
//               const matchedHabit = filteredHabits.find((h) => h.name === checkIn.title)

//               console.log("Matched habit for card:", checkIn.title, "→", matchedHabit?.id)

//               const scaleAnim = useRef(new Animated.Value(1)).current

//               const triggerPulse = () => {
//   scaleAnim.setValue(1)
//   Animated.sequence([
//     Animated.timing(scaleAnim, {
//       toValue: 1.08,
//       duration: 120,
//       useNativeDriver: true,
//     }),
//     Animated.timing(scaleAnim, {
//       toValue: 1,
//       duration: 120,
//       useNativeDriver: true,
//     }),
//   ]).start()
// }

// const triggerCompletionPulse = () => {
//   scaleAnim.setValue(1)
//   Animated.sequence([
//     Animated.timing(scaleAnim, {
//       toValue: 1.35,
//       duration: 160,
//       useNativeDriver: true,
//     }),
//     Animated.timing(scaleAnim, {
//       toValue: 1,
//       duration: 160,
//       useNativeDriver: true,
//     }),
//   ]).start()
// }




//               return (
//                 <PanGestureHandler
//                   key={`${checkIn.title}-${i}`}
//                   simultaneousHandlers={scrollRef}
//                   activeOffsetX={[-40, 40]}
//                   activeOffsetY={[-5, 5]}
//                   onEnded={({ nativeEvent }) => {
//                     if (!matchedHabit) return
//                     const todayCount = getTodayCount(matchedHabit.id)
//                     const isAtMax = todayCount >= matchedHabit.target
//                     const isAtMin = todayCount <= 0

//                     // if (nativeEvent.translationY < -30 && !isAtMax) {
//                     //   habitStore.incrementHabit(matchedHabit.id, selected)

//                     //   Animated.sequence([
//                     //     Animated.timing(scaleAnim, {
//                     //       toValue: 1.05,
//                     //       duration: 120,
//                     //       useNativeDriver: true,
//                     //     }),
//                     //     Animated.timing(scaleAnim, {
//                     //       toValue: 1,
//                     //       duration: 120,
//                     //       useNativeDriver: true,
//                     //     }),
//                     //   ]).start()

//                     // } 

//                     if (nativeEvent.translationY < -30 && !isAtMax) {
//   const isCompleting = todayCount + 1 === matchedHabit.target

//   if (isCompleting) {
//     triggerCompletionPulse()
//     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
//   } else {
//     triggerPulse()
//   }

//   habitStore.incrementHabit(matchedHabit.id, selected)
// }

                    
//                     else if (nativeEvent.translationY > 30 && !isAtMin) {
//                       habitStore.decrementHabit(matchedHabit.id, selected)
//                     }
//                   }}
//                 >
//                   <Card
//                     style={$checkInCardStyle}
//                     verticalAlignment="space-between"
//                     wrapperStyle={{ padding: spacing.sm }}
//                     HeadingComponent={
//                       <View style={$headingContainer}>
//                         <View style={$emojiContainer}>
//                           <Text text={checkIn.emoji} size="xl" style={$emojiText} />
//                         </View>
//                         <Text
//                           text={checkIn.title}
//                           size="md"
//                           numberOfLines={2}
//                           ellipsizeMode="tail"
//                           style={{ flexShrink: 1, textAlign: "center" }}
//                         />
//                       </View>
//                     }
//                     ContentComponent={
//                       // <AnimatedCircularProgress
//                       //   size={95}
//                       //   width={10}
//                       //   fill={checkIn.fill}
//                       //   rotation={360}
//                       //   tintColor={checkIn.color}
//                       //   backgroundColor={colors.palette.neutral200}
//                       //   style={$circularProgressContainer}
//                       // >
//                       //   {() => (
//                       //     <View style={$circularProgressChildren}>
//                       //       <Text text={checkIn.amount} size="md" />
//                       //       <Text text={checkIn.name} size="xs" />
//                       //     </View>
//                       //   )}
//                       // </AnimatedCircularProgress>

//                       <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//                         <AnimatedCircularProgress
//                           size={95}
//                           width={10}
//                           fill={checkIn.fill}
//                           rotation={360}
//                           tintColor={checkIn.color}
//                           backgroundColor={colors.palette.neutral200}
//                           style={$circularProgressContainer}
//                         >
//                           {() => (
//                             <View style={$circularProgressChildren}>
//                               <Text text={checkIn.amount} size="md" />
//                               <Text text={checkIn.name} size="xs" />
//                             </View>
//                           )}
//                         </AnimatedCircularProgress>
//                       </Animated.View>
//                     }
//                     FooterComponent={
//                       <View style={$footerContainer}>
//                         {(() => {
//                           if (!matchedHabit) return null
//                           const todayCount = getTodayCount(matchedHabit.id)
//                           const isAtMax = todayCount >= matchedHabit.target
//                           const isAtMin = todayCount <= 0
//                           return (
//                             <>
//                               <Pressable
//                                 disabled={isAtMin}
//                                 onPress={() => habitStore.decrementHabit(matchedHabit.id, selected)}
//                               >
//                                 <MaterialCommunityIcons
//                                   name="minus"
//                                   color={isAtMin ? "gray" : colors.palette.neutral500}
//                                   size={24}
//                                 />
//                               </Pressable>
//                               <Text text="|" style={{ color: colors.palette.neutral500 }} />
//                               <Pressable
//                                 disabled={isAtMax}
//                                 onPress={() => habitStore.incrementHabit(matchedHabit.id, selected)}
//                               >
//                                 <MaterialCommunityIcons
//                                   name="plus"
//                                   color={isAtMax ? "gray" : colors.palette.neutral500}
//                                   size={24}
//                                 />
//                               </Pressable>
//                             </>
//                           )
//                         })()}
//                       </View>
//                     }
//                   />
//                 </PanGestureHandler>
//               )
//             })}
//           </ScrollView>
//         </View>

//         {/* ✅ Today's Habit List with empty state styled like habit cards */}

//         <View style={{ gap: spacing.md }}>
//           <Text tx="homeScreen.today" preset="subheading" />

//           <View style={$bottomContainer}>
//             {filteredHabits.length === 0 ? (
//               <View
//                 style={{
//                   alignItems: "center",
//                   justifyContent: "center",
//                   padding: spacing.lg,
//                   backgroundColor: colors.palette.neutral100, // ✅ white like cards
//                   borderRadius: spacing.xs,
//                   borderWidth: 1,
//                   borderColor: colors.palette.neutral300,
//                   elevation: 6, // ✅ Android shadow
//                   shadowColor: "#000", // ✅ iOS shadow
//                   shadowOffset: { width: 0, height: 4 },
//                   shadowOpacity: 0.1,
//                   shadowRadius: 8,
//                 }}
//               >
//                 {/* Graphic slot (emoji/logo/icon) */}
//                 <Text text="🌱" size="xl" />

//                 {/* Headline */}
//                 <Text
//                   text="No habits yet"
//                   preset="heading"
//                   size="md"
//                   style={{ marginTop: spacing.sm, color: colors.text }}
//                 />

//                 {/* Motivating subcopy */}
//                 <Text
//                   text="Tap below to create your first habit — A journey of a thousand miles begins with a single step"
//                   preset="default"
//                   size="sm"
//                   style={{
//                     marginTop: spacing.xs,
//                     color: colors.palette.neutral600,
//                     textAlign: "center",
//                   }}
//                 />

//                 {/* Primary CTA button */}
//                 <TouchableOpacity
//                   onPress={() => navigation.navigate("CreateNewHabit")}
//                   style={{
//                     marginTop: spacing.md,
//                     backgroundColor: colors.palette.primary600,
//                     borderRadius: spacing.xs,
//                     paddingVertical: spacing.sm,
//                     paddingHorizontal: spacing.lg,
//                   }}
//                 >
//                   <Text
//                     text="Create a new habit"
//                     preset="bold"
//                     size="md"
//                     style={{ color: colors.palette.neutral100 }}
//                   />
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               filteredHabits.map((habit, idx) => {
//                 const todayCount = getTodayCount(habit.id)
//                 const transformedHabit = {
//                   id: habit.id,
//                   name: habit.name || "Unnamed Habit",
//                   emoji: habit.emoji || "🔥",
//                   time: habit.time || "08:00",
//                   current: todayCount,
//                   target: habit.target || 1,
//                   finished: habit.finished ?? false,
//                   paused: habit.paused,
//                 }
//                 return (
//                   <View key={`${habit.id}-${idx}`} style={{ marginBottom: 12 }}>
//                     <Habit task={transformedHabit} navigation={navigation} />
//                   </View>
//                 )
//               })
//             )}
//           </View>
//         </View>
//       </Screen>
//     </SafeAreaView>
//   )
// })

// export const Habit = observer(function Habit({ task, navigation }: HabitProps) {
//   const isCompleted = Number(task.current ?? 0) >= Number(task.target ?? 1)

//   return (
//     <>
//       <TouchableOpacity style={[$taskContainer, { opacity: task.finished ? 0.6 : 1 }]}>
//         {/* Left side: emoji + name */}

//         <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
//           <View style={$taskEmojiContainer}>
//             <Text text={task.emoji} size="lg" style={$emojiText} />
//           </View>
//           <Text
//             text={task.name}
//             numberOfLines={1}
//             ellipsizeMode="tail"
//             style={{
//               flex: 1,
//               marginRight: 4,
//               marginLeft: 4,
//             }}
//           />
//         </View>

//         {/* ✅ Right side: icons wrapped together */}
//         <View
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             flexShrink: 0,
//             gap: 12,
//           }}
//         >
//           {/* Checkmark */}

//           {isCompleted ? (
//             <MaterialCommunityIcons name="check-circle" size={24} color="#304FFE" />
//           ) : (
//             <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color="#ccc" />
//           )}

//           {/* Pause button */}

//           <TouchableOpacity
//             onPress={() => habitStore.togglePauseHabit(task.id)}
//             activeOpacity={0.8}
//             style={{
//               padding: 4,
//               borderRadius: spacing.xs,
//               backgroundColor: colors.palette.neutral100,
//               elevation: 2,
//               shadowColor: "#000",
//               shadowOffset: { width: 0, height: 1 },
//               shadowOpacity: 0.1,
//               shadowRadius: 2,
//             }}
//           >
//             <MaterialCommunityIcons
//               name={task.paused ? "pause-circle" : "pause-circle-outline"}
//               size={24}
//               color={task.paused ? colors.palette.primary600 : colors.palette.neutral500}
//             />
//           </TouchableOpacity>

//           {/* Edit button */}

//           <TouchableOpacity
//             onPress={() =>
//               navigate("EditHabit", {
//                 habitId: task.id,
//               })
//             }
//             activeOpacity={0.8}
//             style={{
//               padding: 4,
//               borderRadius: spacing.xs,
//               backgroundColor: colors.palette.neutral100,
//               elevation: 2,
//               shadowColor: "#000",
//               shadowOffset: { width: 0, height: 1 },
//               shadowOpacity: 0.1,
//               shadowRadius: 2,
//             }}
//           >
//             <MaterialCommunityIcons name="pencil" size={24} color={colors.palette.neutral500} />
//           </TouchableOpacity>

//           {/* Trash button */}

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
//             activeOpacity={0.8}
//             style={{
//               padding: 4,
//               borderRadius: spacing.xs,
//               backgroundColor: colors.palette.neutral100,
//               elevation: 2,
//               shadowColor: "#000",
//               shadowOffset: { width: 0, height: 1 },
//               shadowOpacity: 0.1,
//               shadowRadius: 2,
//             }}
//           >
//             <MaterialCommunityIcons
//               name="trash-can-outline"
//               size={24}
//               color={colors.palette.neutral500}
//             />
//           </TouchableOpacity>
//         </View>
//       </TouchableOpacity>
//     </>
//   )
// })

// // STYLES

// const $container: ViewStyle = {
//   paddingHorizontal: spacing.lg,
//   gap: spacing.xl,
//   paddingBottom: 60,
// }

// const $middleContainer: ViewStyle = {
//   gap: 5,
// }

// const $bottomContainer: ViewStyle = {
//   gap: 1,
// }

// colors.palette.primaryCompleted = "#304FFE"

// const $headingContainer: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 15 }

// const $emojiContainer: ViewStyle = {
//   backgroundColor: colors.background,
//   width: 48,
//   height: 48,
//   borderRadius: 99,
//   alignItems: "center",
//   justifyContent: "center",
// }

// const $emojiText: TextStyle = {
//   lineHeight: 0,
//   textAlign: "center",
// }

// const $circularProgressContainer: ViewStyle = { alignSelf: "center" }

// const $circularProgressChildren: ViewStyle = { alignItems: "center" }

// const $footerContainer: ViewStyle = {
//   backgroundColor: colors.background,
//   padding: spacing.xs,
//   borderRadius: 10,
//   flexDirection: "row",
//   justifyContent: "space-around",
//   alignItems: "center",
// }

// const $taskContainer: ViewStyle = {
//   backgroundColor: "#fff",
//   borderRadius: 10,
//   paddingVertical: 12,
//   paddingHorizontal: spacing.md,

//   borderWidth: 1,
//   borderColor: "#ccc",

//   elevation: 2,
//   shadowColor: "#000",
//   shadowOffset: { width: 0, height: 1 },
//   shadowOpacity: 0.1,
//   shadowRadius: 2,

//   flexDirection: "row",
//   alignItems: "center",
//   justifyContent: "space-between",
// }

// const $taskEmojiContainer: ViewStyle = {
//   backgroundColor: colors.background,
//   width: 44,
//   height: 44,
//   borderRadius: 99,
//   alignItems: "center",
//   justifyContent: "center",
// }

// const $checkInCardStyle: ViewStyle = {
//   backgroundColor: "#fff", // match taskContainer
//   borderRadius: 10,
//   paddingVertical: 12, // match taskContainer
//   paddingHorizontal: spacing.md, // match taskContainer
//   marginRight: spacing.sm,

//   borderWidth: 1,
//   borderColor: "#ccc", // match taskContainer

//   elevation: 2,
//   shadowColor: "#000",
//   shadowOffset: { width: 0, height: 1 },
//   shadowOpacity: 0.1, // match taskContainer
//   shadowRadius: 2,

//   width: layout.window.width * 0.5,
//   height: layout.window.height * 0.32,
//   // overflow: "hidden",
//   justifyContent: "space-between",
// }
