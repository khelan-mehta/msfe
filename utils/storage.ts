import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Get a value from storage
 * @param key string
 * @returns Promise<string | null>
 */
export const getItem = async (key: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    console.error(`Error getting item ${key}:`, error);
    return null;
  }
};

/**
 * Set a value in storage
 * @param key string
 * @param value string
 */
export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting item ${key}:`, error);
  }
};

/**
 * Remove a value from storage
 * @param key string
 */
export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item ${key}:`, error);
  }
};