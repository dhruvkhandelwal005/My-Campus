import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator, FlatList
} from 'react-native';
import MealCard from '../components/MealCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs  } from 'firebase/firestore';

const HomeScreen = () => {
  const [collegeId, setCollegeId] = useState(null);
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState('');
  const [day, setDay] = useState('');
  const navigation = useNavigation();
  const [todayClasses, setTodayClasses] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState({});
  const [todayEvent, setTodayEvent] = useState(null);
  const [upcomingHoliday, setUpcomingHoliday] = useState(null);
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);

  const CALENDAR_URL =
    'https://dhruvkhandelwal005.github.io/mess-menu/calender.json?v=' + Date.now();
  const MENU_URL =
    'https://dhruvkhandelwal005.github.io/mess-menu/menu.json?v=' + Date.now();
  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'short' }); 

  useEffect(() => {
    const fetchClasses = async () => {
      const id = await AsyncStorage.getItem('collegeId');
      setCollegeId(id);

      if (!id) {
        setLoading(false);
        return;
      }

      const colRef = collection(db, 'timetable', id, 'classes');
      const snap = await getDocs(colRef);
      const data = snap.docs.map(doc => doc.data());

      if (data.length === 0) {
        setTodayClasses(null); // No classes added at all
      } else {
        const filtered = data.filter(cls => cls.days.includes(todayDay));
        setTodayClasses(filtered);
      }

      setLoading(false);
    };

    fetchClasses();
  }, []);

  const renderClass = ({ item }) => (
    <View style={styles.classBox}>
      <View style={styles.classTypeIndicator}></View>
      <View style={styles.classContent}>
        <Text style={styles.className}>{item.name}</Text>
        <Text style={styles.classType}>{item.type}</Text>
      </View>
    </View>
  );

  useFocusEffect(
    React.useCallback(() => {
      const getId = async () => {
        const id = await AsyncStorage.getItem('collegeId');
        setCollegeId(id || null);
      };
      getId();
    }, [])
  );

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await fetch(CALENDAR_URL);
        const data = await res.json();

        setCalendarEvents(data);

        const todayStr = new Date().toISOString().split('T')[0];
        if (data[todayStr]) setTodayEvent(data[todayStr]);

        const today = new Date();
        const sortedDates = Object.keys(data)
          .map(date => ({ date, ...data[date] }))
          .filter(e => new Date(e.date) > today)
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        const nextHoliday = sortedDates.find(e => e.type === 'holiday');
        const nextEvent = sortedDates.find(e => e.type === 'event');

        setUpcomingHoliday(nextHoliday || null);
        setUpcomingEvent(nextEvent || null);
      } catch (e) {
        console.error('Error loading calendar info:', e);
      }
    };

    const fetchMeal = async () => {
      try {
        const res = await fetch(MENU_URL);
        const data = await res.json();

        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', {
          weekday: 'long',
        }).toUpperCase();
        const currentHour = now.getHours();

        const mealType =
          currentHour < 11
            ? 'BREAKFAST'
            : currentHour < 16
            ? 'LUNCH'
            : currentHour < 19
            ? 'SNACKS'
            : 'DINNER';

        setMeal({
          type: mealType,
          items: data[currentDay]?.[mealType] || ['No menu found'],
        });
        setDay(currentDay);
      } catch (err) {
        console.error('Error fetching menu:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
    fetchCalendar();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));
      setRecentMessages(msgs.reverse()); // reverse to show oldest at top
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setTime(formattedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('collegeId');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.welcome}>Welcome</Text>
          <Text style={styles.id}>{collegeId || 'User'}</Text>
        </View>
        <View style={styles.dayTime}>
          <Text style={styles.day}>{day}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>

      {!loading && meal && <MealCard title={meal.type} items={meal.items} />}

      <TouchableOpacity 
        onPress={() => navigation.navigate('My Timetable')}
        style={styles.classesSection}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#ffcc00" size="small" />
        ) : todayClasses === null ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No timetable added yet</Text>
          </View>
        ) : todayClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No classes scheduled for today</Text>
          </View>
        ) : (
          <View style={styles.classesContainer}>
            {todayClasses.map((item, index) => (
              <View key={index} style={styles.classBox}>
                <View style={[
                  styles.classTypeIndicator,
                  item.type === 'Lab' ? styles.labIndicator : styles.lectureIndicator
                ]}></View>
                <View style={styles.classContent}>
                  <Text style={styles.className}>{item.name}</Text>
                  <View style={styles.classMeta}>
                    <Text style={styles.classType}>{item.type}</Text>
                    <Text style={styles.classTime}>{item.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>

      {/* Calendar Highlights */}
      <TouchableOpacity
        style={styles.calendarBox}
        onPress={() => navigation.navigate('Calendar')}
      >
        <Text style={styles.calendarTitle}>📅 Today: {new Date().toDateString()}</Text>

        {todayEvent ? (
          <Text style={styles.todayEvent}>
            {todayEvent.type === 'holiday' ? ' Holiday: ' : ' Event: '}
            {todayEvent.title}
          </Text>
        ) : (
          <Text style={styles.noEvent}>No special event today</Text>
        )}

        {upcomingHoliday && (
          <Text style={styles.upcoming}>
            Upcoming Holiday: {upcomingHoliday.title} on{' '}
            {new Date(upcomingHoliday.date).toDateString()}
          </Text>
        )}
        {upcomingEvent && (
          <Text style={styles.upcoming}>
            Upcoming Event: {upcomingEvent.title} on{' '}
            {new Date(upcomingEvent.date).toDateString()}
          </Text>
        )}
      </TouchableOpacity>

      {/* Discussion Preview */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Discussion')}
        style={styles.discussionBox}
      >
        <Text style={styles.discussionTitle}>💬 Recent Discussion</Text>
        {recentMessages.length === 0 ? (
          <Text style={styles.noEvent}>No messages yet</Text>
        ) : (
          recentMessages.map((msg) => (
            <View key={msg.id} style={styles.message}>
              <Text style={styles.sender}>{msg.sender}</Text>
              <Text style={styles.content}>{msg.content}</Text>
            </View>
          ))
        )}
      </TouchableOpacity>

      <View style={{ marginVertical: 30 }}>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  id: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 2,
  },
  dayTime: {
    alignItems: 'flex-end',
  },
  day: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  time: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  classesSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#ffcc00',
    fontWeight: '600',
  },
  classesContainer: {
    marginTop: 8,
  },
  classBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  classTypeIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  lectureIndicator: {
    backgroundColor: '#4CAF50',
  },
  labIndicator: {
    backgroundColor: '#2196F3',
  },
  classContent: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  classMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  classType: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  classTime: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  calendarBox: {
    marginTop: 24,
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  todayEvent: {
    fontSize: 15,
    fontWeight: '500',
    color: '#444',
    marginBottom: 4,
  },
  noEvent: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 4,
  },
  upcoming: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  discussionBox: {
    marginTop: 24,
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1A237E',
  },
  message: {
    marginBottom: 8,
  },
  sender: {
    fontWeight: '600',
    color: '#333',
  },
  content: {
    color: '#000',
  },
});

export default HomeScreen;