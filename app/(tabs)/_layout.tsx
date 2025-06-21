import { Tabs } from 'expo-router';
import * as React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { ProtectedRoute } from '@/components/protectedRoute';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';


export default function TabLayout() {
  const colorScheme = useColorScheme();
  // const {isAuthenticated:isAuthenticated} = useCredentialContext()

  // if(!isAuthenticated){
  //   return(
  //     <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
  //       <Text style={{'color':'white'}}>Please log in first to access other pages</Text>
  //       <Button title="Go to Login" onPress={() => router.replace('/')} />
  //     </View>
  //   )
  // }

  return (
    // all components name must start with uppercase, don't forget.
    // Here, if user hasn't logged in yet (!isAuthenticated) and try to enter other pages by typing link (e.g. /dashboard)
    // ProtectedRoute will force browser/app to go back to login page
    <ProtectedRoute>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>

      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="table"
        options={{
          title: 'table',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="table" color={color} />,
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: 'register',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="dollarsign" color={color} />,
        }}
      />
      <Tabs.Screen
        name="userInfo"
        options={{
          title: 'user information',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="dollarsign" color={color} />,
        }}
      />
    </Tabs>
    </ProtectedRoute>
  );
  
}
