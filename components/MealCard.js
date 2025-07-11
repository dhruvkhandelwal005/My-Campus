import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const getIcon = (title) => {
  const key = title.toLowerCase();
  if (key.includes('breakfast')) return <MaterialCommunityIcons name="food-variant" size={20} color="#FFB300" />;
  if (key.includes('lunch')) return <MaterialIcons name="lunch-dining" size={20} color="#E67E22" />;
  if (key.includes('snack')) return <MaterialCommunityIcons name="coffee" size={20} color="#795548" />;
  if (key.includes('dinner')) return <MaterialIcons name="dinner-dining" size={20} color="#8E44AD" />;
  return null;
};

const MealCard = ({ title, items }) => {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        {getIcon(title)}
        <Text style={styles.mealTitle}>  {title}</Text>
      </View>
      <View style={styles.itemContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.itemBox}>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f2f2f2',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  itemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  itemBox: {
    backgroundColor: '#fff7cc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
    alignSelf: 'flex-start',
    borderWidth: 0.5,
    borderColor: '#f0e1a1',
  },
  itemText: {
    fontSize: 13.5,
    color: '#333',
    fontWeight: '500',
  },
});

export default MealCard;
