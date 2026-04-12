// HOME SCREEN

import { observer } from "mobx-react-lite"
import React, { FC, useMemo, useState, useCallback, useEffect, useRef } from "react"
import {
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Alert,
} from "react-native"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { AnimatedCircularProgress } from "react-native-circular-progress"
import { Card, Text, Screen } from "app/components"
import layout from "app/utils/layout"
import { navigate } from "../navigators"
import { colors, spacing } from "../theme"
import { HomeNavProps, HomeStackScreenProps } from "app/navigators/types"
import { habitStore } from "app/models/habit-store"
import { CalendarProvider } from "react-native-calendars"
import { SafeAreaView } from "react-native-safe-area-context"
import { useFocusEffect } from "@react-navigation/native"
import WeekStrip from "app/components/WeekStrip"
import dayjs from "dayjs"
import { PanGestureHandler } from "react-native-gesture-handler"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Animated } from "react-native"
import * as Haptics from "expo-haptics"
import CheckMarkBlue from "assets/images/CheckMarkBlue.png"

//INTERFACE

interface HabitType {
  id: number
  emoji: string
  name: string
  time: string
  finished: boolean
  current?: number
  target?: number
  unit?: string
  color?: string
  frequency?: string[]
  category?: string
  createdAt?: string
}

// interface DayCardProps {
//   day: string
//   date: string
//   progress: number
// }

interface HomeScreenProps extends HomeStackScreenProps<"Home"> {}

interface HabitProps {
  task: HabitType
  navigation: HomeNavProps
}

const DEFAULT_HABIT_ICON = "✔️"

