// //Login Screen

// import React, { useState } from "react"
// import { observer } from "mobx-react-lite"
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Keyboard,
//   TouchableWithoutFeedback,
//   Image,
// } from "react-native"
// import { Text } from "app/components"
// import { colors, spacing } from "app/theme"
// import { authStore } from "app/models/auth-store"
// import { migrateGuestDataToSupabase } from "app/services/api/habit-sync"
// import CheckMarkBlue from "assets/images/CheckMarkBlue.png"

// export const LoginScreen = observer(() => {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")

//   const canSubmit = email.trim().length > 0 && password.trim().length >= 6

//   // Logged-in state
//   if (authStore.user) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: "center",
//           padding: spacing.lg,
//           backgroundColor: colors.background,
//         }}
//       >
//         <View
//           style={{
//             backgroundColor: colors.palette.neutral100,
//             borderRadius: 10,
//             padding: spacing.lg,
//             borderWidth: 1,
//             borderColor: colors.palette.neutral300,
//             shadowColor: "#000",
//             shadowOpacity: 0.08,
//             shadowRadius: 3,
//             elevation: 3,
//             alignItems: "center",
//           }}
//         >
//           {/* Avatar */}
//           <View
//             style={{
//               width: 48,
//               height: 48,
//               borderRadius: 99,
//               backgroundColor: colors.background,
//               alignItems: "center",
//               justifyContent: "center",
//               marginBottom: spacing.sm,
//             }}
//           >
//             <Image
//               source={CheckMarkBlue}
//               style={{ width: 48, height: 48, resizeMode: "contain" }}
//             />
//           </View>

//           {/* Email */}
//           <Text
//             text={authStore.user.email}
//             preset="subheading"
//             numberOfLines={1}
//             style={{ marginBottom: spacing.xs }}
//           />

//           {/* Soft supportive line */}
//           <Text
//             text="You're all set"
//             size="sm"
//             style={{
//               color: colors.palette.neutral600,
//               marginBottom: spacing.md,
//             }}
//           />

//           {/* Logout */}
//           <TouchableOpacity
//             onPress={() => authStore.signOut()}
//             style={{
//               backgroundColor: "#304FFE",
//               paddingVertical: spacing.md,
//               borderRadius: 10,
//               width: "100%",
//               alignItems: "center",
//             }}
//           >
//             <Text text="Logout" style={{ color: "#fff", fontWeight: "600" }} />
//           </TouchableOpacity>
//         </View>
//       </View>
//     )
//   }

//   // Logged-out state
//   return (
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
//       <View
//         style={{
//           flex: 1,
//           justifyContent: "center",
//           padding: spacing.lg,
//           backgroundColor: colors.background,
//         }}
//       >
//         <View
//           style={{
//             backgroundColor: colors.palette.neutral100,
//             borderRadius: 10,
//             padding: spacing.lg,
//             borderWidth: 1,
//             borderColor: colors.palette.neutral300,
//             shadowColor: "#000",
//             shadowOpacity: 0.08,
//             shadowRadius: 3,
//             elevation: 3,
//           }}
//         >
//           {/* TITLE + SUBTITLE */}
//           <Text
//             text="Sign in"
//             preset="heading"
//             style={{ marginBottom: spacing.xs }}
//           />

//           <Text
//             text="Pick up where you left off"
//             size="sm"
//             style={{
//               marginBottom: spacing.lg,
//               color: colors.palette.neutral600,
//             }}
//           />

//           {/* EMAIL */}
//           <TextInput
//             placeholder="Email"
//             value={email}
//             onChangeText={setEmail}
//             autoCapitalize="none"
//             keyboardType="email-address"
//             style={{
//               borderWidth: 1,
//               borderColor: colors.palette.neutral300,
//               borderRadius: 10,
//               padding: spacing.md,
//               marginBottom: spacing.md,
//               backgroundColor: colors.background,
//             }}
//           />

//           {/* PASSWORD */}
//           <TextInput
//             placeholder="Password"
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry
//             returnKeyType="done"
//             onSubmitEditing={Keyboard.dismiss}
//             style={{
//               borderWidth: 1,
//               borderColor: colors.palette.neutral300,
//               borderRadius: 10,
//               padding: spacing.md,
//               marginBottom: spacing.lg,
//               backgroundColor: colors.background,
//             }}
//           />

//           {authStore.error && (
//             <Text
//               text={authStore.error}
//               style={{ color: "#D32F2F", marginBottom: spacing.md }}
//             />
//           )}

//           {/* LOGIN BUTTON */}
//           <TouchableOpacity
//             disabled={!canSubmit}
//             onPress={async () => {
//               await authStore.signIn(email.trim(), password.trim())
//               if (authStore.user) {
//                 await migrateGuestDataToSupabase()
//               }
//             }}
//             style={{
//               backgroundColor: canSubmit ? "#304FFE" : "#C7C9D1",
//               paddingVertical: spacing.md,
//               borderRadius: 10,
//               alignItems: "center",
//               marginBottom: spacing.sm,
//             }}
//           >
//             {authStore.loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text text="Sign in" style={{ color: "#fff", fontWeight: "600" }} />
//             )}
//           </TouchableOpacity>

