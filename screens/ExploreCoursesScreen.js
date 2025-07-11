import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const COURSE_URL = 'https://dhruvkhandelwal005.github.io/mess-menu/courses.json?v=' + Date.now();

const semesterMap = {
  'First Year': ['Semester 1', 'Semester 2'],
  'Second Year': ['Semester 3', 'Semester 4'],
  'Third Year': ['Semester 5', 'Semester 6'],
  'Fourth Year': ['Semester 7', 'Semester 8'],
};

const ExploreCourses = () => {
  const [courseData, setCourseData] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [courses, setCourses] = useState([]);
  const [autoFilled, setAutoFilled] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(COURSE_URL);
        const data = await res.json();
        setCourseData(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const autoDetect = async () => {
      const id = await AsyncStorage.getItem('collegeId');
      if (!id) return;

      const yearCode = id.slice(2, 4); // 24 from BT24CSE001
      const branchCode = id.slice(4, 7).toUpperCase(); // CSE from BT24CSE001

      const currentYear = new Date().getFullYear();
      const intakeYear = 2000 + parseInt(yearCode); // 2024
      const academicYear = currentYear - intakeYear + 1;

      const yearMap = {
        1: 'First Year',
        2: 'Second Year',
        3: 'Third Year',
        4: 'Fourth Year',
      };

      const isOddSem = new Date().getMonth() >= 6; // July to Dec → odd sem
      const semester = isOddSem
        ? (academicYear * 2 - 1)
        : (academicYear * 2);

      const semesterLabel = `Semester ${semester}`;
      const yearLabel = yearMap[academicYear];

      setSelectedYear(yearLabel);
      setSelectedSemester(semesterLabel);
      setSelectedBranch(branchCode);
      setAutoFilled(true);
    };

    autoDetect();
  }, []);

  useEffect(() => {
    if (
      courseData &&
      selectedYear &&
      selectedSemester &&
      selectedBranch &&
      courseData[selectedYear]?.[selectedSemester]?.[selectedBranch]
    ) {
      setCourses(courseData[selectedYear][selectedSemester][selectedBranch]);
    } else {
      setCourses([]);
    }
  }, [selectedYear, selectedSemester, selectedBranch, courseData]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Explore Courses</Text>

      {/* Year Picker */}
      <Text style={styles.label}>Select Year:</Text>
      <Picker
        selectedValue={selectedYear}
        onValueChange={(value) => {
          setSelectedYear(value);
          setSelectedSemester('');
        }}
        style={styles.picker}
      >
        <Picker.Item label="Select Year" value="" />
        <Picker.Item label="First Year" value="First Year" />
        <Picker.Item label="Second Year" value="Second Year" />
        <Picker.Item label="Third Year" value="Third Year" />
        <Picker.Item label="Fourth Year" value="Fourth Year" />
      </Picker>

      {/* Semester Picker (based on selected year) */}
      {selectedYear !== '' && (
        <>
          <Text style={styles.label}>Select Semester:</Text>
          <Picker
            selectedValue={selectedSemester}
            onValueChange={(value) => setSelectedSemester(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Semester" value="" />
            {semesterMap[selectedYear]?.map((sem) => (
              <Picker.Item key={sem} label={sem} value={sem} />
            ))}
          </Picker>
        </>
      )}

      {/* Branch Picker */}
      <Text style={styles.label}>Select Branch:</Text>
      <Picker
        selectedValue={selectedBranch}
        onValueChange={(value) => setSelectedBranch(value)}
        style={styles.picker}
      >
        <Picker.Item label="Select Branch" value="" />
        <Picker.Item label="CSE" value="CSE" />
        <Picker.Item label="CSA" value="CSA" />
        <Picker.Item label="CSH" value="CSH" />
        <Picker.Item label="CSD" value="CSD" />
        <Picker.Item label="ECE" value="ECE" />
        <Picker.Item label="ECI" value="ECI" />
      </Picker>

      {/* Courses List */}
      {courses.length > 0 ? (
        <>
          <Text style={styles.subheading}>Courses:</Text>
          {courses.map((course, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.courseCode}>{course['Course Code']}</Text>
              <Text style={styles.courseName}>{course['Course Name']}</Text>
              <Text style={styles.courseDetails}>
                Type: {course.Type} | Credits: {course.Credits}
              </Text>
            </View>
          ))}
        </>
      ) : (
        <Text style={{ color: '#888', marginTop: 20 }}>No courses found</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#000',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
    color: '#000',
  },
  picker: {
    backgroundColor: '#f1f1f1',
    marginVertical: 8,
  },
  card: {
    backgroundColor: '#fff8dc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: '#ffd700',
    borderWidth: 1,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
  },
  courseName: {
    fontSize: 15,
    color: '#000',
    marginVertical: 4,
  },
  courseDetails: {
    fontSize: 13,
    color: '#555',
  },
});

export default ExploreCourses;