//COMPONENT

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen({ navigation }) {
  
  // STATE & REFS

  const today = new Date()
  const formattedToday = getLocalDateString(today)
  const [selected, setSelected] = useState(formattedToday)
  const [calendarKey, setCalendarKey] = useState(0)
  const scrollRef = useRef<ScrollView | null>(null)
  const [showSwipeHint, setShowSwipeHint] = useState(true)
  const scaleAnims = useRef<Record<string, Animated.Value>>({}).current
  const allHabits = habitStore.habits.filter((h) => !h.deleted)

  // SWIPE HINT LOGIC

  useEffect(() => {
    AsyncStorage.getItem("hasSeenSwipeHint").then((value) => {
      if (!value) {
        setShowSwipeHint(true)
      }
    })
  }, [])

  const dismissSwipeHint = () => {
    setShowSwipeHint(false)
    AsyncStorage.setItem("hasSeenSwipeHint", "true")
  }

  useEffect(() => {
    if (!showSwipeHint) return

    const timer = setTimeout(() => {
      dismissSwipeHint()
    }, 15000) // hide after 15 seconds

    return () => clearTimeout(timer)
  }, [showSwipeHint])


  // CALENDAR REFRESH ON FOCUS & DATE CHANGE

  useFocusEffect(
    useCallback(() => {
      setCalendarKey((prev) => prev + 1)
    }, []),
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCalendarKey((prev) => prev + 1)
    }, 50)

    return () => clearTimeout(timeout)
  }, [selected])

  // DATE HELPERS

  function parseLocalDate(dateString: string): Date {
    const [year, month, day] = dateString.split("-").map(Number)
    return new Date(year, month - 1, day)
  }

  const selectedDateObj = parseLocalDate(selected)

  function getLocalDateString(date: Date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const selectedLocalDateStr = getLocalDateString(selectedDateObj)

  const getTodayCount = (habitId: string) => {
    const today = selectedLocalDateStr
    const logEntry = habitStore.activityLog.find(
      (entry) => entry.habitId === habitId && entry.date === today,
    )
    return logEntry ? logEntry.count : 0
  }

  const selectedDay = selectedDateObj.toLocaleDateString("en-US", { weekday: "long" })
  const { habits, activityLog } = habitStore

  //  FILTER HABITS FOR SELECTED DAY

  // const filteredHabits = habits.filter((habit) => {
  //   if (!habit.createdAt || !habit.frequency) return false
  //   if (habit.deleted) return false

  //   // const habitLocalDateStr = habit.createdAt
  //   const habitLocalDateStr = habit.createdAt.split("T")[0]
  //   const includesDay = habit.frequency.includes(selectedDay)
  //   const isBeforeOrOnSelectedDate = habitLocalDateStr <= selectedLocalDateStr
  //   const shouldInclude = isBeforeOrOnSelectedDate && includesDay
  //   return shouldInclude
  // })


  const filteredHabits = habits.filter((habit) => {
    if (!habit.createdAt || !habit.frequency) return false
    if (habit.deleted) return false
  
    const habitLocalDateStr = (habit.createdAt || "").split("T")[0]
    const includesDay = habit.frequency.includes(selectedDay)
    const isBeforeOrOnSelectedDate = habitLocalDateStr <= selectedLocalDateStr
  
    return isBeforeOrOnSelectedDate && includesDay
  })

  //  MARKED DATES FOR CALENDAR

  const markedDates: Record<string, any> = {}
  filteredHabits.forEach((habit) => {
    const dateKey = habit.createdAt!.split("T")[0]
    markedDates[dateKey] = {
      marked: true,
      // dotColor: habit.color || colors.palette.primary400,
      dotColor: "#304FFE",
    }
  })

  // Highlight the selected date

  markedDates[selected] = {
    ...(markedDates[selected] || {}),
    selected: true,
    selectedColor: "#304FFE",
  }

  // CHECK-IN CARDS (HEALTH CATEGORY)

  const checkIns = filteredHabits
    .filter((habit) => habit.category === "health")
    .map((habit) => {
      const todayCount = getTodayCount(habit.id)
      return {
        id: habit.id,
        emoji: habit.emoji || "💧",
        title: habit.name,
        name: habit.unit || "",
        amount: `${todayCount}/${habit.target}`,
        color: habit.color || colors.palette.primary300,
        fill: (todayCount / habit.target) * 100,
      }
    })

  // Initialize animations for check-ins
  ;(checkIns ?? []).forEach((checkIn) => {
    if (!scaleAnims[checkIn.id]) {
      scaleAnims[checkIn.id] = new Animated.Value(1)
    }
  })

  // RENDER SECTION

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* CALENDAR NAVBAR -------------------------------------------------- */}

      <View
        style={{
          height: 60,
          paddingHorizontal: spacing.md,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: colors.palette.neutral300,
          overflow: "hidden",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Previous Week */}
        <TouchableOpacity
          onPress={() => setSelected(dayjs(selected).subtract(1, "week").format("YYYY-MM-DD"))}
          style={{ paddingHorizontal: 10 }}
        >
          <Text size="md" weight="bold" style={{ color: "#304FFE" }}>
            {"‹"}
          </Text>
        </TouchableOpacity>

        {/* Week Strip */}
        <CalendarProvider date={selected} onDateChanged={setSelected}>
          <WeekStrip selectedDate={selected} onSelectDate={(date) => setSelected(date)} />
        </CalendarProvider>

        {/* Next Week */}
        <TouchableOpacity
          onPress={() => setSelected(dayjs(selected).add(1, "week").format("YYYY-MM-DD"))}
          style={{ paddingHorizontal: 10 }}
        >
          <Text size="md" weight="bold" style={{ color: "#304FFE" }}>
            {"›"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MAIN SCROLL AREA -------------------------------------------------- */}

      <Screen preset="scroll" safeAreaEdges={["bottom"]} contentContainerStyle={$container}>
        {/* CHECK-IN CARDS -------------------------------------------------- */}

        <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
          <Text tx="homeScreen.check_in" preset="subheading" />

          {/* Swipe Hint */}
          {showSwipeHint && (
            <Pressable onPress={dismissSwipeHint}>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.palette.neutral500,
                  marginTop: -4,
                  marginBottom: spacing.xs,
                  marginLeft: 2,
                }}
              >
                swipe up/down to adjust ×
              </Text>
            </Pressable>
          )}
          {/* Horizontal Scroll of Check-In Cards */}
          <ScrollView
            ref={scrollRef} // 👈 attach here
            contentContainerStyle={$middleContainer}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
            directionalLockEnabled={true}
          >
            {/* INDIVIDUAL CHECK-IN CARD ---------------------------------- */}

            {checkIns.map((checkIn, i) => {
              const matchedHabit = filteredHabits.find((h) => h.name === checkIn.title)

              const scaleAnim = scaleAnims[checkIn.id]

              const triggerPulse = () => {
                scaleAnim.setValue(1)
                Animated.sequence([
                  Animated.timing(scaleAnim, {
                    toValue: 1.08,
                    duration: 120,
                    useNativeDriver: true,
                  }),
                  Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 120,
                    useNativeDriver: true,
                  }),
                ]).start()
              }

              const triggerCompletionPulse = () => {
                scaleAnim.setValue(1)
                Animated.sequence([
                  Animated.timing(scaleAnim, {
                    toValue: 1.35,
                    duration: 160,
                    useNativeDriver: true,
                  }),
                  Animated.timing(scaleAnim, {
                    toValue: 0.97,
                    duration: 90,
                    useNativeDriver: true,
                  }),
                  Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 90,
                    useNativeDriver: true,
                  }),
                ]).start()
              }

              return (
                <PanGestureHandler
                  key={`${checkIn.title}-${i}`}
                  simultaneousHandlers={scrollRef}
                  activeOffsetX={[-40, 40]}
                  activeOffsetY={[-5, 5]}
                  onEnded={({ nativeEvent }) => {
                    if (!matchedHabit) return
                    const todayCount = getTodayCount(matchedHabit.id)
                    const isAtMax = todayCount >= matchedHabit.target
                    const isAtMin = todayCount <= 0

                    if (nativeEvent.translationY < -30 && !isAtMax) {
                      const isCompleting = todayCount + 1 === matchedHabit.target

                      if (isCompleting) {
                        triggerCompletionPulse()
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                      } else {
                        triggerPulse()
                      }

                      habitStore.incrementHabit(matchedHabit.id, selected)
                    } else if (nativeEvent.translationY > 30 && !isAtMin) {
                      habitStore.decrementHabit(matchedHabit.id, selected)
                    }
                  }}
                >
                  <Card
                    style={$checkInCardStyle}
                    verticalAlignment="space-between"
                    wrapperStyle={{ padding: spacing.sm }}
                    HeadingComponent={
                      <View style={$headingContainer}>
                        <View style={$emojiContainer}>
                          {/* <Text text={checkIn.emoji} size="xl" style={$emojiText} /> */}
                          {checkIn.emoji === DEFAULT_HABIT_ICON ? (
                            <Image source={CheckMarkBlue} style={$habitIconImage} />
                          ) : (
                            <Text text={checkIn.emoji} size="xl" style={$emojiText} />
                          )}
                        </View>
                        <Text
                          text={checkIn.title}
                          size="md"
                          numberOfLines={2}
                          ellipsizeMode="tail"
                          style={{ flexShrink: 1, textAlign: "center" }}
                        />
                      </View>
                    }
                    ContentComponent={
                      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <AnimatedCircularProgress
                          size={95}
                          width={10}
                          fill={checkIn.fill}
                          rotation={360}
                          tintColor={checkIn.color}
                          backgroundColor={colors.palette.neutral200}
                          style={$circularProgressContainer}
                        >
                          {() => (
                            <View style={$circularProgressChildren}>
                              <Text text={checkIn.amount} size="md" />
                              <Text
                                text={checkIn.name}
                                size="xs"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{ maxWidth: 70, textAlign: "center" }}
                              />
                            </View>
                          )}
                        </AnimatedCircularProgress>
                      </Animated.View>
                    }
                    FooterComponent={
                      <View style={$footerContainer}>
                        {(() => {
                          if (!matchedHabit) return null
                          const todayCount = getTodayCount(matchedHabit.id)
                          const isAtMax = todayCount >= matchedHabit.target
                          const isAtMin = todayCount <= 0
                          return (
                            <>
                              <Pressable
                                disabled={isAtMin}
                                onPress={() => habitStore.decrementHabit(matchedHabit.id, selected)}
                              >
                                <MaterialCommunityIcons
                                  name="minus"
                                  color={isAtMin ? "gray" : colors.palette.neutral500}
                                  size={24}
                                />
                              </Pressable>
                              <Text text="|" style={{ color: colors.palette.neutral500 }} />
                              <Pressable
                                disabled={isAtMax}
                                onPress={() => habitStore.incrementHabit(matchedHabit.id, selected)}
                              >
                                <MaterialCommunityIcons
                                  name="plus"
                                  color={isAtMax ? "gray" : colors.palette.neutral500}
                                  size={24}
                                />
                              </Pressable>
                            </>
                          )
                        })()}
                      </View>
                    }
                  />
                </PanGestureHandler>
              )
            })}
          </ScrollView>
        </View>

        {/* TODAY'S HABIT LIST -------------------------------------------------- */}

        <View style={{ gap: spacing.md }}>
          <Text tx="homeScreen.today" preset="subheading" />
          <View style={$bottomContainer}>
            {allHabits.length === 0 ? (
              //  CASE 1: Brand-new user — no habits exist
              <View style={$emptyStateContainer}>
                <View style={$emojiContainer}>
                  <Text text="🌱" size="xl" style={$emojiText} />
                </View>

                <Text
                  text="Create your first habit"
                  preset="heading"
                  size="md"
                  style={{ textAlign: "center", color: colors.text }}
                />

                <Text
                  text="Tap below to create your first habit and start your streak."
                  preset="default"
                  size="sm"
                  style={{
                    textAlign: "center",
                    color: colors.palette.neutral600,
                  }}
                />

                <TouchableOpacity
                  onPress={() => navigation.navigate("CreateNewHabit")}
                  style={{
                    marginTop: spacing.md,
                    backgroundColor: colors.palette.primary600,
                    borderRadius: spacing.xs,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.lg,
                  }}
                >
                  <Text
                    text="Create a new habit"
                    preset="bold"
                    size="md"
                    style={{ color: colors.palette.neutral100 }}
                  />
                </TouchableOpacity>
              </View>
            ) : filteredHabits.length === 0 ? (
              // CASE 2: User has habits, but none scheduled today
              <View style={$emptyStateContainer}>
                <View style={$emojiContainer}>
                  <Text text="🗓️" size="xl" style={$emojiText} />
                </View>

                <Text
                  text="No habits scheduled for today"
                  preset="heading"
                  size="md"
                  style={{ textAlign: "center", color: colors.text }}
                />

                <TouchableOpacity
                  onPress={() => navigation.navigate("CreateNewHabit")}
                  style={{
                    marginTop: spacing.md,
                    backgroundColor: colors.palette.primary600,
                    borderRadius: spacing.xs,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.lg,
                  }}
                >
                  <Text
                    text="Create a new habit"
                    preset="bold"
                    size="md"
                    style={{ color: colors.palette.neutral100 }}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              // CASE 3: Normal habit list for today

              filteredHabits.map((habit, idx) => {
                const todayCount = getTodayCount(habit.id)
                const transformedHabit = {
                  id: habit.id,
                  name: habit.name || "Unnamed Habit",
                  emoji: habit.emoji || "🔥",
                  time: habit.time || "08:00",
                  current: todayCount,
                  target: habit.target || 1,
                  finished: habit.finished ?? false,
                  paused: habit.paused,
                }
                return (
                  <View key={`${habit.id}-${idx}`} style={{ marginBottom: 12 }}>
                    <Habit task={transformedHabit} navigation={navigation} />
                  </View>
                )
              })
            )}
          </View>
        </View>
      </Screen>
    </SafeAreaView>
  )
})

