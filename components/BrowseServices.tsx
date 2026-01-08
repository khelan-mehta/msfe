// components/BrowseServices.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface BrowseItem {
  id?: string;
  name: string;
  icon: any;
  color: string;
}

interface BrowseServicesProps {
  title: string;
  items: BrowseItem[];
  onItemPress: (item: BrowseItem) => void;
}

export const BrowseServices: React.FC<BrowseServicesProps> = ({ title, items, onItemPress }) => {
  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.browseServicesContainer}>
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.id || index}
              style={styles.browseServiceItem}
              onPress={() => onItemPress(item)}>
              <View style={[styles.browseServiceIcon, { backgroundColor: '#E8F4F8' }]}>
                <Icon size={32} color={item.color} />
              </View>
              <Text style={styles.browseServiceText}>{item.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  browseServicesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  browseServiceItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 16,
  },
  browseServiceIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  browseServiceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
});