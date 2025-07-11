import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { isSameDay, isSameWeek, isSameMonth } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AdminScreen = () => {
  const [logins, setLogins] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const storedAuth = await AsyncStorage.getItem('adminAuthenticated');
    if (storedAuth === 'true') {
      setAuthenticated(true);
      fetchData();
    }
  };

  const handleLogin = () => {
    if (password === 'admin100') {
      AsyncStorage.setItem('adminAuthenticated', 'true');
      setAuthenticated(true);
      fetchData();
    } else {
      Alert.alert('Error', 'Incorrect password');
    }
  };

  const handleLogout = () => {
    AsyncStorage.removeItem('adminAuthenticated');
    setAuthenticated(false);
    setPassword('');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const loginSnap = await getDocs(collection(db, 'logins'));
      const sessionSnap = await getDocs(collection(db, 'sessions'));

      const loginData = loginSnap.docs.map(doc => doc.data());
      const sessionData = sessionSnap.docs.map(doc => doc.data());

      setLogins(loginData);
      setSessions(sessionData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();

  const getCounts = (data, filterFn) => {
    const filtered = data.filter(d => d.timestamp?.toDate && filterFn(d.timestamp.toDate()));
    const uniqueIds = [...new Set(filtered.map(d => d.collegeId))];
    return {
      total: filtered.length,
      unique: uniqueIds.length,
    };
  };

  const filterToday = (date) => isSameDay(date, today);
  const filterWeek = (date) => isSameWeek(date, today);
  const filterMonth = (date) => isSameMonth(date, today);

  const loginToday = getCounts(logins, filterToday);
  const loginWeek = getCounts(logins, filterWeek);
  const loginMonth = getCounts(logins, filterMonth);

  const guestToday = logins.filter(l => l.type === 'guest' && filterToday(l.timestamp?.toDate())).length;
  const guestWeek = logins.filter(l => l.type === 'guest' && filterWeek(l.timestamp?.toDate())).length;
  const guestMonth = logins.filter(l => l.type === 'guest' && filterMonth(l.timestamp?.toDate())).length;

  const activeToday = getCounts(sessions, filterToday);
  const activeWeek = getCounts(sessions, filterWeek);
  const activeMonth = getCounts(sessions, filterMonth);

  if (!authenticated) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>Admin Authentication</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Admin Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ffcc00" />
        <Text>Loading stats...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>📊 Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <StatBlock title="Logins">
        <Stat label="Today" total={loginToday.total} unique={loginToday.unique} />
        <Stat label="This Week" total={loginWeek.total} unique={loginWeek.unique} />
        <Stat label="This Month" total={loginMonth.total} unique={loginMonth.unique} />
      </StatBlock>

      <StatBlock title="Guest Logins">
        <Stat label="Today" total={guestToday} />
        <Stat label="This Week" total={guestWeek} />
        <Stat label="This Month" total={guestMonth} />
      </StatBlock>

      <StatBlock title="Active Users">
        <Stat label="Today" total={activeToday.total} unique={activeToday.unique} />
        <Stat label="This Week" total={activeWeek.total} unique={activeWeek.unique} />
        <Stat label="This Month" total={activeMonth.total} unique={activeMonth.unique} />
      </StatBlock>
    </ScrollView>
  );
};

const StatBlock = ({ title, children }) => (
  <View style={styles.block}>
    <Text style={styles.blockTitle}>{title}</Text>
    {children}
  </View>
);

const Stat = ({ label, total, unique }) => (
  <Text style={styles.statText}>
    {label}: {total} {unique != null ? `(Unique: ${unique})` : ''}
  </Text>
);

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: { fontSize: 22, fontWeight: 'bold' },
  block: { marginBottom: 20, backgroundColor: '#FFFDE7', padding: 12, borderRadius: 8 },
  blockTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  statText: { fontSize: 16, marginBottom: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  authTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#FFDE59',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default AdminScreen;