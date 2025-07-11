import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const LoginScreen = ({ navigation }) => {
  const [collegeId, setCollegeId] = useState('');
  const [error, setError] = useState('');

  const validateCollegeId = (id) => {
    const pattern = /^BT\d{2}(CSE|CSA|CSH|CSD|ECE|ECI)\d{3}$/i;
    return pattern.test(id);
  };

  // 🔹 Logs login attempt to Firestore
  const logLogin = async (id, type) => {
    await addDoc(collection(db, 'logins'), {
      collegeId: id,
      type,
      timestamp: serverTimestamp(),
    });
  };

  // 🔹 Logs session (app opened) to Firestore
  const logSession = async (id) => {
    await addDoc(collection(db, 'sessions'), {
      collegeId: id,
      startTime: serverTimestamp(),
    });
  };

  const handleLogin = async () => {
    const trimmedId = collegeId.trim().toUpperCase();

    // Check for admin shortcut
    if (trimmedId === 'ADMIN001') {
      await AsyncStorage.setItem('collegeId', trimmedId);
      await logLogin(trimmedId, 'admin');
      await logSession(trimmedId);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Admin' }],
      });
      return;
    }

    if (!validateCollegeId(trimmedId)) {
      setError('Please enter a valid college ID (e.g., BT25CSE001)');
      return;
    }

    try {
      await AsyncStorage.setItem('collegeId', trimmedId);
      await AsyncStorage.removeItem('guestLogin');

      await logLogin(trimmedId, 'registered');
      await logSession(trimmedId);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (e) {
      setError('Something went wrong. Try again.');
    }
  };

  const handleGuest = async () => {
    try {
      await AsyncStorage.setItem('guestLogin', 'true');
      await AsyncStorage.removeItem('collegeId');

      await logLogin('Guest', 'guest');
      await logSession('Guest');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (e) {
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to MyCampus</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter College ID (e.g., BT25CSE001)"
        value={collegeId}
        onChangeText={setCollegeId}
        autoCapitalize="characters"
      />
      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>Login with College ID</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.guestBtn} onPress={handleGuest}>
        <Text style={styles.guestText}>Continue Without Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  loginBtn: {
    backgroundColor: '#FFDE59',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  guestBtn: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  guestText: {
    fontSize: 16,
    color: '#666',
  },
});

export default LoginScreen;
