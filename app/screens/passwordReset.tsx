

import React, { useState } from "react"
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native"
import { Text } from "../components/Text"
import { colors, spacing } from "../theme"
// import { supabase } from "../../lib/supabase"
import { useNavigation } from "@react-navigation/native"

export function PasswordResetScreen() {
  const navigation = useNavigation()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleReset() {
    setError("")
    setSuccess("")

    if (!password || !confirmPassword) {
      setError("Please enter both fields.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess("Password updated. You can now sign in.")
    setTimeout(() => navigation.navigate("Login"), 1200)
  }

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
          <Text text="Reset password" preset="heading" style={{ marginBottom: spacing.xs }} />

          <Text
            text="Choose a new password to continue."
            size="sm"
            style={{
              marginBottom: spacing.lg,
              color: colors.palette.neutral600,
            }}
          />

          {/* NEW PASSWORD */}
          <TextInput
            placeholder="New password"
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
              marginBottom: spacing.md,
              backgroundColor: colors.background,
              color: colors.text,
            }}
          />

          {/* ERROR */}
          {error ? (
            <Text
              text={error}
              style={{
                color: colors.palette.angry500,
                marginBottom: spacing.md,
              }}
            />
          ) : null}

          {/* SUCCESS */}
          {success ? (
            <Text
              text={success}
              style={{
                color: colors.palette.primary600,
                marginBottom: spacing.md,
              }}
            />
          ) : null}

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            onPress={handleReset}
            disabled={loading}
            style={{
              backgroundColor: colors.palette.primary600,
              paddingVertical: spacing.md,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text text="Update password" style={{ color: "#fff", fontWeight: "600" }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
  onPress={() => navigation.navigate("Login")}
  style={{ marginTop: spacing.lg, alignSelf: "center" }}
>
  <Text
    text="Back to login"
    size="xs"
    style={{ color: colors.palette.primary600 }}
  />
</TouchableOpacity>


        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}
