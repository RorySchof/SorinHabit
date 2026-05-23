// EDIT HABIT SCREEN

import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { View, ViewStyle, TextInput, TouchableOpacity, TextStyle } from "react-native"
import EmojiPicker from "rn-emoji-keyboard"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Text, Screen, Icon, Button, TextField } from "app/components"
import layout from "app/utils/layout"

import { HomeStackScreenProps } from "../navigators/types"
import { colors, spacing } from "../theme"
import { days, } from "app/screens/create-new-habit"
import { habitStore } from "app/models/habit-store"

interface EditHabitScreenProps extends HomeStackScreenProps<"EditHabit"> {}

//COMPONENTS


const reminders = [
  "At the study session time",
  "5 minutes before",
  "15 minutes before",
  "30 minutes before",
  "60 minutes before",
]



function parseTimeStringToDate(time: string): Date {
  const [hourStr, minuteStr] = time.split(":")
  const date = new Date()
  date.setHours(Number(hourStr))
  date.setMinutes(Number(minuteStr))
  date.setSeconds(0)
  return date
}

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

export const EditHabitScreen: FC<EditHabitScreenProps> = observer(function EditHabitScreen({
  navigation,
  route,
}) {
  const habitId = route.params.habitId
  const task = habitStore.habits.find((h) => h.id === habitId)

  if (!task) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
        <View style={$headerContainer}>
          <Icon icon="x" color={colors.text} onPress={() => navigation.goBack()} />
          <Text text="Edit habit" preset="heading" size="lg" />
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text text="Habit not found." preset="subheading" />
          <Button
            text="Go Back"
            style={$btn}
            textStyle={{ color: colors.palette.neutral100 }}
            onPress={() => navigation.goBack()}
          />
        </View>
      </Screen>
    )
  }

  const [open, setOpen] = React.useState(false)
  // const [reminder, setReminder] = React.useState("30 minutes before")
  const [reminder, setReminder] = React.useState(task?.reminder ?? "At the habit time")
  const [showReminderOptions, setShowReminderOptions] = React.useState(false)
  const [selectedEmoji, setSelectedEmoji] = React.useState(task?.emoji ?? "😂")
  const [colorPicked, setColorPicked] = React.useState(task?.color ?? "#ff0000")
  const [unit, setUnit] = React.useState(task?.unit ?? "times")
  const [showColorPicker, setShowColorPicker] = React.useState(false)
  const [habitTime, setHabitTime] = React.useState(() => {
    if (task?.time && task.time.includes(":")) {
      const parsed = parseTimeStringToDate(task.time)
      return isNaN(parsed.getTime()) ? new Date() : parsed
    }
    return new Date()
  })

  const [frequency, setFrequency] = React.useState(
    task?.frequency
      ? task.frequency
          .map((dayStr) => days.find((d) => d.day === dayStr))
          .filter((d): d is (typeof days)[0] => !!d)
      : [],
  )
  
  const [target, setTarget] = React.useState<number>(task?.target ?? 1)
  const renderBackdrop = React.useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={0} appearsOnIndex={1} />,
    [],
  )

  const handleSelectFrequency = (day: (typeof days)[0]) => {
    let newFrequency = [...frequency]
    const found = newFrequency.findIndex((f) => f.day === day.day)
    if (found === -1) {
      newFrequency.push(day)
    } else {
      newFrequency = newFrequency.filter((f) => f.day !== day.day)
    }
    setFrequency(newFrequency)
  }

  const [habitName, setHabitName] = React.useState(task?.name ?? "")

  //Handle Save

  // const handleSave = () => {
  //   if (task) {
  //     habitStore.updateHabit(task.id, {
  //       name: habitName, // ✅ now updates
  //       emoji: selectedEmoji,
  //       color: colorPicked,
  //       frequency: frequency.map((f) => f.day),
  //       time: habitTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  //       target,
  //       unit,
  //     })

  //     if (habitStore.saveHabits) {
  //       habitStore.saveHabits()
  //     }
  //   }

  //   navigation.navigate("Home")
  // }

  const handleSave = () => {
    if (task) {
      const normalizedTime = `${String(habitTime.getHours()).padStart(2, "0")}:${String(
        habitTime.getMinutes(),
      ).padStart(2, "0")}`
  
      habitStore.updateHabit(task.id, {
        name: habitName,
        emoji: selectedEmoji,
        color: colorPicked,
        frequency: frequency.map((f) => f.day),
        time: normalizedTime,   // ← FIXED
        target,
        unit,
        reminder,
      })
  
      if (habitStore.saveHabits) {
        habitStore.saveHabits()
      }
    }
  
    navigation.navigate("Home")
  }
  

// RENDER

