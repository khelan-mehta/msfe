// JobsScreen.tsx (Expo + React Native)
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  RefreshControl,
} from 'react-native';
import {
  Search,
  ArrowLeft,
  ChevronDown,
  Wrench,
  Zap,
  Brush,
  Paintbrush,
  ChevronLeft,
} from 'lucide-react-native';
import { Container } from './Container';
import { Header } from './Header';
import { JobList } from './JobList';
import { useToast } from '../context/ToastContext';
import { STORAGE_KEYS } from '../constants';
import { getItem, setItem } from '../utils/storage';

const JobsScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const MIN_SEARCH_LENGTH = 3; // only search after this many characters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();
  const shortQueryToastShown = useRef(false);
  const [searchHintSuppressed, setSearchHintSuppressed] = useState<boolean>(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Reset filters and refresh data
    setSelectedCategory('All');
    setSelectedLocation('All');
    setSelectedDate('All');
    setSearchQuery('');
    setDebouncedQuery('');
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Load persisted preference for showing the search hint (once across restarts)
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const val = await getItem(STORAGE_KEYS.SEARCH_HINT_SHOWN);
        if (!mounted) return;
        setSearchHintSuppressed(Boolean(val));
        if (val) shortQueryToastShown.current = true;
      } catch (e) {
        console.warn('Failed to read search hint preference:', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Debounce search input to limit API calls
  React.useEffect(() => {
    const handler = setTimeout(() => {
      const q = searchQuery.trim();
      if (q.length === 0) {
        setDebouncedQuery('');
        shortQueryToastShown.current = false; // reset hint flag when cleared
      } else if (q.length >= MIN_SEARCH_LENGTH) {
        setDebouncedQuery(q);
        shortQueryToastShown.current = false; // reset so future short queries show hint again
      } else {
        // show a one-time toast to inform the user about the minimum search length if not persisted
        if (!shortQueryToastShown.current && !searchHintSuppressed) {
          try {
            toast.showInfo('Search tip', `Type ${MIN_SEARCH_LENGTH}+ characters to search`);
            // Persist preference so we don't show this hint again on future app starts
            setItem(STORAGE_KEYS.SEARCH_HINT_SHOWN, '1').catch(err => console.warn('Failed to persist search hint preference:', err));
            setSearchHintSuppressed(true);
          } catch (e) {
            // swallow if toast unavailable
            console.warn('Toast unavailable:', e);
          }
          shortQueryToastShown.current = true;
        }
        // keep previous debouncedQuery (do not clear results immediately)
      }
    }, 450);

    return () => clearTimeout(handler);
  }, [searchQuery, searchHintSuppressed]);

  const allJobs = [
    {
      id: '1',
      title: 'Fix Leaky Faucet',
      category: 'Plumbing',
      location: 'New York, NY',
      date: 'Today',
      icon: Wrench,
      color: '#B3E5FC',
    },
    {
      id: '2',
      title: 'Install Ceiling Fan',
      category: 'Electrical',
      location: 'Newark, NJ',
      date: 'Today',
      icon: Zap,
      color: '#B3E5FC',
    },
    {
      id: '3',
      title: 'Deep Clean Apartment',
      category: 'Cleaning',
      location: 'Brooklyn, NY',
      date: 'This Week',
      icon: Brush,
      color: '#B3E5FC',
    },
    {
      id: '4',
      title: 'Paint Living Room',
      category: 'Painting',
      location: 'Jersey City, NJ',
      date: 'This Week',
      icon: Paintbrush,
      color: '#B3E5FC',
    },
    {
      id: '5',
      title: 'Fix Refrigerator',
      category: 'Appliance Repair',
      location: 'New York, NY',
      date: 'This Month',
      icon: Wrench,
      color: '#B3E5FC',
    },
    {
      id: '6',
      title: 'Replace Light Switch',
      category: 'Electrical',
      location: 'Brooklyn, NY',
      date: 'Today',
      icon: Zap,
      color: '#B3E5FC',
    },
    {
      id: '7',
      title: 'Clean Kitchen',
      category: 'Cleaning',
      location: 'New York, NY',
      date: 'This Week',
      icon: Brush,
      color: '#B3E5FC',
    },
    {
      id: '8',
      title: 'Unclog Drain',
      category: 'Plumbing',
      location: 'Newark, NJ',
      date: 'This Month',
      icon: Wrench,
      color: '#B3E5FC',
    },
  ];

  const categories = ['All', 'Plumbing', 'Electrical', 'Cleaning', 'Painting', 'Appliance Repair'];
  const locations = ['All', 'New York, NY', 'Newark, NJ', 'Brooklyn, NY', 'Jersey City, NJ'];
  const dates = ['All', 'Today', 'This Week', 'This Month'];

  // Filter jobs based on selected criteria
  const filteredJobs = allJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
    const matchesLocation = selectedLocation === 'All' || job.location === selectedLocation;
    const matchesDate = selectedDate === 'All' || job.date === selectedDate;

    return matchesSearch && matchesCategory && matchesLocation && matchesDate;
  });

  const FilterModal = ({
    visible,
    onClose,
    title,
    options,
    selected,
    onSelect,
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: string[];
    selected: string;
    onSelect: (option: string) => void;
  }) => (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          <Header name='Jobs Listings'/>
          <ScrollView style={styles.modalOptions}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.modalOption, selected === option && styles.modalOptionSelected]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}>
                <Text
                  style={[
                    styles.modalOptionText,
                    selected === option && styles.modalOptionTextSelected,
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <Container>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0EA5E9']}
            tintColor="#0EA5E9"
          />
        }>
        {/* Header */}
        <Header name='Jobs Listings'/>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search for jobs"
            placeholderTextColor="#9CA3AF"
            style={styles.searchBarInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Small hint to guide search usage when query is short */}
        {searchQuery.length > 0 && searchQuery.trim().length < MIN_SEARCH_LENGTH && (
          <Text style={styles.searchHint}>Type {MIN_SEARCH_LENGTH}+ characters to search</Text>
        )}

        {/* Testing Phase Notice */}
        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText}>
            This application is currently in closed testing phase. Some features such as worker calling and booking are under development. Displayed worker contact details are placeholder data for testing purposes. Full functionality will be enabled in upcoming updates.
          </Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersRow}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowCategoryModal(true)}>
            <Text style={styles.filterButtonText}>
              {selectedCategory === 'All' ? 'Category' : selectedCategory}
            </Text>
            <ChevronDown size={16} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowLocationModal(true)}>
            <Text style={styles.filterButtonText}>
              {selectedLocation === 'All' ? 'Location' : selectedLocation}
            </Text>
            <ChevronDown size={16} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowDateModal(true)}>
            <Text style={styles.filterButtonText}>
              {selectedDate === 'All' ? 'Date' : selectedDate}
            </Text>
            <ChevronDown size={16} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
          </Text>
          {(selectedCategory !== 'All' || selectedLocation !== 'All' || selectedDate !== 'All') && (
            <TouchableOpacity
              onPress={() => {
                setSelectedCategory('All');
                setSelectedLocation('All');
                setSelectedDate('All');
              }}>
              <Text style={styles.clearFilters}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Job Listings (remote) */}
        <View style={styles.jobListings}>
          <JobList
            q={debouncedQuery || undefined}
            location={selectedLocation !== 'All' ? selectedLocation : undefined}
            onJobPress={(job: any) => navigation.navigate('JobApply', { jobId: job.id })}
            onResults={(count: number, total?: number) => {
              // update results header if needed (we leave filteredJobs length in-place for instant feedback)
            }}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

        {/* Filter Modals */}
        <FilterModal
          visible={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          title="Select Category"
          options={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <FilterModal
          visible={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          title="Select Location"
          options={locations}
          selected={selectedLocation}
          onSelect={setSelectedLocation}
        />
        <FilterModal
          visible={showDateModal}
          onClose={() => setShowDateModal(false)}
          title="Select Date"
          options={dates}
          selected={selectedDate}
          onSelect={setSelectedDate}
        />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  searchBarInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  searchHint: {
    marginHorizontal: 20,
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
  },
  noticeContainer: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  noticeText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B3E5FC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    maxWidth: 80,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  clearFilters: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  jobListings: {
    flex: 1,
  },
  jobListingsContent: {
    paddingBottom: 20,
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  jobIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  jobCardContent: {
    flex: 1,
  },
  jobCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  jobCardCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  jobCardLocation: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  modalOptions: {
    paddingHorizontal: 20,
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionSelected: {
    backgroundColor: '#F0F9FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  modalOptionTextSelected: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
});

export default JobsScreen;
