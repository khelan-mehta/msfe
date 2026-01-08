// components/TabSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TabSelectorProps {
  activeTab: 'recent' | 'personalized';
  onTabChange: (tab: 'recent' | 'personalized') => void;
}

export const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
        onPress={() => onTabChange('recent')}>
        <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
          Recently Posted Jobs
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'personalized' && styles.activeTab]}
        onPress={() => onTabChange('personalized')}>
        <Text style={[styles.tabText, activeTab === 'personalized' && styles.activeTabText]}>
          Personalized Feed
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0EA5E9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
});
