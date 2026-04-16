import { NavigationContainer } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { authStore } from "app/models/auth-store"
import { AppNavigator } from "./AppNavigator"
import { AuthStackNavigator } from "./AuthStackNavigator" // we’ll extract this from your file

export const RootNavigator = observer(function RootNavigator() {
  const user = authStore.user

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  )
})
