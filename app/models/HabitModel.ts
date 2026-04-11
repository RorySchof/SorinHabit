// models/HabitModel.ts
import { types } from "mobx-state-tree"
// import { v4 as uuidv4 } from "uuid"
import uuid from "react-native-uuid"


export const HabitModel = types.model("Habit", {

  // id: types.identifier,

 id: types.optional(types.identifier, () => uuid.v4() as string),

  name: types.string,
  emoji: types.optional(types.string, "✨"), // optional with default
  time: types.optional(types.string, "anytime"), // optional with default
  date: types.maybe(types.string), // ✅ Add this line

  finished: types.boolean,

  paused: types.optional(types.boolean, false),

  deleted: types.optional(types.boolean, false), // ✅ Add this line

  category: types.optional(types.string, "health"), // add category, default to "health"
  current: types.optional(types.number, 0), // current progress
  target: types.optional(types.number, 1), // target goal
  unit: types.optional(types.string, ""), // unit for measurement
  color: types.optional(types.string, "#3498db"),
  frequency: types.optional(types.array(types.string), []),
  // createdAt: types.optional(types.string, () => new Date().toISOString()), // <== Add this
  createdAt: types.string,
  // ✅ new field
  longestStreak: types.optional(types.number, 0),

  // ✅ New fields for reminders
  reminder: types.maybe(types.string),
  reminderId: types.maybe(types.string),


})