//           {/* CREATE ACCOUNT */}
//           <TouchableOpacity
//             disabled={!canSubmit}
//             onPress={async () => {
//               await authStore.signUp(email.trim(), password.trim())
//               if (authStore.user) {
//                 await migrateGuestDataToSupabase()
//               }
//             }}
//             style={{ alignItems: "center", marginTop: spacing.sm }}
//           >
//             <Text
//               text="Create an account"
//               style={{
//                 color: canSubmit ? "#304FFE" : "#C7C9D1",
//                 fontWeight: "500",
//               }}
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </TouchableWithoutFeedback>
//   )
// })





import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from "react-native"
import { Text } from "app/components"
import { colors, spacing } from "app/theme"
import { authStore } from "app/models/auth-store"
import { migrateGuestDataToSupabase } from "app/services/api/habit-sync"
import CheckMarkBlue from "assets/images/CheckMarkBlue.png"
import { useNavigation } from "@react-navigation/native"

export const LoginScreen = observer(() => {
  const navigation = useNavigation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const canSubmit = email.trim().length > 0 && password.trim().length >= 6

  // LOGGED-IN STATE ---------------------------------------------------------
  if (authStore.user) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: spacing.lg,
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            backgroundColor: colors.palette.neutral100,
            borderRadius: 10,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.palette.neutral300,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            alignItems: "center",
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 99,
              backgroundColor: colors.background,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing.sm,
            }}
          >
            <Image
              source={CheckMarkBlue}
              style={{ width: 48, height: 48, resizeMode: "contain" }}
            />
          </View>

          <Text
            text={authStore.user.email}
            preset="subheading"
            numberOfLines={1}
            style={{ marginBottom: spacing.xs }}
          />

          <Text
            text="You're all set"
            size="sm"
            style={{
              color: colors.palette.neutral600,
              marginBottom: spacing.md,
            }}
          />

          <TouchableOpacity
            onPress={() => authStore.signOut()}
            style={{
              backgroundColor: colors.palette.primary600,
              paddingVertical: spacing.md,
              borderRadius: 10,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text text="Logout" style={{ color: "#fff", fontWeight: "600" }} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // LOGGED-OUT STATE --------------------------------------------------------
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={{
          flex: 1,
          justifyContent: "center", // stays centered
          padding: spacing.lg,
          paddingTop: spacing.xl * 1.5, // pushes card LOWER
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            backgroundColor: colors.palette.neutral100,
            borderRadius: 10,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.palette.neutral300,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          {/* TITLE + SUBTITLE */}
          <Text text="Sign in" preset="heading" style={{ marginBottom: spacing.xs }} />

          <Text
            text="Stay on track, one day at a time."
            size="sm"
            style={{
              marginBottom: spacing.lg,
              color: colors.palette.neutral600,
            }}
          />

          {/* EMAIL */}
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              borderWidth: 1,
              borderColor: colors.palette.neutral300,
              borderRadius: 10,
              padding: spacing.md,
              marginBottom: spacing.md,
              backgroundColor: colors.background,
              color: colors.text,
            }}
          />

          {/* PASSWORD */}
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            style={{
              borderWidth: 1,
              borderColor: colors.palette.neutral300,
              borderRadius: 10,
              padding: spacing.md,
              // marginBottom: spacing.lg,
              backgroundColor: colors.background,
              color: colors.text,
            }}
          />


          {/* FORGOT PASSWORD */}

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={{ alignSelf: "flex-start", marginTop: spacing.xxs, marginBottom: spacing.lg }}          >
            <Text
              text="Forgot password?"
              size="xs"
              style={{
                color: colors.palette.primary600,
                fontWeight: "400",
              }}
            />
          </TouchableOpacity>


          {/* ERROR */}
          {authStore.error && (
            <Text
              text={authStore.error}
              style={{
                color: colors.palette.angry500,
                marginBottom: spacing.md,
              }}
            />
          )}

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            disabled={!canSubmit}
            onPress={async () => {
              await authStore.signIn(email.trim(), password.trim())
              if (authStore.user) {
                await migrateGuestDataToSupabase()
              }
            }}
            style={{
              backgroundColor: canSubmit
                ? colors.palette.primary600
                : colors.palette.neutral400,
              paddingVertical: spacing.md,
              borderRadius: 10,
              alignItems: "center",
              marginBottom: spacing.sm,
            }}
          >
            {authStore.loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text text="Sign in" style={{ color: "#fff", fontWeight: "600" }} />
            )}
          </TouchableOpacity>

          {/* CREATE ACCOUNT */}
          <TouchableOpacity
            disabled={!canSubmit}
            onPress={async () => {
              await authStore.signUp(email.trim(), password.trim())
              if (authStore.user) {
                await migrateGuestDataToSupabase()
              }
            }}
            style={{ alignItems: "center", marginTop: spacing.sm }}
          >
            <Text
              text="Create an account"
              style={{
                color: canSubmit ? colors.palette.primary600 : colors.palette.neutral400,
                fontWeight: "500",
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
})
