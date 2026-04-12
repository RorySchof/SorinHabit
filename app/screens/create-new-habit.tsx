// CREATE NEW HABIT --------------------------------------------------

import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { View, ViewStyle, TouchableOpacity, TextStyle, Image, ImageStyle } from "react-native"
import EmojiPicker from "rn-emoji-keyboard"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Text, Screen, Icon, Button, TextField } from "app/components"
import { HomeStackScreenProps } from "../navigators/types"
import { colors, spacing } from "../theme"
import { habitStore } from "app/models/habit-store"
import { useFocusEffect } from "@react-navigation/native"
import CheckMarkBlue from "assets/images/CheckMarkBlue.png"


import { syncHabitToSupabase } from "app/services/api/habit-sync"

// CONSTANTS --------------------------------------------------

const DEFAULT_HABIT_ICON = "✔️"

export const days = [
  { day: "Sunday", abbr: "S" },
  { day: "Monday", abbr: "M" },
  { day: "Tuesday", abbr: "T" },
  { day: "Wednesday", abbr: "W" },
  { day: "Thursday", abbr: "T" },
  { day: "Friday", abbr: "F" },
  { day: "Saturday", abbr: "S" },
]

export const presetColors = [
  "#FF0000", // red
  "#00FF00", // green
  "#0000FF", // blue
  "#FFFF00", // yellow
  "#800080", // purple
  "#000000", // black
  "#FFFFFF", // white
  "#FFA500", // orange
  "#A52A2A", // brown
]

const REMINDER_OPTIONS = [
  "At the habit time",
  "5 minutes before",
  "10 minutes before",
  "15 minutes before",
  "30 minutes before",
]

// INTERFACE --------------------------------------------------

interface CreateNewHabitScreenProps extends HomeStackScreenProps<"CreateNewHabit"> {}

// SCREEN -----------------------------------------------------

