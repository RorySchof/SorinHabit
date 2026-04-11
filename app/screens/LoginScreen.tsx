// app/screens/LoginScreen.tsx
import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native"
import { Text } from "app/components"
import { colors, spacing } from "app/theme"
import { authStore } from "app/models/auth-store"

import { migrateGuestDataToSupabase } from "app/services/api/habit-sync"

// import AsyncStorage from "@react-native-async-storage/async-storage"
// import { createClient } from "@supabase/supabase-js"

// const supabaseUrl = "https://inykbrspygwzopyngtlu.supabase.co"
// const supabaseAnonKey = "your-anon-keeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlueWticnNweWd3em9weW5ndGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTAyNjgsImV4cCI6MjA4MDQ4NjI2OH0.CZTRaUZmjA09UVtw254n0TxaXGLbC-sUaJIsFZBQu_8"

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage: AsyncStorage,
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: false,
//   },
// })

export const LoginScreen = observer(() => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Simple validation
  const canSubmit = email.trim().length > 0 && password.trim().length >= 6
if (authStore.user) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: spacing.lg,
        backgroundColor: colors.palette.neutral100,
      }}
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: spacing.xs,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.palette.neutral300,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          alignItems: "center",
        }}
      >
        {/* Avatar placeholder */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.palette.primary100,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.md,
          }}
        >
          <Text
            text={authStore.user.email[0].toUpperCase()}
            preset="heading"
            style={{ color: colors.palette.primary600 }}
          />
        </View>

        {/* Email */}
        <Text
          text={authStore.user.email}
          preset="subheading"
          style={{ marginBottom: spacing.sm, color: colors.text }}
        />

        {/* Premium/Sync stub */}
        <Text
          text="Premium features coming soon"
          size="sm"
          style={{ marginBottom: spacing.md, color: colors.palette.neutral600 }}
        />

        {/* Logout button */}
        <TouchableOpacity
          onPress={() => authStore.signOut()}
          style={{
            backgroundColor: colors.palette.primary600,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderRadius: spacing.xs,
          }}
        >
          <Text text="Logout" style={{ color: "#fff", fontWeight: "bold" }} />
        </TouchableOpacity>
      </View>
    </View>
  )
}


  // 👇 Guest mode → show login form
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: spacing.lg,
          backgroundColor: colors.palette.neutral100,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: spacing.xs,
            padding: spacing.lg,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text text="Welcome Back" preset="heading" style={{ marginBottom: spacing.md }} />

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              borderWidth: 1,
              borderColor: colors.palette.neutral300,
              borderRadius: spacing.xs,
              padding: spacing.sm,
              marginBottom: spacing.sm,
            }}
          />

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
              borderRadius: spacing.xs,
              padding: spacing.sm,
              marginBottom: spacing.md,
            }}
          />

          {authStore.error && (
            <Text text={authStore.error} style={{ color: "red", marginBottom: spacing.sm }} />
          )}

          {/* login  */}

     <TouchableOpacity
  disabled={!canSubmit}
  onPress={async () => {
    await authStore.signIn(email.trim(), password.trim())
    if (authStore.user) {
      // ✅ migrate guest data right after login
      await migrateGuestDataToSupabase()
    }
  }}
  style={{
    backgroundColor: canSubmit
      ? colors.palette.primary600
      : colors.palette.neutral300,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
    alignItems: "center",
  }}
>
  {authStore.loading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text text="Login" style={{ color: "#fff", fontWeight: "bold" }} />
  )}
</TouchableOpacity>



          {/* <TouchableOpacity
            disabled={!canSubmit}
            onPress={() => authStore.signIn(email.trim(), password.trim())}
            style={{
              backgroundColor: canSubmit
                ? colors.palette.primary600
                : colors.palette.neutral300,
              paddingVertical: spacing.sm,
              borderRadius: spacing.xs,
              alignItems: "center",
            }}
          >
            {authStore.loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text text="Login" style={{ color: "#fff", fontWeight: "bold" }} />
            )}
          </TouchableOpacity> */}


          {/* sign up  */}

      <TouchableOpacity
  disabled={!canSubmit}
  onPress={async () => {
    await authStore.signUp(email.trim(), password.trim())
    if (authStore.user) {
      // ✅ migrate guest data right after sign up
      await migrateGuestDataToSupabase()
    }
  }}
  style={{
    marginTop: spacing.sm,
    alignItems: "center",
  }}
>
  <Text
    text="Create Account"
    style={{
      color: canSubmit ? colors.palette.primary600 : colors.palette.neutral300,
    }}
  />
</TouchableOpacity>




          {/* <TouchableOpacity
            disabled={!canSubmit}
            onPress={() => authStore.signUp(email.trim(), password.trim())}
            style={{
              marginTop: spacing.sm,
              alignItems: "center",
            }}
          >
            <Text
              text="Create Account"
              style={{
                color: canSubmit ? colors.palette.primary600 : colors.palette.neutral300,
              }}
            />
          </TouchableOpacity> */}




        </View>
      </View>
    </TouchableWithoutFeedback>
  )
})


