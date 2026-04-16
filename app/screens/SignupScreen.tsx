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
import { useNavigation } from "@react-navigation/native"

export const SignupScreen = observer(() => {
  const navigation = useNavigation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const canSubmit =
    email.trim().length > 0 &&
    password.trim().length >= 6 &&
    confirmPassword === password

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: spacing.lg,
          paddingTop: spacing.xl * 1.5,
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
          {/* TITLE */}
          <Text text="Create account" preset="heading" style={{ marginBottom: spacing.xs }} />

          <Text
            text="Start your journey, one day at a time."
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

          {/* CONFIRM PASSWORD */}
          <TextInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={{
              borderWidth: 1,
              borderColor: colors.palette.neutral300,
              borderRadius: 10,
              padding: spacing.md,
              marginBottom: spacing.lg,
              backgroundColor: colors.background,
              color: colors.text,
            }}
          />

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

          {/* CREATE ACCOUNT BUTTON */}
          <TouchableOpacity
  disabled={!canSubmit}
  onPress={async () => {
    await authStore.signUp(email.trim(), password.trim())

    if (authStore.user) {
      navigation.reset({
        index: 0,
        routes: [{ name: "HomeStack" }],
      })
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
    <Text text="Create account" style={{ color: "#fff", fontWeight: "600" }} />
  )}
</TouchableOpacity>

          {/* SIGN IN LINK */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={{ alignItems: "center", marginTop: spacing.sm }}
          >
            <Text
              text="Already have an account?"
              style={{
                color: colors.palette.primary600,
                fontWeight: "500",
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
})
