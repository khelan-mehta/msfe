import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import { theme } from '../theme'; // assuming you already have this

const { width } = Dimensions.get('window');

const SERVICES = [
//   { id: '1', name: 'Electrician', image: require('../assets/services/electrician.png') },
  { id: '2', name: 'Plumber', image: require('../assets/plumber.png') },
  { id: '3', name: 'AC Repair', image: require('../assets/acrepair.png') },
  { id: '4', name: 'Carpenter', image: require('../assets/carpenter.png') },
//   { id: '5', name: 'Cleaning', image: require('../assets/services/cleaning.png') },
//   { id: '6', name: 'Beauty & Grooming', image: require('../assets/services/beauty.png') },
//   { id: '7', name: 'Painting', image: require('../assets/services/painting.png') },
//   { id: '8', name: 'Event & Services', image: require('../assets/services/event.png') },
];

interface Props {
  onSelectService?: (serviceName: string) => void;
}

const ServiceCategories: React.FC<Props> = ({ onSelectService = () => {} }) => {
  return (
    <FlatList
      data={SERVICES}
      numColumns={4}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.item}
          activeOpacity={0.8}
          onPress={() => onSelectService(item.name)}>
          <Image source={item.image} style={styles.image} resizeMode="cover" />
          <Text style={styles.label}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.background,
  },
  row: {
    justifyContent: 'space-between',
  },
  item: {
    width: width / 4 - 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    marginBottom: 6,
  },
  label: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
});

export default ServiceCategories;