export const CreateNewHabitScreen: FC<CreateNewHabitScreenProps> = observer(
  function CreateNewHabitScreen({ navigation }) {
    // STATE --------------------------------------------------
    const [open, setOpen] = React.useState(false)
    const [reminder, setReminder] = React.useState("")
    const [selectedEmoji, setSelectedEmoji] = React.useState(DEFAULT_HABIT_ICON)
    const [colorPicked, setColorPicked] = React.useState(colors.palette.primary500)
    const [showColorPicker, setShowColorPicker] = React.useState(false)
    const [habitTime, setHabitTime] = React.useState(new Date())
    const [habitDate, setHabitDate] = React.useState(new Date())
    const [frequency, setFrequency] = React.useState<string[]>([])
    const [name, setName] = React.useState("")
    const [category, setCategory] = React.useState("health") // double check health here, Why? seems sketchy
    const [target, setTarget] = React.useState(0)
    const [unit, setUnit] = React.useState("")
    const [alpha, setAlpha] = React.useState(1)
    const [showReminderList, setShowReminderList] = React.useState(false)

    // RESET FORM ON FOCUS -----------------------------------
    useFocusEffect(
      React.useCallback(() => {
        setOpen(false)
        setReminder("")
        setSelectedEmoji(DEFAULT_HABIT_ICON)
        setColorPicked(colors.palette.primary500)
        setHabitTime(new Date())
        setHabitDate(new Date())
        setFrequency([])
        setName("")
        setCategory("health")
        setTarget(0)
        setUnit("")
      }, []),
    )

    // FREQUENCY SELECTION ------------------------------------
    const handleSelectFrequency = (day: (typeof days)[0]) => {
      if (frequency.includes(day.day)) {
        setFrequency(frequency.filter((d) => d !== day.day))
      } else {
        setFrequency([...frequency, day.day])
      }
    }

    // CREATE HABIT ------------------------------------------
    const handleCreateHabit = () => {
      // Mandatory field checks
      if (!name.trim()) {
        alert("Please enter a habit name")
        return
      }
      if (!target || target <= 0) {
        alert("Please set a target greater than 0")
        return
      }
      if (!frequency || frequency.length === 0) {
        alert("Please select at least one scheduled day")
        return
      }
      if (!habitTime) {
        alert("Please choose a habit start time")
        return
      }
      if (!habitDate) {
        alert("Please choose a habit start date")
        return
      }
      const newHabit = habitStore.addHabit({
        name,
        emoji: selectedEmoji,
        date: habitDate.toLocaleDateString("en-CA"),
        time: habitTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        category,
        target: target || 1,
        unit,
        color: colorPicked,
        frequency,
        reminder: reminder || undefined,
      })

//       // ⭐ Debug: what did we actually create?
// console.log("NEW HABIT CREATED LOCALLY:", newHabit)

//       // ⭐ Sync to Supabase
//   syncHabitToSupabase(newHabit)

      navigation.goBack()
    }

    // COLOR SWATCH GRID --------------------------------------
    const generateSwatchGrid = () => {
      const swatches = []
      for (let h = 0; h <= 330; h += 30) {
        for (let l = 30; l <= 70; l += 10) {
          swatches.push(`hsl(${h}, 80%, ${l}%)`)
        }
      }
      return swatches
    }

    const presetColors = generateSwatchGrid()

    // RENDER --------------------------------------------------

    return (
      <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
        {/* HEADER -------------------------------------------------- */}
        <View style={$cardContainer}>
          <View style={$headerContainer}>
            <Icon icon="back" color={colors.text} onPress={() => navigation.goBack()} />
            <Text text="Create Habit" preset="heading" size="lg" />
          </View>

          {/* EMOJI + COLOR PICKERS ---------------------------------- */}
          <View style={$subheaderContainer}>
            <TouchableOpacity style={$pillContainer} onPress={() => setOpen(!open)}>
              {selectedEmoji === DEFAULT_HABIT_ICON ? (
                <Image source={CheckMarkBlue} style={$defaultIconImage} />
              ) : (
                <Text text={selectedEmoji} />
              )}
            </TouchableOpacity>

            <EmojiPicker
              onEmojiSelected={(selected) => {
                setSelectedEmoji(selected.emoji)
                setOpen(false)
              }}
              open={open}
              onClose={() => setOpen(false)}
            />

            <TouchableOpacity
              style={$pillContainer}
              onPress={() => setShowColorPicker(!showColorPicker)}
            >
              <View style={[$pickedColor, { backgroundColor: colorPicked }]} />
            </TouchableOpacity>

            {showColorPicker && (
              <View style={$colorPickerCard}>
                <View style={$swatchGrid}>
                  {presetColors.map((color) => {
                    const isSelected = color === colorPicked
                    return (
                      <TouchableOpacity
                        key={color}
                        onPress={() => {
                          setColorPicked(color)
                          setShowColorPicker(false)
                        }}
                        style={[
                          $swatch,
                          {
                            backgroundColor: color,
                            borderColor: isSelected ? "white" : colors.palette.neutral500,
                            borderWidth: isSelected ? 2 : 1,
                            elevation: isSelected ? 4 : 2,
                          },
                        ]}
                      />
                    )
                  })}
                </View>
              </View>
            )}
          </View>

          {/* INPUTS -------------------------------------------------- */}
          <View style={$inputsContainer}>
            <TextField
              label="Habit Name"
              placeholder="Go to the GYM"
              value={name}
              onChangeText={setName}
              required
            />

            <TextField
              label="Target"
              placeholder="0"
              value={target === 0 ? "" : target.toString()}
              onChangeText={(text) => setTarget(Number(text) || 0)}
              keyboardType="numeric"
              required
            />

            <TextField label="Unit" placeholder="times" value={unit} onChangeText={setUnit} />
          </View>

          {/* FREQUENCY -------------------------------------------------- */}
          <View style={[$gap, { marginTop: spacing.md }]}>
            <View style={$frequencyContainer}>
              <Text preset="formLabel" text="Frequency" style={$labelStyle} />
              <Text text="*" style={$labelRequired} />
            </View>
            <View style={$daysContainer}>
              {days.map((d, idx) => (
                <TouchableOpacity
                  key={`day-${d.day}-${idx}`}
                  style={[
                    $dayContainerStyle,
                    {
                      backgroundColor: frequency.includes(d.day)
                        ? colors.palette.primary500
                        : colors.palette.neutral100,
                      borderWidth: 1,
                      borderColor: colors.palette.primary500,
                    },
                  ]}
                  onPress={() => handleSelectFrequency(d)}
                >
                  <Text
                    text={d.abbr}
                    style={[
                      $dayStyle,
                      {
                        color: frequency.includes(d.day) ? colors.palette.neutral100 : colors.text,
                      },
                    ]}
                    size="md"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* HABIT TIME -------------------------------------------------- */}
          <View style={[$gap, { marginTop: spacing.md }]}>
            <View style={$frequencyContainer}>
              <Text preset="formLabel" text="Habit time" style={$labelStyle} />
              <Text text="*" style={$labelRequired} />
            </View>

            <DateTimePicker
              testID="dateTimePicker"
              style={$dateTimePicker}
              value={habitTime}
              mode="time"
              is24Hour={false}
              locale="en-US"
              accentColor={colors.palette.neutral100}
              onChange={(_, selectedDate) => setHabitTime(new Date(selectedDate!))}
            />
          </View>

          {/* HABIT DATE -------------------------------------------------- */}
          <View style={[$gap, { marginTop: spacing.md }]}>
            <View style={$frequencyContainer}>
              <Text preset="formLabel" text="Habit date" style={$labelStyle} />
              <Text text="*" style={$labelRequired} />
            </View>
            <DateTimePicker
              testID="datePicker"
              style={$dateTimePicker}
              value={habitDate}
              mode="date"
              locale="en-US"
              accentColor={colors.palette.neutral100}
              onChange={(_, selectedDate) => {
                if (selectedDate) {
                  setHabitDate(new Date(selectedDate))
                }
              }}
            />
          </View>

          {/* REMINDERS -------------------------------------------------- */}
          <View style={[$gap, { marginTop: spacing.md }]}>
            <View style={$frequencyContainer}>
              <Text preset="formLabel" text="Reminders" style={$labelStyle} />
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: colors.palette.neutral200, // ✅ use grey tone like DateTimePicker
                borderColor: colors.palette.neutral300,
                borderWidth: 1,
                borderRadius: spacing.xs,
                height: 44,
                paddingHorizontal: spacing.sm,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                alignSelf: "stretch", // ✅ match picker width
              }}
              onPress={() => setShowReminderList((s) => !s)}
            >
              <Text
                text={reminder || "Select reminder…"}
                size="md"
                style={{ color: reminder ? colors.text : colors.palette.neutral500 }}
              />
              <Icon
                icon="caretRight"
                style={{ transform: [{ rotate: showReminderList ? "270deg" : "90deg" }] }}
              />
            </TouchableOpacity>

            {showReminderList && (
              <View
                style={{
                  backgroundColor: colors.palette.neutral200, // ✅ grey background
                  borderColor: colors.palette.neutral300,
                  borderWidth: 1,
                  borderRadius: spacing.xs,
                  marginTop: spacing.xs,
                  overflow: "hidden",
                }}
              >
                {REMINDER_OPTIONS.map((option) => {
                  const isSelected = reminder === option
                  return (
                    <TouchableOpacity
                      key={option}
                      style={{
                        paddingVertical: spacing.xs,
                        paddingHorizontal: spacing.sm,
                        backgroundColor: isSelected
                          ? colors.palette.primary500
                          : colors.palette.neutral200,
                      }}
                      onPress={() => {
                        setReminder(option)
                        setShowReminderList(false)
                      }}
                    >
                      <Text
                        text={option}
                        size="md"
                        style={{ color: isSelected ? colors.palette.neutral100 : colors.text }}
                      />
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}
          </View>

          {/* CREATE BUTTON -------------------------------------------------- */}
          <View>
            <Button
              style={[$btn, { marginTop: spacing.lg }]}
              textStyle={{ color: colors.palette.neutral100 }}
              onPress={handleCreateHabit}
            >
              Create habit
            </Button>
          </View>
        </View>
      </Screen>
    )
  },
)

// STYLES

const $container: ViewStyle = {
  paddingHorizontal: spacing.md,
  gap: spacing.xl,
  paddingBottom: 70,
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 24,
}

const $btn: ViewStyle = {
  backgroundColor: colors.palette.primary500,
  borderWidth: 0,
  borderRadius: spacing.xs,
}

const $pillContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.xs,
  padding: spacing.xs,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  width: 56,
  height: 56,
  gap: spacing.xs,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  elevation: 2,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
}

const $subheaderContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "flex-start",
  flexWrap: "wrap",
  gap: spacing.md, 
  marginVertical: spacing.md, 
}
const $pickedColor: ViewStyle = {
  width: 18,
  height: 18,
  borderRadius: 99,
  borderWidth: 1,
  borderColor: colors.palette.neutral300, 
}

const $inputsContainer: ViewStyle = {
  gap: 16,
}

const $frequencyContainer: ViewStyle = {
  flexDirection: "row",
  gap: 4,
}

const $labelStyle: TextStyle = { marginBottom: spacing.xs }

const $labelRequired: TextStyle = {
  color: colors.palette.primary500, 
}

const $daysContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
}
const $dayContainerStyle: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 99,
  width: 44,
  height: 44,
  justifyContent: "center",
  alignItems: "center",
}

const $dayStyle: TextStyle = {
  lineHeight: 0,
  textAlign: "center",
}

const $gap: ViewStyle = { gap: 8 }

const $dateTimePicker: ViewStyle = {
  alignSelf: "flex-start",
}

const $remindersContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $reminder: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.sm,
  borderRadius: spacing.xs,
  marginTop: spacing.xs,
}

const $cardContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100, 
  borderRadius: spacing.sm,
  padding: spacing.md,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 6, 
  marginBottom: spacing.lg,
  paddingBottom: spacing.xxl,
}

const $colorPickerCard: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: spacing.sm,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 6,
  marginTop: spacing.sm,
}

const $swatchGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  columnGap: 1,
  rowGap: 1,
  paddingVertical: spacing.md,
}

const $swatch: ViewStyle = {
  width: 28,
  height: 28,
  borderRadius: 0,
  borderWidth: 0,
  elevation: 2,
}

const $defaultIconImage: ImageStyle = {
  width: 48,
  height: 48,
  resizeMode: "contain",
  marginRight: spacing.xs,
}
