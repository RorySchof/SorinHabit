// MANAGE HABITS --------------------------------------------------

import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Alert,
  Image,
  ImageStyle,
} from "react-native"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { Text, Screen, Icon, Button } from "app/components"
import layout from "app/utils/layout"
import { colors, spacing } from "../theme"
import { HomeStackScreenProps } from "app/navigators/types"
import { habitStore } from "app/models/habit-store"
import CheckMarkBlue from "assets/images/CheckMarkBlue.png"

const DEFAULT_HABIT_ICON = "✔️"

// INTERFACE -----------------------------------------------------

interface CreateHabitScreenProps extends HomeStackScreenProps<"CreateHabit"> {}

// RENDER --------------------------------------------------------

export const CreateHabitScreen: FC<CreateHabitScreenProps> = observer(function CreateHabitScreen({
  navigation,
}) {
  const userHabits = habitStore.habits.filter((h) => !h.deleted)

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
      <View style={$headerContainer}>
        <Icon icon="x" color={colors.text} onPress={() => navigation.goBack()} />
        <Text text="Habit List" preset="heading" size="lg" />
      </View>

      <View style={$allHabitsContainer}>
        {userHabits.length > 0 ? (
          userHabits.map((habit, idx) => (
            <View key={`habit-${habit.id}-${idx}`} style={$habitContainer}>
              <View style={$habitLeftContainer}>
                <View style={$emojiContainer}>
                  {habit.emoji === DEFAULT_HABIT_ICON ? (
                    <Image source={CheckMarkBlue} style={$habitIconImage} />
                  ) : (
                    <Text text={habit.emoji ?? "🔥"} size="lg" style={$emojiText} />
                  )}
                </View>

                <Text
                  text={habit.name}
                  preset="formLabel"
                  size="md"
                  style={$habitNameText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                />
              </View>

              <View style={$habitRightContainerRow}>
                {/* Edit */}

                <TouchableOpacity
                  onPress={() => navigation.navigate("EditHabit", { habitId: habit.id })}
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
                    name="pencil"
                    size={24}
                    color={colors.palette.primary600}
                  />
                </TouchableOpacity>

                {/* Pause */}

                <TouchableOpacity
                  onPress={() => habitStore.togglePauseHabit(habit.id)}
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
                    name={habit.paused ? "pause-circle" : "pause-circle-outline"}
                    size={24}
                    color={habit.paused ? colors.palette.primary600 : colors.palette.neutral500}
                  />
                </TouchableOpacity>

                {/* Delete */}

                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "Delete Habit",
                      `Are you sure you want to delete "${habit.name}"?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => {
                            habitStore.removeHabit(habit.id)
                          },
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
            </View>
          ))
        ) : (
          <Text text="No habits found" preset="formLabel" size="md" />
        )}

        {/* Add new habit CTA */}

        <View style={[$habitLeftContainer, { width: layout.window.width * 0.8 }]}>
          <View style={[$habitRightContainer, { backgroundColor: colors.palette.neutral100 }]}>
            <MaterialCommunityIcons
              name="plus"
              color={colors.palette.primary600}
              size={28}
              onPress={() => navigation.navigate("CreateNewHabit")}
            />
          </View>
          <Text text="Couldn’t find anything? Create a new habit" preset="formLabel" size="md" />
        </View>
      </View>

      {/* DONE BUTTON -------------------------------------------------- */}
      <Button
        style={$btn}
        textStyle={{ color: colors.palette.neutral100 }}
        onPress={() => navigation.navigate("Home")}
      >
        Done
      </Button>
    </Screen>
  )
})

// STYLES --------------------------------------------------------

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

const $allHabitsContainer: ViewStyle = {
  gap: 16,
}

const $habitContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.sm,
  borderRadius: spacing.xs,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  elevation: 6, // Android
  shadowColor: "#000", // iOS
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
}

const $habitLeftContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 15,
}

const $habitRightContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  width: 40,
  height: 40,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 99,
}

const $habitRightContainerRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
}

const $emojiContainer: ViewStyle = {
  backgroundColor: colors.background,
  width: 44,
  height: 44,
  borderRadius: 99,
  alignItems: "center",
  justifyContent: "center",
}

const $emojiText: TextStyle = {
  lineHeight: 0,
  textAlign: "center",
}

const $btn: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  borderWidth: 0,
  borderRadius: spacing.xs,
}

const $habitNameText: TextStyle = {
  flexShrink: 1,
  maxWidth: layout.window.width * 0.45,
}

const $habitIconImage: ImageStyle = {
  width: 28,
  height: 28,
  resizeMode: "contain",
}
