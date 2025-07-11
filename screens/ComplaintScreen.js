// screens/ComplaintScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

const ComplaintScreen = () => {
  const [collegeId, setCollegeId] = useState(null);
  const [type, setType] = useState('Complaint'); // "Complaint" or "Feedback"
  const [subject, setSubject] = useState('Mess Complaint');
  const [message, setMessage] = useState('');
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchId = async () => {
      const id = await AsyncStorage.getItem('collegeId');
      setCollegeId(id);
    };
    fetchId();
  }, []);

  useEffect(() => {
    if (!collegeId) return;
    const q = query(
      collection(db, 'complaints'),
      where('sender', '==', collegeId),
      orderBy('timestamp', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSubmissions(list);
    });

    return unsub;
  }, [collegeId]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please write something.');
      return;
    }

    try {
      await addDoc(collection(db, 'complaints'), {
        sender: collegeId,
        type,
        subject,
        message,
        timestamp: new Date(),
      });

      setMessage('');
      Alert.alert('Success', `${type} submitted.`);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Submission failed.');
    }
  };

  if (!collegeId) {
    return (
      <View style={styles.center}>
        <Text style={styles.lockedText}>
          Please login to access the Complaint & Feedback section.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit Complaint / Feedback</Text>

      <Text style={styles.label}>Type:</Text>
      <View style={styles.pillContainer}>
        {['Complaint', 'Feedback'].map((t) => (
          <Text
            key={t}
            style={[
              styles.pill,
              type === t && { backgroundColor: '#FFDE59', color: '#000' },
            ]}
            onPress={() => setType(t)}
          >
            {t}
          </Text>
        ))}
      </View>

      <Text style={styles.label}>Subject:</Text>
      <View style={styles.pillContainer}>
        {['Mess Complaint', 'Hostel Complaint', 'Other'].map((s) => (
          <Text
            key={s}
            style={[
              styles.pill,
              subject === s && { backgroundColor: '#FFDE59', color: '#000' },
            ]}
            onPress={() => setSubject(s)}
          >
            {s}
          </Text>
        ))}
      </View>

      <TextInput
        style={styles.textArea}
        placeholder="Write about your complaint or feedback here. Mention your name and contact number."
        multiline
        value={message}
        onChangeText={setMessage}
      />

      <Button title="Submit" onPress={handleSubmit} />

      <Text style={styles.previousTitle}>Your Submissions:</Text>
      {submissions.length === 0 ? (
        <Text style={{ fontStyle: 'italic', color: '#555' }}>
          No complaints or feedback submitted.
        </Text>
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.submissionCard}>
              <Text style={styles.subType}>
                {item.type} • {item.subject}
              </Text>
              <Text style={styles.subMessage}>{item.message}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    marginTop: 12,
    fontWeight: '600',
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 6,
    flexWrap: 'wrap',
  },
  pill: {
    backgroundColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    color: '#444',
    overflow: 'hidden',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    marginVertical: 12,
  },
  lockedText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    color: '#444',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  previousTitle: {
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    fontSize: 16,
  },
  submissionCard: {
    backgroundColor: '#f7f7f7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  subType: {
    fontWeight: '600',
    marginBottom: 4,
  },
  subMessage: {
    color: '#333',
  },
});

export default ComplaintScreen;
