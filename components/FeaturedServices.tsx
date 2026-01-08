// components/FeaturedServices.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.55;

interface FeaturedService {
  id: string;
  name: string;
  backgroundColor: string;
  category: string;
}

interface FeaturedServicesProps {
  services: FeaturedService[];
  onServicePress: (service: FeaturedService) => void;
}

export const FeaturedServices: React.FC<FeaturedServicesProps> = ({ services, onServicePress }) => {
  return (
    <>
      <Text style={styles.sectionTitle}>Featured Services</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast">
        {services.map((service, index) => (
          <TouchableOpacity
            key={service.id}
            onPress={() => onServicePress(service)}
            style={[
              styles.featuredCard,
              { backgroundColor: service.backgroundColor },
              index === 0 && styles.firstCard,
            ]}>
            <View style={styles.featuredImagePlaceholder} />
            <Text style={styles.featuredCardText}>{service.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  carouselContainer: {
    paddingLeft: 20,
    paddingRight: 4,
    marginBottom: 24,
  },
  featuredCard: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: 24,
    marginRight: 16,
    padding: 16,
    justifyContent: 'flex-end',
  },
  firstCard: {
    marginLeft: 0,
  },
  featuredImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
});
