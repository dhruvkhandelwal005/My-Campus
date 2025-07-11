import {React,  useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import MessMenuScreen from './screens/MessMenuScreen';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ExploreCoursesScreen from './screens/ExploreCoursesScreen';
import CalendarScreen from './screens/CalendarScreen';
import DiscussionScreen from './screens/DiscussionScreen';
import ComplaintScreen from './screens/ComplaintScreen.js';
import QuickLinksScreen from './screens/QuickLinksScreen';
import ClubsScreen from './screens/ClubsScreen';
import TimetableScreen from './screens/TimetableScreen';
import * as NavigationBar from 'expo-navigation-bar';
import Developer from './screens/Developer'; 
import AdminScreen from './screens/AdminScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFDE59' },
        headerTintColor: '#000',
        drawerActiveTintColor: '#000',
        drawerInactiveTintColor: '#000',
        drawerActiveBackgroundColor: '#FFDE59',
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'IIIT Nagpur' }} />
      <Drawer.Screen name="Mess Menu" component={MessMenuScreen} />
      <Drawer.Screen name="Explore Courses" component={ExploreCoursesScreen} />
      <Drawer.Screen name="Calendar" component={CalendarScreen} />
      <Drawer.Screen name="Discussion" component={DiscussionScreen} />
      <Drawer.Screen name="Quick Links" component={QuickLinksScreen} />
      <Drawer.Screen name="Complaint & Feedback" component={ComplaintScreen} />
      <Drawer.Screen name="Clubs" component={ClubsScreen} />
      <Drawer.Screen name="My Timetable" component={TimetableScreen} />
      <Drawer.Screen name="Admin" component={AdminScreen} />
      <Drawer.Screen name="Developer" component={Developer} />




    </Drawer.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

   useEffect(() => {
    const hideNavBar = async () => {
      try {
        await NavigationBar.setVisibilityAsync('hidden');  // hides the nav bar
        await NavigationBar.setBehaviorAsync('immersive'); // keeps it hidden unless swiped
      } catch (e) {
        console.warn('Nav bar hiding not supported:', e);
      }
    };

    hideNavBar();
  }, []);


  useEffect(() => {
    const checkLogin = async () => {
      const id = await AsyncStorage.getItem('collegeId');
      const guest = await AsyncStorage.getItem('guestLogin');
      setInitialRoute(id || guest ? 'Main' : 'Login');
    };
    checkLogin();
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={DrawerNavigator} />
        <Stack.Screen name="Admin" component={AdminScreen} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}
