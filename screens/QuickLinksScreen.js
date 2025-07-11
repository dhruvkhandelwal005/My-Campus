import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const links = [
  {
    title: 'IIITN Website',
    url: 'https://iiitn.ac.in/',
  },
  {
    title: 'Time Table',
    url: 'https://docs.google.com/spreadsheets/u/1/d/e/2PACX-1vSp2JfZZCxiV3e3n3uKekiLFOeh2XQzDov_YDAU4QLRIGD5H6HCoWmQKORMAd8chLib0p-I0749s1Uj/pubhtml?gid=371376379&single=true&urp=gmail_link',
  },
  {
    title: 'Notices',
    url: 'https://iiitn.ac.in/notices',
  },
  {
    title: 'Lab Occupancy',
    url: 'https://docs.google.com/spreadsheets/u/1/d/e/2PACX-1vSp2JfZZCxiV3e3n3uKekiLFOeh2XQzDov_YDAU4QLRIGD5H6HCoWmQKORMAd8chLib0p-I0749s1Uj/pubhtml?gid=349864037&single=true&urp=gmail_link',
  },
  {
    title: 'Academic Calendar',
    url: 'https://iiitn.ac.in/academics/calendar',
  },
  {
    title: 'IIIT Nagpur (LinkedIn)',
    url: 'https://www.linkedin.com/school/indian-institute-of-information-technology-nagpur/posts/?feedView=all',
  },
  {
    title: 'IIIT Nagpur (Instagram)',
    url: 'https://www.instagram.com/iiit_nagpur?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
  },
  {
    title: 'IIIT Nagpur (X/Twitter)',
    url: 'https://x.com/IIITN_OFFICIAL',
  },
  {
    title: 'IIIT Nagpur (Youtube)',
    url: 'https://youtube.com/@indianinstituteofinformati880?si=ETA9C9mG2vvnEreE',
  },
  {
    title: 'IIIT Nagpur (Reddit)',
    url: 'https://www.reddit.com/r/iiitn/',
  },
];

const QuickLinksScreen = () => {
  const openLink = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      alert("Can't open this URL");
    }
  };

  return (
    <ScrollView style={styles.container}>

      {links.map((link, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() => openLink(link.url)}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Text style={styles.linkTitle}>{link.title}</Text>
            <Ionicons name="arrow-forward-circle" size={24} color="#555" />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f7f7f7',
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});

export default QuickLinksScreen;
