import React, { useState } from "react"
import { View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native"
import { Text } from "app/components"
import { colors, spacing } from "app/theme"
import { supabase } from "app/services/api/supabase"
import { useNavigation } from "@react-navigation/native"

export function ForgotPasswordScreen() {
  const navigation = useNavigation()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSend() {
    setError("")
    setMessage("")

    if (!email.trim()) {
      setError("Please enter your email.")
      return
    }

    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: "habitrak://reset-password",
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setMessage("Check your email for a reset link.")
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: spacing.lg }}>
      <Text text="Forgot password" preset="heading" style={{ marginBottom: spacing.sm }} />

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
        }}
      />

      {error ? <Text text={error} style={{ color: colors.palette.angry500 }} /> : null}
      {message ? <Text text={message} style={{ color: colors.palette.primary600 }} /> : null}

      <TouchableOpacity
        onPress={handleSend}
        disabled={loading}
        style={{
          backgroundColor: colors.palette.primary600,
          paddingVertical: spacing.md,
          borderRadius: 10,
          alignItems: "center",
          marginTop: spacing.md,
        }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text text="Send reset link" style={{ color: "#fff" }} />}
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
  )
}
