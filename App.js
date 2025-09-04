import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from './src/utils/theme';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AuthScreen from './src/screens/AuthScreen';

// Import des écrans
import CameraScreen from './src/screens/CameraScreen';
import MapScreen from './src/screens/MapScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import PhotosScreen from './src/screens/PhotosScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PhotoDetailScreen from './src/screens/PhotoDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Navigation des onglets principaux
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Caméra') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Carte') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Calendrier') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Photos') {
            iconName = focused ? 'images' : 'images-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Caméra" component={CameraScreen} />
      <Tab.Screen name="Carte" component={MapScreen} />
      <Tab.Screen name="Calendrier" component={CalendarScreen} />
      <Tab.Screen name="Photos" component={PhotosScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Composant principal avec authentification
function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 20, fontSize: 16, color: colors.textSecondary }}>
          Chargement de Memorize...
        </Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => {}} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator>
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PhotoDetail" 
          component={PhotoDetailScreen}
          options={{
            title: 'Détail de la photo',
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Application principale avec AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}