import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { format, isSameDay } from 'date-fns';

const DiscussionScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [collegeId, setCollegeId] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const getId = async () => {
      const id = await AsyncStorage.getItem('collegeId');
      setCollegeId(id);
      setIsRegistered(!!id);
    };
    getId();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));

      const grouped = [];
      let lastDate = null;

      msgs.forEach((msg) => {
        const msgDate = msg.timestamp;
        const msgDay = format(msgDate, 'EEEE, dd MMM yyyy');

        if (!lastDate || !isSameDay(msgDate, lastDate)) {
          grouped.push({ type: 'separator', day: msgDay });
        }

        grouped.push({ type: 'message', ...msg });
        lastDate = msgDate;
      });

      setMessages(grouped);
    });

    return unsubscribe;
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;

    await addDoc(collection(db, 'messages'), {
      sender: collegeId=="ADMIN001"?"Admin":collegeId,
      content: message.trim(),
      timestamp: new Date(),
    });

    setMessage('');
  };

  const confirmDelete = (id) => {
    Alert.alert(
      'Delete Message?',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteDoc(doc(db, 'messages', id)),
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    if (item.type === 'separator') {
      return (
        <View style={styles.separator}>
          <Text style={styles.separatorText}>{item.day}</Text>
        </View>
      );
    }

    const isOwnMessage = item.sender === collegeId;

    return (
      <TouchableOpacity
        onLongPress={() => {
          if (isOwnMessage) confirmDelete(item.id);
        }}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.message,
            isOwnMessage ? styles.ownMessage : styles.otherMessage,
          ]}
        >
          <Text style={styles.sender}>{item.sender}</Text>
          <Text style={styles.content}>{item.content}</Text>
          <Text style={styles.timestamp}>
            {format(item.timestamp, 'hh:mm a')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item, index) => item.id || item.day + index}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {!isRegistered ? (
          <View style={styles.registerPrompt}>
            <Text style={styles.registerText}>
              Please login to send messages
            </Text>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message..."
              style={styles.input}
              editable={isRegistered}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
              disabled={!message.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Text style={styles.warningText}>
          Please keep the conversation respectful and avoid misuse.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageList: {
    paddingBottom: 120, // Enough space for input container
  },
  separator: {
    alignItems: 'center',
    marginVertical: 10,
  },
  separatorText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#444',
  },
  message: {
    borderRadius: 10,
    padding: 10,
    marginVertical: 4,
    maxWidth: '80%',
  },
  ownMessage: {
    backgroundColor: '#D1FAD7',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
  },
  sender: {
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },
  content: {
    fontSize: 15,
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#777',
    marginTop: 6,
    textAlign: 'right',
  },
  registerPrompt: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  warningText: {
    position: 'absolute',
    bottom: 5,
    left: 10,
    right: 10,
    fontSize: 12,
    textAlign: 'center',
    color: '#888',
  },
});

export default DiscussionScreen;