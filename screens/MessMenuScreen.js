import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MealCard from '../components/MealCard';

const MENU_URL = 'https://dhruvkhandelwal005.github.io/mess-menu/menu.json?v=' + new Date().getTime();


const MessMenuScreen = () => {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${MENU_URL}?v=${Date.now()}`);
        const data = await res.json();
        setMenu(data);
      } catch (err) {
        console.log('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Weekly Mess Menu</Text>
      {Object.entries(menu).map(([day, meals], index) => (
        <React.Fragment key={index}>
          <Text style={styles.day}>{day}</Text>
          {Object.entries(meals).map(([mealName, items], idx) => (
            <MealCard key={idx} title={mealName} items={items} />
          ))}
        </React.Fragment>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 20 ,  textAlign: 'center',  },
  day: { fontSize: 20, fontWeight: '600', color: '#000000', marginVertical: 12,  textAlign: 'center',   }
});

export default MessMenuScreen;
