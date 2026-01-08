import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface HeaderProps {
  name?: string;
  leftIcon?: LucideIcon;
  onLeftPress?: () => void;
  rightIcon?: LucideIcon;
  onRightPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  name = 'Home',
  leftIcon: LeftIcon,
  onLeftPress,
  rightIcon: RightIcon,
  onRightPress,
}) => {
  const hasLeft = !!LeftIcon;
  const hasRight = !!RightIcon;

  return (
    <View style={[styles.header, (!hasLeft || !hasRight) && styles.spaceBetween]}>
      {/* Left */}
      {hasLeft && (
        <TouchableOpacity style={styles.iconButton} onPress={onLeftPress} hitSlop={10}>
          <LeftIcon size={24} color="#000" />
        </TouchableOpacity>
      )}

      {/* Title */}
      <Text style={[styles.title, (!hasLeft || !hasRight) && styles.titleLeftAligned]}>{name}</Text>

      {/* Right */}
      {hasRight && (
        <TouchableOpacity style={styles.iconButton} onPress={onRightPress} hitSlop={10}>
          <RightIcon size={24} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 0
  },

  spaceBetween: {
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 22,
    fontWeight: '800', // 🔥 bolder
    color: '#1F2937',
  },

  titleLeftAligned: {
    textAlign: 'left',
  },

  iconButton: {
    padding: 8,
  },
});
