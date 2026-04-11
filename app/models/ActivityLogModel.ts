import { types } from "mobx-state-tree"

export const ActivityLogModel = types.model("ActivityLog", {
  habitId: types.string,
  date: types.string, // e.g. "2025-06-13"
  count: types.number,
})
