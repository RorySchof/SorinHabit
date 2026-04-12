// /**
//  * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
//  * navigation flows of your app.
//  * Generally speaking, it will contain an auth flow (registration, login, forgot password)
//  * and a "main" flow which the user will use once logged in.
//  */
// import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native"
// import { createNativeStackNavigator } from "@react-navigation/native-stack"
// import { observer } from "mobx-react-lite"
// import React from "react"
// import { Platform, useColorScheme, View, ViewStyle } from "react-native"
// import * as Screens from "app/screens"
// import Config from "../config"
// import { navigationRef, useBackButtonHandler } from "./navigation-utilities"
// import { colors } from "app/theme"
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
// import MaterialIcons from "@expo/vector-icons/MaterialIcons"
// import { HomeStackParamList, SettingsStackParamList, TabParamList } from "app/navigators/types"
// import { $tabBarStyles } from "app/navigators/styles"
// import { PersonalInfosScreen } from "app/screens/profile/personal-infos"
// import { EditPersonalInfosScreen } from "app/screens/profile/edit-personal-infos"
// import { EditPasswordScreen } from "app/screens/profile/edit-password"
// import { FakeHabitScreen } from "app/screens/home"
// import { Text } from "react-native"
// import { ExperimentalStatsScreen } from "app/screens/ExperimentalStatsScreen"
// import { StatisticsScreen } from "app/screens/statistics"

// import { authStore } from "app/models/auth-store"
// import { LoginScreen } from "app/screens/LoginScreen"


// /**
//  * This type allows TypeScript to know what routes are defined in this navigator
//  * as well as what properties (if any) they might take when navigating to them.
//  *
//  * If no params are allowed, pass through `undefined`. Generally speaking, we
//  * recommend using your MobX-State-Tree store(s) to keep application state
//  * rather than passing state through navigation params.
//  *
//  * For more information, see this documentation:
//  *   https://reactnavigation.org/docs/params/
//  *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
//  *   https://reactnavigation.org/docs/typescript/#organizing-types
//  */

// /**
//  * This is a list of all the route names that will exit the app if the back button
//  * is pressed while in that screen. Only affects Android.
//  */
// const exitRoutes = Config.exitRoutes

// // Documentation: https://reactnavigation.org/docs/stack-navigator/
// const Stack = createNativeStackNavigator<HomeStackParamList>()

// const PlaceholderScreen = () => (
//   <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//     <Text>Sandbox screen removed. Nothing here for now.</Text>
//   </View>
// )

// const HomeStack = observer(function HomeStack() {
//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerShown: false,
//         navigationBarColor: colors.background,
//         contentStyle: { backgroundColor: colors.background }, // <- flat background
//       }}
//     >
//       <Stack.Screen name="Home" component={Screens.HomeScreen} />
//       <Stack.Screen name="CreateHabit" component={Screens.CreateHabitScreen} />
//       <Stack.Screen name="CreateNewHabit" component={Screens.CreateNewHabitScreen} />
//       <Stack.Screen name="EditHabit" component={Screens.EditHabitScreen} />
//       <Stack.Screen name="FakeHabit" component={PlaceholderScreen} />
//     </Stack.Navigator>
//   )
// })

// const SettingStack = createNativeStackNavigator<SettingsStackParamList>()

// const SettingsStack = observer(function SettingsStack() {
//   return (
//     <SettingStack.Navigator
//       initialRouteName="Settings"
//       screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
//     >
//       {/* @ts-expect-error type props error */}
//       <SettingStack.Screen name="Settings" component={Screens.SettingsScreen} />
//       {/* @ts-expect-error type props error */}
//       <SettingStack.Screen name="PersonalInfos" component={PersonalInfosScreen} />
//       {/* @ts-expect-error type props error */}
//       <SettingStack.Screen name="EditPersonalInfos" component={EditPersonalInfosScreen} />
//       {/* @ts-expect-error type props error */}
//       <SettingStack.Screen name="EditPassword" component={EditPasswordScreen} />
//     </SettingStack.Navigator>
//   )
// })

// const Tab = createBottomTabNavigator<TabParamList>()

// export interface NavigationProps
//   extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

// export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
//   const colorScheme = useColorScheme()

//   useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

//   return (
//     <NavigationContainer
//       ref={navigationRef}
//       theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
//       {...props}
//     >

//       {/* {authStore.user ? (
//         // ✅ Logged in → show your existing Tab.Navigator */}

        
//       <Tab.Navigator
//         screenOptions={({ route }) => ({
//           tabBarIcon: ({ focused, color }) => {
//             let iconName: keyof (typeof MaterialIcons)["glyphMap"]

//             if (route.name === "HomeStack") {
//               iconName = focused ? "home-filled" : "home"
//             } else if (route.name === "Statistics") {
//               iconName = "format-list-bulleted"
//             } else if (route.name === "SettingsStack") {
//               iconName = "settings"
//             } else if (route.name === "ExperimentalStats" || route.name === "SandboxStatistics") {
//               iconName = "bar-chart"
//             } else {
//               iconName = "circle"
//             }

//             // No wrapper — keeps icons centered in a flat, square dock
//             return <MaterialIcons name={iconName} size={36} color={color} />
//           },

//           tabBarActiveTintColor: colors.palette.primary600,
//           tabBarInactiveTintColor: colors.palette.neutral600,
//           headerShown: false,
//           tabBarShowLabel: false,

//           // Square, docked strip across the bottom
//           tabBarStyle: {
//             position: "absolute",
//             bottom: 0,
//             left: 0,
//             right: 0,
//             height: 70,
//             backgroundColor: "#fff",
//             borderTopWidth: 1,
//             borderTopColor: "#ddd",
//             borderRadius: 0,
//             elevation: 0, // Android: remove shadow
//             shadowOpacity: 0, // iOS: remove shadow
//             margin: 0,
//             paddingHorizontal: 0,
//           },

