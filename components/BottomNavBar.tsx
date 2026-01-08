import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Calendar, MessageCircle, User } from 'lucide-react-native';
import { theme } from '../theme';

const tabs = [
  { name: 'home', label: 'Home', Icon: Home },
  { name: 'bookings', label: 'Bookings', Icon: Calendar },
  { name: 'chats', label: 'Chats', Icon: MessageCircle },
  { name: 'profile', label: 'Profile', Icon: User },
];

const BottomNavBar = ({
  activeTab,
  onTabPress,
}: {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        const { Icon } = tab;

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => onTabPress(tab.name)}
            style={styles.tabButton}
          >
            <Icon
              size={24}
              strokeWidth={2}
              color={isActive ? theme.colors.active : theme.colors.inactive}
              style={{ marginBottom: 4 }}
            />
            <Text
              style={{
                color: isActive ? theme.colors.active : theme.colors.inactive,
                fontSize: 12,
                fontWeight: '500',
              }}
            >
              {tab.label}
            </Text>
            {isActive && <View style={[styles.activeIndicator, { backgroundColor: theme.colors.active }]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // gray-200
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
    paddingVertical: 8
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    height: 2,
    width: 40,
    borderRadius: 1,
  },
});