// HABIT ROW COMPONENT

export const Habit = observer(function Habit({ task, navigation }: HabitProps) {
  // STATE DERIVED VALUES --------------------------------------------------
  const isCompleted = Number(task.current ?? 0) >= Number(task.target ?? 1)

  // RENDER --------------------------------------------------
  return (
    <>
      <TouchableOpacity style={[$taskContainer, { opacity: task.finished ? 0.6 : 1 }]}>
        {/* LEFT SIDE: EMOJI + NAME ---------------------------------------- */}
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View style={$taskEmojiContainer}>
            {task.emoji === DEFAULT_HABIT_ICON ? (
              <Image source={CheckMarkBlue} style={$habitIconImage} />
            ) : (
              <Text text={task.emoji} size="lg" style={$emojiText} />
            )}
          </View>
          <Text
            text={task.name}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              flex: 1,
              marginRight: 4,
              marginLeft: 4,
            }}
          />
        </View>

        {/* RIGHT SIDE: ACTION ICONS ---------------------------------------- */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexShrink: 0,
            gap: 12,
          }}
        >
          {/* Checkmark */}
          {isCompleted ? (
            <MaterialCommunityIcons name="check-circle" size={24} color="#304FFE" />
          ) : (
            <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color="#ccc" />
          )}

          {/* Pause button */}
          <TouchableOpacity
            onPress={() => habitStore.togglePauseHabit(task.id)}
            activeOpacity={0.8}
            style={{
              padding: 4,
              borderRadius: spacing.xs,
              backgroundColor: colors.palette.neutral100,
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            <MaterialCommunityIcons
              name={task.paused ? "pause-circle" : "pause-circle-outline"}
              size={24}
              color={task.paused ? colors.palette.primary600 : colors.palette.neutral500}
            />
          </TouchableOpacity>

          {/* Edit button */}
          <TouchableOpacity
            onPress={() =>
              navigate("EditHabit", {
                habitId: task.id,
              })
            }
            activeOpacity={0.8}
            style={{
              padding: 4,
              borderRadius: spacing.xs,
              backgroundColor: colors.palette.neutral100,
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            <MaterialCommunityIcons name="pencil" size={24} color={colors.palette.neutral500} />
          </TouchableOpacity>

          {/* Delete button */}
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Delete Habit",
                `Are you sure you want to delete "${task.name}"?`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => habitStore.removeHabit(task.id),
                  },
                ],
                { cancelable: true },
              )
            }
            activeOpacity={0.8}
            style={{
              padding: 4,
              borderRadius: spacing.xs,
              backgroundColor: colors.palette.neutral100,
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={24}
              color={colors.palette.neutral500}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </>
  )
})

