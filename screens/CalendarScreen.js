import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';

const CALENDAR_URL = 'https://dhruvkhandelwal005.github.io/mess-menu/calender.json?v=' + Date.now();

const CalendarScreen = () => {
  const [markedDates, setMarkedDates] = useState({});
  const [events, setEvents] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await fetch(CALENDAR_URL);
        const data = await res.json();

        const marks = {};
        const allEvents = {};

        for (const [date, detail] of Object.entries(data)) {
          marks[date] = {
            selected: true,
            selectedColor:
              detail.type === 'holiday'
                ? '#FF6B6B' // red
                : detail.type === 'event'
                ? '#4C9AFF' // blue
                : '#34C759', // green for academic
          };
          allEvents[date] = detail;
        }

        setMarkedDates(marks);
        setEvents(allEvents);
      } catch (err) {
        console.error('Error fetching calendar:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, []);

  const onDayPress = (day) => {
    const selected = day.dateString;
    setSelectedEvent(events[selected] || null);
  };

  const getNextEvent = (type) => {
    const today = new Date();
    const sortedDates = Object.keys(events).sort();
    for (let date of sortedDates) {
      const eventDate = new Date(date);
      if (eventDate >= today && events[date].type === type) {
        return { date, ...events[date] };
      }
    }
    return null;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const upcomingHoliday = getNextEvent('holiday');
  const upcomingEvent = getNextEvent('event');

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#FFDE59" />
      ) : (
        <>
          <Calendar
            markedDates={markedDates}
            onDayPress={onDayPress}
            theme={{
              todayTextColor: '#FFDE59',
              selectedDayBackgroundColor: '#FFDE59',
              arrowColor: '#000',
              textDayFontWeight: '600',
              textMonthFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 18,
            }}
          />

          {selectedEvent && (
            <View style={styles.eventBox}>
              <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
            </View>
          )}

        <View style={styles.upcomingBox}>
  {upcomingHoliday && (
    <View style={[styles.upcomingCard, { backgroundColor: '#FFE5E5' }]}>
      <Text style={styles.upcomingTitle}>Upcoming Holiday</Text>
      <Text style={styles.upcomingName}>{upcomingHoliday.title}</Text>
      <Text style={styles.upcomingDate}>📅 {formatDate(upcomingHoliday.date)}</Text>
    </View>
  )}
  {upcomingEvent && (
    <View style={[styles.upcomingCard, { backgroundColor: '#E6F0FF' }]}>
      <Text style={styles.upcomingTitle}>Upcoming Event</Text>
      <Text style={styles.upcomingName}>{upcomingEvent.title}</Text>
      <Text style={styles.upcomingDate}>📅 {formatDate(upcomingEvent.date)}</Text>
    </View>
  )}
</View>

        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  eventBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff9d6',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
 upcomingBox: {
  marginTop: 24,
  gap: 12,
},

upcomingCard: {
  borderRadius: 12,
  padding: 16,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
  elevation: 2,
},

upcomingTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#333',
  marginBottom: 4,
},

upcomingName: {
  fontSize: 15,
  color: '#000',
  fontWeight: '500',
},

upcomingDate: {
  fontSize: 13,
  color: '#444',
  marginTop: 4,
},

});

export default CalendarScreen;