//           // Make each tab an equal-width "slot"
//           tabBarItemStyle: {
//             flex: 1,
//             justifyContent: "center",
//             alignItems: "center",
//             // Optional dividers for a dock feel:
//             // borderRightWidth: 1,
//             // borderRightColor: "#eee",
//           },

//           // Critical: prevent safe-area from floating the bar
//           safeAreaInsets: { bottom: 0 },
//         })}
//         // Ensures screens render under the flat tab bar without extra padding
//         sceneContainerStyle={{ backgroundColor: colors.background }}
//       >
//         <Tab.Screen name="HomeStack" component={HomeStack} />
//         <Tab.Screen name="ExperimentalStats" component={ExperimentalStatsScreen} />

//         <Tab.Screen
//           name="CreateHabit"
//           component={Screens.CreateNewHabitScreen}
//           options={{
//             tabBarIcon: ({ color }) => <MaterialIcons name="add-circle" size={36} color={color} />,
//             tabBarLabel: "",
//           }}
//         />

//         <Tab.Screen name="Statistics" component={Screens.CreateHabitScreen} />
//         {/* <Tab.Screen name="SettingsStack" component={SettingsStack} /> */}

  

// {/* <Tab.Screen
//   name="Login"
//   component={LoginScreen}
//   options={{
//     tabBarIcon: ({ color }) => (
//       <MaterialIcons name="login" size={36} color={color} />
//     ),
//     tabBarLabel: "Login",
//   }}
// /> */}


// </Tab.Navigator>
// </NavigationContainer>
// )
// })


/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import React from "react"
import { useColorScheme, View, Text } from "react-native"
import * as Screens from "app/screens"
import Config from "../config"
import { navigationRef, useBackButtonHandler } from "./navigation-utilities"
import { colors } from "app/theme"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { HomeStackParamList, SettingsStackParamList, TabParamList } from "app/navigators/types"
import { PersonalInfosScreen } from "app/screens/profile/personal-infos"
import { EditPersonalInfosScreen } from "app/screens/profile/edit-personal-infos"
import { EditPasswordScreen } from "app/screens/profile/edit-password"
import { ExperimentalStatsScreen } from "app/screens/ExperimentalStatsScreen"
import { authStore } from "app/models/auth-store"
import { LoginScreen } from "app/screens/LoginScreen"

const exitRoutes = Config.exitRoutes

const Stack = createNativeStackNavigator<HomeStackParamList>()

const PlaceholderScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Sandbox screen removed. Nothing here for now.</Text>
  </View>
)

const HomeStack = observer(function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={Screens.HomeScreen} />
      <Stack.Screen name="CreateHabit" component={Screens.CreateHabitScreen} />
      <Stack.Screen name="CreateNewHabit" component={Screens.CreateNewHabitScreen} />
      <Stack.Screen name="EditHabit" component={Screens.EditHabitScreen} />
      <Stack.Screen name="FakeHabit" component={PlaceholderScreen} />
    </Stack.Navigator>
  )
})

const SettingStack = createNativeStackNavigator<SettingsStackParamList>()

const SettingsStack = observer(function SettingsStack() {
  return (
    <SettingStack.Navigator
      initialRouteName="Settings"
      screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
    >
      <SettingStack.Screen name="Settings" component={Screens.SettingsScreen} />
      <SettingStack.Screen name="PersonalInfos" component={PersonalInfosScreen} />
      <SettingStack.Screen name="EditPersonalInfos" component={EditPersonalInfosScreen} />
      <SettingStack.Screen name="EditPassword" component={EditPasswordScreen} />
    </SettingStack.Navigator>
  )
})

const Tab = createBottomTabNavigator<TabParamList>()

export interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const colorScheme = useColorScheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      {authStore.user ? (
        // ⭐ Logged in → show main app
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color }) => {
              let iconName: keyof (typeof MaterialIcons)["glyphMap"]

              if (route.name === "HomeStack") {
                iconName = focused ? "home-filled" : "home"
              } else if (route.name === "Statistics") {
                iconName = "format-list-bulleted"
              } else if (route.name === "SettingsStack") {
                iconName = "settings"
              } else if (route.name === "ExperimentalStats" || route.name === "SandboxStatistics") {
                iconName = "bar-chart"
              } else {
                iconName = "circle"
              }

              return <MaterialIcons name={iconName} size={36} color={color} />
            },

            tabBarActiveTintColor: colors.palette.primary600,
            tabBarInactiveTintColor: colors.palette.neutral600,
            headerShown: false,
            tabBarShowLabel: false,

            tabBarStyle: {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 70,
              backgroundColor: "#fff",
              borderTopWidth: 1,
              borderTopColor: "#ddd",
              borderRadius: 0,
              elevation: 0,
              shadowOpacity: 0,
              margin: 0,
              paddingHorizontal: 0,
            },

            tabBarItemStyle: {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            },

            safeAreaInsets: { bottom: 0 },
          })}
          sceneContainerStyle={{ backgroundColor: colors.background }}
        >
          <Tab.Screen name="HomeStack" component={HomeStack} />
          <Tab.Screen name="ExperimentalStats" component={ExperimentalStatsScreen} />

          <Tab.Screen
            name="CreateHabit"
            component={Screens.CreateNewHabitScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialIcons name="add-circle" size={36} color={color} />
              ),
              tabBarLabel: "",
            }}
          />

          <Tab.Screen name="Statistics" component={Screens.CreateHabitScreen} />
        </Tab.Navigator>
      ) : (
        // ⭐ Not logged in → show login
        <LoginScreen />
      )}
    </NavigationContainer>
  )
})