// STYLES --------------------------------------------------

// Layout Containers ---------------------------------------

const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  gap: spacing.xl,
  paddingBottom: 60,
}

const $middleContainer: ViewStyle = {
  gap: 5,
}

const $bottomContainer: ViewStyle = {
  gap: 1,
}
// Check-In Card Styles ------------------------------------

const $headingContainer: ViewStyle = { 
  flexDirection: "row", 
  alignItems: "center", 
  gap: 15 
}

const $emojiContainer: ViewStyle = {
  backgroundColor: colors.background,
  width: 48,
  height: 48,
  borderRadius: 99,
  alignItems: "center",
  justifyContent: "center",
}

const $emojiText: TextStyle = {
  lineHeight: 0,
  textAlign: "center",
}

const $circularProgressContainer: ViewStyle = { 
  alignSelf: "center" 
}

const $circularProgressChildren: ViewStyle = { 
  alignItems: "center"
 }

const $footerContainer: ViewStyle = {
  backgroundColor: colors.background,
  padding: spacing.xs,
  borderRadius: 10,
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
}

const $checkInCardStyle: ViewStyle = {
  backgroundColor: "#fff",
  borderRadius: 10,
  paddingVertical: 12,
  paddingHorizontal: spacing.md,
  marginRight: spacing.sm,
  borderWidth: 1,
  borderColor: "#ccc",
  elevation: 2,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  width: layout.window.width * 0.5,
  height: layout.window.height * 0.32,
  justifyContent: "space-between",
}

// Habit Row Styles ----------------------------------------

const $taskContainer: ViewStyle = {
  backgroundColor: "#fff",
  borderRadius: 10,
  paddingVertical: 12,
  paddingHorizontal: spacing.md,

  borderWidth: 1,
  borderColor: "#ccc",

  elevation: 2,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,

  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $taskEmojiContainer: ViewStyle = {
  backgroundColor: colors.background,
  width: 44,
  height: 44,
  borderRadius: 99,
  alignItems: "center",
  justifyContent: "center",
}

// Habit Icon (Image) --------------------------------------

const $habitIconImage: ImageStyle = {
  width: 48,
  height: 48,
  resizeMode: "contain",
}

// Empty state styles

const $emptyStateContainer: ViewStyle = {
  backgroundColor: "#fff",
  borderRadius: 10,
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing.lg,
  borderWidth: 1,
  borderColor: "#ccc",
  elevation: 2,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm,
}