import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '../firebase';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';

const CLUBS_URL =
  'https://dhruvkhandelwal005.github.io/mess-menu/clubs.json?v=' + Date.now();

const ClubsScreen = () => {
  const [clubs, setClubs] = useState([]);
  const [expandedClub, setExpandedClub] = useState(null);
  const [collegeId, setCollegeId] = useState(null);
  const [followers, setFollowers] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchId = async () => {
        const id = await AsyncStorage.getItem('collegeId');
        setCollegeId(id);
      };
      fetchId();
    }, [])
  );

  const fetchClubs = async () => {
    try {
      const res = await fetch(CLUBS_URL);
      const json = await res.json();
      setClubs(json.clubs || []);
    } catch (err) {
      Alert.alert('Error', 'Could not load club data');
    }
  };

  const fetchFollowers = async () => {
    const data = {};
    for (const club of clubs) {
      const colRef = collection(db, 'clubs', club.name, 'followers');
      const snap = await getDocs(colRef);
      data[club.name] = snap.docs.map((doc) => doc.id);
    }
    setFollowers(data);
  };

  const loadAll = async () => {
    setRefreshing(true);
    await fetchClubs();
    await fetchFollowers();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchClubs().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (clubs.length > 0) {
      fetchFollowers();
    }
  }, [clubs]);

  const isFollowing = (clubName) =>
    followers[clubName]?.includes(collegeId || 'Guest');

  const toggleFollow = async (clubName) => {
    if (!collegeId) {
      Alert.alert('Login Required', 'Only registered users can follow clubs.');
      return;
    }

    const docRef = doc(db, 'clubs', clubName, 'followers', collegeId);

    try {
      if (isFollowing(clubName)) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { followedAt: new Date() });
      }
      fetchFollowers();
    } catch (err) {
      Alert.alert('Error', 'Could not update follow status.');
    }
  };

  const renderClub = ({ item }) => {
   const isFollowed = isFollowing(item.name);
  const followerCount = followers[item.name]?.length || 0;
  const isExpanded = expandedClub === item.name;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpandedClub(isExpanded ? null : item.name)}
    >
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.logo }} style={styles.logo} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.type}>{item.type}</Text>
          <Text style={styles.followers}>{followerCount} followers</Text>
        </View>

        {collegeId && (
          <TouchableOpacity
            onPress={() => toggleFollow(item.name)}
            style={[
              styles.followButton,
              { backgroundColor: isFollowed ? '#ffcc00' : '#eee' },
            ]}
          >
            <Text style={{ color: isFollowed ? '#000' : '#666' }}>
              {isFollowed ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isExpanded && (
        <View style={styles.details}>
          <Text style={styles.desc}>{item.description}</Text>
          <View style={{ marginTop: 10 }}>
            <Text style={styles.contactTitle}>📞 Contact:</Text>
            {item.contact?.email && <Text>Email: {item.contact.email}</Text>}
            {item.contact?.instagram && <Text>Instagram: {item.contact.instagram}</Text>}
            {item.contact?.linkedin && <Text>LinkedIn: {item.contact.linkedin}</Text>}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffcc00" />
        <Text>Loading clubs...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={clubs}
      keyExtractor={(item) => item.name}
      renderItem={renderClub}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadAll} colors={['#ffcc00']} />
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    height: 60,
    width: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  type: {
    fontSize: 14,
    color: '#555',
  },
  followers: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  details: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  desc: {
    fontSize: 14,
    color: '#444',
  },
  contactTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ClubsScreen;
