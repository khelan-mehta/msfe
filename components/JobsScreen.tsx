// screens/JobsScreen.tsx - Job browsing screen (shows available jobs)

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { JobList } from './JobList';
import { Header } from './Header';
import { theme } from '../theme';

interface Job {
  id: string;
  title: string;
  company_name?: string | null;
  location?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  description?: string | null;
}

interface Props {
  navigation?: any;
}

const JobsScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobCount, setJobCount] = useState<number>(0);

  const handleJobPress = useCallback(
    (job: Job) => {
      if (navigation) {
        navigation.navigate('JobApply', { jobId: job.id });
      }
    },
    [navigation]
  );

  const handleJobResults = useCallback((count: number, total?: number) => {
    setJobCount(total || count);
  }, []);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header name={`Jobs${jobCount > 0 ? ` (${jobCount})` : ''}`} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <X size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Job List */}
      <View style={styles.listContainer}>
        <JobList
          onJobPress={handleJobPress}
          onResults={handleJobResults}
          q={searchQuery || undefined}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    marginLeft: 10,
    paddingVertical: 0,
  },
  listContainer: {
    flex: 1,
  },
});

export default JobsScreen;
