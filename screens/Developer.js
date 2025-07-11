import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const Developer = () => {
  const handleLinkedInPress = () => {
    Linking.openURL('https://www.linkedin.com/in/dhruv-khandelwal-3bb127324/');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Message from the Developer</Text>

      <Text style={styles.message}>
        Hi! My name is <Text style={styles.bold}>Dhruv Khandelwal</Text>,  2nd-year CSE student at IIITN.
        Firstly, thank you for downloading and using this app. This is <Text style={styles.bold}>not</Text> IIITN official app !

        I built this app to organize and simplify access to college resources. Inspired by other IITs and NITs
        which have their own apps, I felt our college deserved one too. This app helps manage daily tasks like
        tracking attendance, accessing the mess menu, and other essential features — all in one place.

        I truly hope this app becomes a part of your everyday routine and helps in small ways. Please do drop your feedback
        to help improve it further so we all can stay connected and organized.

        Thank you again for your support!

        Do check out my LinkedIn (and follow if you wish 🙂)
      </Text>
      <Text></Text>

      <TouchableOpacity style={styles.button} onPress={handleLinkedInPress}>
        <AntDesign name="linkedin-square" size={24} color="#0077B5" />
        <Text style={styles.buttonText}>Visit My LinkedIn</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  message: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
  button: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1F5FE',
    padding: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#0077B5',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '600',
  },
});

export default Developer;
