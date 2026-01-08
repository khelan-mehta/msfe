// components/PopularPackages.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Package, Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

interface PackageType {
  id: string;
  name: string;
  services: string;
  price: string;
  discount: string;
  backgroundColor: string;
}

interface PopularPackagesProps {
  packages: PackageType[];
  onPackagePress: (pkg: PackageType) => void;
}

export const PopularPackages: React.FC<PopularPackagesProps> = ({ packages, onPackagePress }) => {
  return (
    <>
      <Text style={styles.sectionTitle}>Popular Packages</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast">
        {packages.map((pkg, index) => (
          <TouchableOpacity
            key={pkg.id}
            onPress={() => onPackagePress(pkg)}
            style={[styles.packageCard, index === 0 && styles.firstCard]}>
            {/* Discount Badge */}
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{pkg.discount}</Text>
            </View>

            {/* Package Icon */}
            <View style={styles.iconContainer}>
              <Package size={40} color="#0EA5E9" strokeWidth={2} />
            </View>

            {/* Package Info */}
            <View style={styles.packageInfo}>
              <Text style={styles.packageName}>{pkg.name}</Text>
              <Text style={styles.packageServices}>{pkg.services}</Text>

              {/* Rating */}
              <View style={styles.ratingContainer}>
                <Star size={14} color="#FCD34D" fill="#FCD34D" />
                <Text style={styles.ratingText}>4.8</Text>
              </View>

              {/* Price Section */}
              <View style={styles.priceSection}>
                <View>
                  <Text style={styles.priceLabel}>Starting from</Text>
                  <Text style={styles.price}>{pkg.price}</Text>
                </View>
                <TouchableOpacity style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  packageCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  firstCard: {
    marginLeft: 0,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  discountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  iconContainer: {
    width: 72,
    height: 72,
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  packageServices: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0EA5E9',
  },
  bookButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
