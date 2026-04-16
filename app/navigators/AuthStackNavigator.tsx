import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { LoginScreen } from "app/screens/LoginScreen"
import * as Screens from "app/screens"
import { AuthStackParamList } from "./types"

const AuthStack = createNativeStackNavigator<AuthStackParamList>()

export function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="PasswordReset" component={Screens.PasswordResetScreen} />
      <AuthStack.Screen name="ForgotPassword" component={Screens.ForgotPasswordScreen} />

      <AuthStack.Screen name="Signup" component={Screens.SignupScreen} />
      
    </AuthStack.Navigator>
  )
}
