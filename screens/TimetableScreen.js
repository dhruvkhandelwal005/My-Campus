import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, TextInput,
  Switch, StyleSheet, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase';
import {
  collection, addDoc, deleteDoc, doc, onSnapshot, setDoc, getDoc
} from 'firebase/firestore';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TimetableScreen = () => {
  const [collegeId, setCollegeId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [calendarEvents, setCalendarEvents] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [newClass, setNewClass] = useState({
    type: 'Lecture',
    name: '',
    days: { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false }
  });

  const today = new Date();
  const todayDay = today.toLocaleDateString('en-US', { weekday: 'short' });
  const todayISO = today.toISOString().split('T')[0];
  const CALENDAR_URL = 'https://dhruvkhandelwal005.github.io/mess-menu/calender.json';

  useEffect(() => {
    const fetchCollegeId = async () => {
      const id = await AsyncStorage.getItem('collegeId');
      setCollegeId(id);
    };
    fetchCollegeId();
  }, []);

  useEffect(() => {
    if (!collegeId) return;
    const colRef = collection(db, 'timetable', collegeId, 'classes');
    const unsub = onSnapshot(colRef, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClasses(data);
    });
    return unsub;
  }, [collegeId]);

  useEffect(() => {
    if (!collegeId || classes.length === 0) return;
    
    const fetchAttendanceData = async () => {
      const newAttendanceData = {};
      for (const cls of classes) {
        try {
          const attendanceRef = doc(db, 'attendance', `${collegeId}_${cls.id}`);
          const docSnap = await getDoc(attendanceRef);
          if (docSnap.exists()) {
            newAttendanceData[cls.id] = docSnap.data();
          }
        } catch (error) {
          console.error(`Error fetching attendance for class ${cls.id}:`, error);
        }
      }
      setAttendanceData(newAttendanceData);
    };

    fetchAttendanceData();
  }, [classes, collegeId]);

  useEffect(() => {
    fetch(CALENDAR_URL)
      .then(res => res.json())
      .then(data => setCalendarEvents(data))
      .catch(() => {});
  }, []);

  const isHoliday = calendarEvents[todayISO]?.type === 'holiday';

  const toggleDay = (day) => {
    setNewClass(prev => ({
      ...prev,
      days: { ...prev.days, [day]: !prev.days[day] }
    }));
  };

  const handleAddClass = async () => {
    const selectedDays = Object.entries(newClass.days)
      .filter(([_, val]) => val)
      .map(([day]) => day);

    if (!newClass.name.trim() || selectedDays.length === 0) {
      Alert.alert('Error', 'Please enter class name and select days.');
      return;
    }

    try {
      await addDoc(collection(db, 'timetable', collegeId, 'classes'), {
        ...newClass,
        days: selectedDays
      });

      setModalVisible(false);
      setNewClass({
        type: 'Lecture',
        name: '',
        days: { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false }
      });
    } catch (error) {
      console.error('Error adding class:', error);
      Alert.alert('Error', 'Failed to add class. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'timetable', collegeId, 'classes', id));
      await deleteDoc(doc(db, 'attendance', `${collegeId}_${id}`));
      // Remove from local state
      setClasses(prev => prev.filter(cls => cls.id !== id));
      setAttendanceData(prev => {
        const newData = { ...prev };
        delete newData[id];
        return newData;
      });
    } catch (error) {
      console.error('Error deleting class:', error);
      Alert.alert('Error', 'Failed to delete class. Please try again.');
    }
  };

  const markAttendance = async (classId, status) => {
    try {
      const classObj = classes.find(c => c.id === classId);
      if (!classObj) {
        Alert.alert('Error', 'Class not found');
        return;
      }

      if (!classObj.days.includes(todayDay)) {
        Alert.alert('Error', 'You can only mark attendance on scheduled class days');
        return;
      }

      const attendanceRef = doc(db, 'attendance', `${collegeId}_${classId}`);
      const docSnap = await getDoc(attendanceRef);
      const currentAttendance = docSnap.exists() ? docSnap.data() : {};

      if (currentAttendance[todayISO]) {
        Alert.alert('Error', 'Attendance already marked for today');
        return;
      }

      await setDoc(attendanceRef, {
        ...currentAttendance,
        [todayISO]: status
      }, { merge: true });

      setAttendanceData(prev => ({
        ...prev,
        [classId]: {
          ...currentAttendance,
          [todayISO]: status
        }
      }));
    } catch (error) {
      console.error('Error marking attendance:', error);
      Alert.alert('Error', 'Failed to mark attendance. Please try again.');
    }
  };

  const renderClass = (cls) => {
    const isToday = cls.days.includes(todayDay);
    const todayStatus = attendanceData[cls.id]?.[todayISO];
    const attendance = attendanceData[cls.id] || {};
    const allDates = Object.keys(attendance);
    const total = allDates.length;
    const present = allDates.filter(date => attendance[date] === 'present').length;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;

    return (
      <TouchableOpacity 
        key={cls.id} 
        style={styles.card}
        onLongPress={() => {
          Alert.alert(
            'Delete Class',
            `Are you sure you want to delete ${cls.name}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', onPress: () => handleDelete(cls.id), style: 'destructive' }
            ]
          );
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.title}>{cls.type}: {cls.name}</Text>
        <Text style={styles.days}>
          {cls.days.map(d => (
            <Text key={d} style={d === todayDay ? styles.today : {}}>
              {d}{' '}
            </Text>
          ))}
        </Text>

        {isToday && !isHoliday && !todayStatus && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={() => markAttendance(cls.id, 'present')}
              style={[styles.attendBtn, styles.presentBtn]}
            >
              <Text style={styles.buttonText}>Attended</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => markAttendance(cls.id, 'absent')}
              style={[styles.attendBtn, styles.absentBtn]}
            >
              <Text style={styles.buttonText}>Skipped</Text>
            </TouchableOpacity>
          </View>
        )}

        {(todayStatus || total > 0) && (
          <Text style={styles.percent}>
            Attendance: {percent}% ({present}/{total})
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (!collegeId) {
    return (
      <View style={styles.center}>
        <Text>You must be logged in to access this feature.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Your Timetable</Text>
        {classes.map(renderClass)}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalVisible(true)}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalHeader}>Add Class/Lab</Text>

            <TouchableOpacity
              style={styles.toggle}
              onPress={() =>
                setNewClass(prev => ({
                  ...prev,
                  type: prev.type === 'Lecture' ? 'Lab' : 'Lecture'
                }))
              }
            >
              <Text>{newClass.type}</Text>
            </TouchableOpacity>

            <TextInput
              placeholder="Class Name"
              style={styles.input}
              value={newClass.name}
              onChangeText={(t) => setNewClass(prev => ({ ...prev, name: t }))}
            />

            <Text style={styles.label}>Select Days:</Text>
            <View style={styles.daysRow}>
              {daysOfWeek.map(day => (
                <View key={day} style={styles.dayItem}>
                  <Text>{day}</Text>
                  <Switch
                    value={newClass.days[day]}
                    onValueChange={() => toggleDay(day)}
                  />
                </View>
              ))}
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                onPress={handleAddClass} 
                style={styles.submit}
              >
                <Text style={styles.submitText}>Add Class</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)} 
                style={styles.cancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    padding: 16 
  },
  scrollContainer: {
    paddingBottom: 100
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20,
    color: '#333'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  days: { 
    marginTop: 8,
    marginBottom: 8,
    color: '#7f8c8d'
  },
  today: { 
    fontWeight: 'bold', 
    color: '#e74c3c'
  },
  percent: { 
    marginTop: 10, 
    color: '#3498db', 
    fontWeight: '600' 
  },
  buttonRow: { 
    flexDirection: 'row', 
    gap: 10, 
    marginTop: 12 
  },
  attendBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  presentBtn: {
    backgroundColor: '#4CAF50'
  },
  absentBtn: {
    backgroundColor: '#F44336'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#3498db',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5
  },
  modalOverlay: {
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', 
    alignItems: 'center'
  },
  modal: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 20,
    borderRadius: 12,
    elevation: 5
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
    textAlign: 'center'
  },
  toggle: {
    backgroundColor: '#ecf0f1',
    alignSelf: 'flex-start',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16
  },
  input: {
    borderWidth: 1, 
    borderColor: '#bdc3c7',
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 16,
    fontSize: 16
  },
  daysRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    marginBottom: 16
  },
  dayItem: {
    width: '30%',
    margin: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: { 
    fontWeight: 'bold', 
    marginBottom: 8,
    color: '#2c3e50'
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  submit: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold'
  },
  cancel: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8
  },
  cancelText: {
    color: 'white',
    fontWeight: 'bold'
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20
  }
});

export default TimetableScreen;