return (


  <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
  <View style={$cardContainer}>

    <View style={$headerContainer}>
      <Icon icon="x" color={colors.text} onPress={() => navigation.goBack()} />
      <Text text="Edit study session" preset="heading" size="lg" />
    </View>

    <View style={$subheaderContainer}>
      <TouchableOpacity style={$pillContainer} onPress={() => setOpen(!open)}>
        <Text text={selectedEmoji} />
        <Text text="icon" preset="formLabel" size="md" />
      </TouchableOpacity>

      <EmojiPicker
        onEmojiSelected={(selected) => setSelectedEmoji(selected.emoji)}
        open={open}
        onClose={() => setOpen(!open)}
      />

      <TouchableOpacity
        style={$pillContainer}
        onPress={() => setShowColorPicker(!showColorPicker)}
      >
        <View style={[$pickedColor, { backgroundColor: colorPicked }]} />
        <Text text="color" preset="formLabel" size="md" />
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
                      borderColor: isSelected
                        ? colors.palette.primary500
                        : colors.palette.neutral500,
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

    <View style={$inputsContainer}>
      <TextField
        label="Study Session Name"
        placeholder="Read Chapter 3"
        required
        value={habitName}
        onChangeText={setHabitName}
      />

      <TextField
        label="Target"
        placeholder="e.g. 2"
        required
        value={String(target)}
        keyboardType="numeric"
        onChangeText={(text) => setTarget(Number(text))}
      />

      <TextField
        label="Unit"
        placeholder="e.g. minutes"
        value={unit}
        onChangeText={setUnit}
      />
    </View>

    <View style={$gap}>
      <View style={$frequencyContainer}>
        <Text preset="formLabel" style={$labelStyle}>
          Frequency <Text style={{ color: colors.palette.primary600 }}>*</Text>
        </Text>
      </View>

      <View style={$daysContainer}>
        {days.map((d, idx) => (
          <TouchableOpacity
            key={`day-${d.day}-${idx}`}
            style={[
              $dayContainerStyle,
              {
                backgroundColor: frequency.find((f) => f.day === d.day)
                  ? colors.palette.primary600
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
                  color: frequency.find((f) => f.day === d.day)
                    ? colors.palette.neutral100
                    : colors.text,
                },
              ]}
              size="md"
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>

    <View style={$gap}>
      <View style={$frequencyContainer}>
        <Text preset="formLabel" style={$labelStyle}>
          Study time <Text style={{ color: colors.palette.primary600 }}>*</Text>
        </Text>
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

    <View style={$gap}>
      <View style={$remindersContainer}>
        <Text preset="formLabel" text="Reminders" style={$labelStyle} />
      </View>

      <TouchableOpacity
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: spacing.sm,
        }}
        onPress={() => setShowReminderOptions((prev) => !prev)}
      >
        <Text text={reminder} />
        <Icon
          icon="caretRight"
          style={{ transform: [{ rotate: showReminderOptions ? "90deg" : "0deg" }] }}
        />
      </TouchableOpacity>

      {showReminderOptions && (
        <View style={{ marginTop: spacing.xs }}>
          {reminders.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => {
                setReminder(option)
                setShowReminderOptions(false)
              }}
              style={{ paddingVertical: spacing.xs }}
            >
              <Text
                text={option}
                style={{
                  color: option === reminder ? colors.palette.primary600 : colors.text,
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>

    <View style={$gap}>
      <Button
        style={$btn}
        textStyle={{ color: colors.palette.neutral100 }}
        onPress={handleSave}
      >
        Save changes
      </Button>
    </View>

  </View>
</Screen>





//   <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
//     <View style={$cardContainer}>
//       {/* Header */}
//       <View style={$headerContainer}>
//         <Icon icon="x" color={colors.text} onPress={() => navigation.goBack()} />
//         <Text text="Edit habit" preset="heading" size="lg" />
//       </View>

//       {/* Subheader: emoji + color pickers */}
//       <View style={$subheaderContainer}>
//         <TouchableOpacity style={$pillContainer} onPress={() => setOpen(!open)}>
//           <Text text={selectedEmoji} />
//           <Text text="icon" preset="formLabel" size="md" />
//         </TouchableOpacity>
//         <EmojiPicker
//           onEmojiSelected={(selected) => setSelectedEmoji(selected.emoji)}
//           open={open}
//           onClose={() => setOpen(!open)}
//         />

//         <TouchableOpacity
//           style={$pillContainer}
//           onPress={() => setShowColorPicker(!showColorPicker)}
//         >
//           <View style={[$pickedColor, { backgroundColor: colorPicked }]} />
//           <Text text="color" preset="formLabel" size="md" />
//         </TouchableOpacity>

//         {showColorPicker && (
//           <View style={$colorPickerCard}>
//             <View style={$swatchGrid}>
//               {presetColors.map((color) => {
//                 const isSelected = color === colorPicked
//                 return (
//                   <TouchableOpacity
//                     key={color}
//                     onPress={() => {
//                       setColorPicked(color)
//                       setShowColorPicker(false)
//                     }}
//                     style={[
//                       $swatch,
//                       {
//                         backgroundColor: color,
//                         borderColor: isSelected
//                           ? colors.palette.primary500
//                           : colors.palette.neutral500,
//                         borderWidth: isSelected ? 2 : 1,
//                         elevation: isSelected ? 4 : 2,
//                       },
//                     ]}
//                   />
//                 )
//               })}
//             </View>
//           </View>
//         )}
//       </View>

//       {/* Inputs: Habit Name, Target, Unit */}
//       <View style={$inputsContainer}>
//         <TextField
//           label="Habit Name"
//           placeholder="Go to the GYM"
//           required
//           value={habitName}
//           onChangeText={setHabitName}
//         />

//         <TextField
//           label="Target"
//           placeholder="e.g. 2"
//           required
//           value={String(target)}
//           keyboardType="numeric"
//           onChangeText={(text) => setTarget(Number(text))}
//         />

//         <TextField
//           label="Unit"
//           placeholder="e.g. times"
//           value={unit}
//           onChangeText={setUnit}
//         />
//       </View>

//       {/* Frequency */}
//       <View style={$gap}>
//         <View style={$frequencyContainer}>
//           <Text preset="formLabel" style={$labelStyle}>
//             Frequency <Text style={{ color: colors.palette.primary600 }}>*</Text>
//           </Text>
//         </View>

//         <View style={$daysContainer}>
//           {days.map((d, idx) => (
//             <TouchableOpacity
//               key={`day-${d.day}-${idx}`}
//              style={[
//   $dayContainerStyle,
//   {
//     backgroundColor: frequency.find((f) => f.day === d.day)
//       ? colors.palette.primary600
//       : colors.palette.neutral100,
//     borderWidth: 1,
//     borderColor: colors.palette.primary500, // 👈 thin blue outline
//   },
// ]}

//               onPress={() => handleSelectFrequency(d)}
//             >
//               <Text
//                 text={d.abbr}
//                 style={[
//                   $dayStyle,
//                   {
//                     color: frequency.find((f) => f.day === d.day)
//                       ? colors.palette.neutral100
//                       : colors.text,
//                   },
//                 ]}
//                 size="md"
//               />
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* Habit Time */}
//       <View style={$gap}>
//         <View style={$frequencyContainer}>
//           <Text preset="formLabel" style={$labelStyle}>
//             Habit Time <Text style={{ color: colors.palette.primary600 }}>*</Text>
//           </Text>
//         </View>
//         <DateTimePicker
//           testID="dateTimePicker"
//           style={$dateTimePicker}
//           value={habitTime}
//           mode="time"
//           is24Hour={false}
//           locale="en-US"
//           accentColor={colors.palette.neutral100}
//           onChange={(_, selectedDate) => setHabitTime(new Date(selectedDate!))}
//         />
//       </View>

//       {/* Reminders */}
      
//       {/* Reminders */}
// <View style={$gap}>
//   <View style={$remindersContainer}>
//     <Text preset="formLabel" text="Reminders" style={$labelStyle} />
//   </View>

//   {/* Reminder Selector */}
//   <TouchableOpacity
//     style={{
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       paddingVertical: spacing.sm,
//     }}
//     onPress={() => setShowReminderOptions((prev) => !prev)}
//   >
//     <Text text={reminder} />
//     <Icon
//       icon="caretRight"
//       style={{ transform: [{ rotate: showReminderOptions ? "90deg" : "0deg" }] }}
//     />
//   </TouchableOpacity>

//   {showReminderOptions && (
//     <View style={{ marginTop: spacing.xs }}>
//       {reminders.map((option) => (
//         <TouchableOpacity
//           key={option}
//           onPress={() => {
//             setReminder(option)
//             setShowReminderOptions(false)
//           }}
//           style={{ paddingVertical: spacing.xs }}
//         >
//           <Text
//             text={option}
//             style={{
//               color: option === reminder ? colors.palette.primary600 : colors.text,
//             }}
//           />
//         </TouchableOpacity>
//       ))}
//     </View>
//   )}
// </View>


//       {/* Save button */}
//       <View style={$gap}>
//         <Button style={$btn} textStyle={{ color: colors.palette.neutral100 }} onPress={handleSave}>
//           Save changes
//         </Button>
//       </View>
//     </View>
//   </Screen>
)
})

// STYLES

const $container: ViewStyle = {
  paddingHorizontal: spacing.md,
  gap: spacing.xl,
  paddingBottom: 70,
  // flex: 1,
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 24,
}

const $btn: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  borderWidth: 0,
  borderRadius: spacing.xs,
}

const $pillContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.xs,
  padding: spacing.xs,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
  width: layout.window.width * 0.25,
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
}

const $inputsContainer: ViewStyle = {
  // gap: 16,
   gap: spacing.md,
}

const $frequencyContainer: ViewStyle = {
  flexDirection: "row",
  gap: 4,
}

const $labelStyle: TextStyle = { marginBottom: spacing.xs }

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

const $gap: ViewStyle = {
  gap: spacing.sm,
  marginTop: spacing.sm,
}

const $dateTimePicker: ViewStyle = {
  alignSelf: "flex-start",
}

const $remindersContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
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
  // gap: spacing.md,
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
