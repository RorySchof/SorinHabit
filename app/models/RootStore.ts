// import { Instance, SnapshotOut, types } from "mobx-state-tree"

// /**
//  * A RootStore model.
//  */
// export const RootStoreModel = types.model("RootStore").props({
// })

// /**
//  * The RootStore instance.
//  */
// export interface RootStore extends Instance<typeof RootStoreModel> {}
// /**
//  * The data of a RootStore.
//  */
// export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}






import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { HabitStoreModel } from "./habit-store" // ✅ adjust path if needed

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  habitStore: types.optional(HabitStoreModel, { habits: [] }), // ✅ added habitStore
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
