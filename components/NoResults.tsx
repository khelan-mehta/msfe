// components/NoResults.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const NoResults: React.FC = () => {
  return (
    <View style={styles.noResultsContainer}>
      <Text style={styles.noResultsText}>No results found</Text>
      <Text style={styles.noResultsSubtext}>Try searching for something else</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  noResultsContainer: {
    width: '100%',
    paddingVertical: 32,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
