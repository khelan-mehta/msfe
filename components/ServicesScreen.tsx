import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Search, X, Star, MapPin, TrendingUp } from 'lucide-react-native';
import Geolocation from '@react-native-community/geolocation';

import { Container } from './Container';
import { Header } from './Header';
import { ServiceModal } from 'components/ServiceModal';
import { WorkersModal } from 'components/WorkersModal';
import { authorizedFetch } from 'utils/authorizedFetch';
import { API_BASE_URL } from '../constants';
import { useToast } from '../context/ToastContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* -------------------- TYPES -------------------- */
interface Service {
  _id?: string;
  serviceId: string;
  name: string;
  serviceCategory: string;
  price: string;
  rating: string;
  description: string;
  icon: string;
  color: string;
}

interface WorkerFromAPI {
  _id?: { $oid: string };
  user_id: { $oid: string };
  categories: string[];
  subcategories: string[];
  experience_years: number;
  description: string;
  hourly_rate: number;
  license_number?: string | null;
  service_areas: string[];
  subscription_plan: string;
  is_verified: boolean;
  is_available: boolean;
  rating: number;
  total_reviews: number;
  total_jobs_completed: number;
  location: {
    type: string;
    coordinates: [number, number];
  };
}

interface Worker {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  phone: string;
  experience: string;
  profileImage: any;
  specialization: string[];
  hourlyRate: number;
  serviceAreas: string[];
  description: string;
  subscriptionPlan: string;
  distance?: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

/* -------------------- CATEGORY IMAGES -------------------- */
const categoryImages: { [key: string]: any } = {
  Ac: require('../assets/acrepair.jpg'),
  'Plumbing Services': require('../assets/plumber.jpg'),
  'Electrical Services': require('../assets/electrician.jpg'),
  'Home Appliances Repair': require('../assets/homeappliances.jpg'),
  'Man Salon': require('../assets/mensalon.jpg'),
  'Woman Salon': require('../assets/womensalon.jpg'),
  'Bike Services': require('../assets/bike.jpg'),
  'Car Services': require('../assets/car.jpg'),
  'Carpenter Services': require('../assets/carpenter.jpg'),
  'Cleaning Services': require('../assets/cleaning.jpg'),
  'Painting & Renovation': require('../assets/painter.jpg'),
  'Event & Professional Services': require('../assets/events.jpg'),
  'Cctv Setup': require('../assets/electrician.jpg'),
  'Wifi Setup': require('../assets/electrician.jpg'),
};

/* -------------------- THEME -------------------- */
const theme = {
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  secondary: '#8B5CF6',
  accent: '#F59E0B',
  success: '#10B981',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    tertiary: '#94A3B8',
  },
  border: '#E2E8F0',
};

/* -------------------- GOOGLE MAPS API KEY -------------------- */
const GOOGLE_MAPS_API_KEY = 'AIzaSyCMO_1dOAF7VJKnzEOu1dwhaxCtsfy_HMg';

/* -------------------- SCREEN -------------------- */
const ServicesScreen = () => {
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [categoryServices, setCategoryServices] = useState<Service[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationName, setLocationName] = useState<string>('your area');
  const [locationLoading, setLocationLoading] = useState(false);

  /* -------------------- LOCATION NAME FROM COORDINATES -------------------- */
  const getLocationName = async (lat: number, lng: number) => {
    try {
      setLocationLoading(true);
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();

      if (data.status === 'OK' && data.results?.length) {
        const address = data.results[0].address_components;

        // Try multiple location types for best result
        const locality =
          address.find((c: any) => c.types.includes('locality')) ||
          address.find((c: any) => c.types.includes('administrative_area_level_2')) ||
          address.find((c: any) => c.types.includes('sublocality')) ||
          address.find((c: any) => c.types.includes('sublocality_level_1'));

        if (locality?.long_name) {
          setLocationName(locality.long_name);
          console.log('Location name set to:', locality.long_name);
        } else {
          // Fallback to first part of formatted address
          const formattedParts = data.results[0].formatted_address.split(',');
          const firstPart = formattedParts[0]?.trim();
          setLocationName(firstPart || 'your area');
          console.log('Location name set to (fallback):', firstPart);
        }
      } else {
        console.warn('Geocoding API returned status:', data.status);
        setLocationName('your area');
      }
    } catch (e) {
      console.error('Reverse geocoding failed:', e);
      setLocationName('your area');
    } finally {
      setLocationLoading(false);
    }
  };

  /* -------------------- LOCATION PERMISSION -------------------- */
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleLocationFailure = () => {
    console.warn('Using fallback location');
    setUserLocation({ latitude: 21.1702, longitude: 72.8311 });
    setLocationName('Surat');
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        handleLocationFailure();
      }
      return;
    }

    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      getCurrentLocation();
      return;
    }

    // 🌐 WEB
    if (navigator.geolocation) {
      getCurrentLocation();
    } else {
      handleLocationFailure();
    }
  };

  const getCurrentLocation = () => {
    if (Platform.OS === 'web') {
      if (!navigator.geolocation) {
        handleLocationFailure();
        return;
      }

      const onSuccess = (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;

        console.log('Location obtained (web):', latitude, longitude);

        setUserLocation({ latitude, longitude });
        getLocationName(latitude, longitude);

        toast.showSuccess('Location Found', 'Showing workers near you');
      };

      const onError = (err: GeolocationPositionError) => {
        console.warn('Location error (web):', err);

        // Retry once if timeout
        if (err.code === err.TIMEOUT) {
          navigator.geolocation.getCurrentPosition(onSuccess, fallbackError, {
            enableHighAccuracy: false,
            timeout: 30000,
          });
          return;
        }

        fallbackError(err);
      };

      const fallbackError = (_err: GeolocationPositionError) => {
        setUserLocation({ latitude: 21.1702, longitude: 72.8311 });
        setLocationName('Surat');
        toast.showInfo('Using Default Location', 'Enable location for accurate results');
      };

      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: false, // IMPORTANT for web
        timeout: 15000,
        maximumAge: 60000,
      });

      return;
    }

    // ---------- Native (Android / iOS) ----------
    Geolocation.getCurrentPosition(
      (position: any) => {
        const { latitude, longitude } = position.coords;

        setUserLocation({ latitude, longitude });
        getLocationName(latitude, longitude);

        toast.showSuccess('Location Found', 'Showing workers near you');
      },
      () => {
        setUserLocation({ latitude: 21.1702, longitude: 72.8311 });
        setLocationName('Surat');
        toast.showInfo('Using Default Location', 'Enable location for accurate results');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  /* -------------------- API CALLS -------------------- */
  const fetchAllServices = async () => {
    try {
      const response = await authorizedFetch(`${API_BASE_URL}/services`);
      const data = await response.json();

      if (data.success && data.data) {
        setServices(data.data.services || []);
      } else {
        toast.showError('Error', data.message || 'Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.showError('Network Error', 'Failed to load services');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await authorizedFetch(`${API_BASE_URL}/services/categories`);
      const data = await response.json();

      if (data.success && data.data) {
        setCategories(['All', ...(data.data.categories || [])]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchServicesByCategory = async (category: string) => {
    try {
      const response = await authorizedFetch(
        `${API_BASE_URL}/services/category/${encodeURIComponent(category)}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setCategoryServices(data.data.services || []);
      } else {
        setCategoryServices([]);
        toast.showInfo('No Services', `No services found in ${category}`);
      }
    } catch (error) {
      console.error('Error fetching category services:', error);
      setCategoryServices([]);
    }
  };

  const searchServices = async (query: string) => {
    if (!query.trim()) {
      setFilteredServices(services);
      return;
    }

    try {
      const response = await authorizedFetch(
        `${API_BASE_URL}/services/search/${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setFilteredServices(data.data.services || []);
      } else {
        setFilteredServices([]);
      }
    } catch (error) {
      console.error('Error searching services:', error);
      setFilteredServices([]);
    }
  };

  const fetchNearbyWorkers = async (service: Service) => {
    try {
      if (!userLocation) {
        toast.showWarning(
          'Location Required',
          'Please enable location services to find nearby workers'
        );
        return [];
      }

      const response = await authorizedFetch(
        `${API_BASE_URL}/worker/nearby?` +
          `latitude=${userLocation.latitude}&` +
          `longitude=${userLocation.longitude}&` +
          `category=${encodeURIComponent(service.serviceCategory)}&` +
          `subcategory=${encodeURIComponent(service.name)}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        const workers: WorkerFromAPI[] = data.data.workers || [];

        if (workers.length === 0) {
          return [];
        }

        const transformedWorkers: Worker[] = workers.map((worker) => ({
          id: worker._id?.$oid || worker.user_id.$oid,
          name: `${worker.description.split(' ')[0] || 'Worker'}`,
          rating: worker.rating || 0,
          reviewCount: worker.total_reviews || 0,
          phone: '+91 98765 43210',
          experience: `${worker.experience_years} years experience`,
          profileImage: require('../assets/hero3.jpg'),
          specialization: worker.subcategories || [],
          hourlyRate: worker.hourly_rate || 0,
          serviceAreas: worker.service_areas || [],
          description: worker.description || '',
          subscriptionPlan: worker.subscription_plan || 'none',
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            worker.location.coordinates[1],
            worker.location.coordinates[0]
          ),
        }));

        transformedWorkers.sort((a, b) => (a.distance || 0) - (b.distance || 0));

        toast.showSuccess('Workers Found', `${transformedWorkers.length} workers available nearby`);
        return transformedWorkers;
      }
      return [];
    } catch (error) {
      console.error('Error fetching nearby workers:', error);
      toast.showError('Error', 'Failed to fetch nearby workers');
      return [];
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
  };

  /* -------------------- EFFECTS -------------------- */
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchAllServices(), fetchCategories()]);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadInitialData(), getCurrentLocation()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (selectedFilter === 'All') {
      setFilteredServices(services);
    } else {
      const filtered = services.filter((s) => s.serviceCategory === selectedFilter);
      setFilteredServices(filtered);
    }
  }, [selectedFilter, services]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchServices(searchQuery);
      } else {
        setFilteredServices(services);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, services]);

  /* -------------------- HANDLERS -------------------- */
  const handleCategoryPress = async (category: string) => {
    setSelectedCategory(category);
    setShowServiceModal(true);
    await fetchServicesByCategory(category);
  };

  const handleServiceItemPress = async (service: Service) => {
    setSelectedService(service);
    setShowServiceModal(false);

    const workers = await fetchNearbyWorkers(service);

    if (!workers || workers.length === 0) {
      toast.showWarning(
        'No Workers Nearby',
        'No workers available within 10km for this service. Try again later or search in other areas.'
      );
      return;
    }

    setAvailableWorkers(workers);
    setShowWorkerModal(true);
  };

  /* -------------------- GROUP BY CATEGORY -------------------- */
  const groupedServices = useMemo(() => {
    const groups: { [key: string]: Service[] } = {};

    filteredServices.forEach((service) => {
      if (!groups[service.serviceCategory]) {
        groups[service.serviceCategory] = [];
      }
      groups[service.serviceCategory].push(service);
    });

    return Object.entries(groups).map(([category, items]) => ({
      category,
      services: items,
      count: items.length,
      rating: (items.reduce((sum, s) => sum + parseFloat(s.rating), 0) / items.length).toFixed(1),
    }));
  }, [filteredServices]);

  const cardWidth = (SCREEN_WIDTH - 56) / 2;

  /* -------------------- LOADING STATE -------------------- */
  if (loading) {
    return (
      <Container>
        <Header name="Services" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      </Container>
    );
  }

  /* -------------------- UI -------------------- */
  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }>
        <Header name="Services" />

        {userLocation && (
          <View style={styles.locationBanner}>
            <MapPin size={16} color={theme.primary} />
            {locationLoading ? (
              <ActivityIndicator size="small" color={theme.primary} style={{ marginLeft: 8 }} />
            ) : (
              <Text style={styles.locationText}>Showing workers within 10km of {locationName}</Text>
            )}
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <TrendingUp size={20} color={theme.primary} />
            <Text style={styles.statNumber}>{services.length}+</Text>
            <Text style={styles.statLabel}>Services</Text>
          </View>
          <View style={styles.statCard}>
            <Star size={20} color={theme.accent} />
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statCard}>
            <MapPin size={20} color={theme.success} />
            <Text style={styles.statNumber}>10km</Text>
            <Text style={styles.statLabel}>Radius</Text>
          </View>
        </View>

        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Search size={20} color={theme.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for services..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.text.tertiary}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <X size={18} color={theme.text.secondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filters}
          contentContainerStyle={styles.filtersContent}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.filterChip, selectedFilter === category && styles.filterActive]}
              onPress={() => setSelectedFilter(category)}
              activeOpacity={0.7}>
              <Text
                style={selectedFilter === category ? styles.filterTextActive : styles.filterText}
                numberOfLines={1}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}{' '}
            available
          </Text>
          <Text style={styles.resultsSubtext}>Near you</Text>
        </View>

        {groupedServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No services found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          groupedServices.map(({ category, services: categoryItems, count, rating }) => (
            <View key={category} style={styles.categorySection}>
              <TouchableOpacity
                style={styles.categoryHeaderCard}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.9}>
                <Image
                  source={categoryImages[category] || categoryImages['Ac']}
                  style={styles.categoryHeaderImage}
                  resizeMode="cover"
                />
                <View style={styles.categoryHeaderOverlay}>
                  <View style={styles.categoryHeaderContent}>
                    <View style={styles.categoryHeaderLeft}>
                      <Text style={styles.categoryTitle}>{category}</Text>
                      <View style={styles.categoryMeta}>
                        <View style={styles.categoryMetaItem}>
                          <Star size={14} color="#FFF" fill="#FFF" />
                          <Text style={styles.categoryMetaText}>{rating}</Text>
                        </View>
                        <View style={styles.categoryMetaDot} />
                        <Text style={styles.categoryMetaText}>
                          {count} {count === 1 ? 'service' : 'services'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.viewAllBtn}>
                      <Text style={styles.viewAllBtnText}>View All</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.servicesGrid}>
                {categoryItems.slice(0, 4).map((service) => (
                  <TouchableOpacity
                    key={service.serviceId}
                    style={[styles.card]}
                    onPress={() => handleServiceItemPress(service)}
                    activeOpacity={0.9}>
                    <View style={styles.cardImageContainer}>
                      <Image
                        source={categoryImages[service.serviceCategory] || categoryImages['Ac']}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                      <View style={styles.cardImageOverlay} />

                      <View style={styles.ratingBadge}>
                        <Star size={10} color="#FFF" fill="#FFF" />
                        <Text style={styles.ratingBadgeText}>{service.rating}</Text>
                      </View>
                    </View>

                    <View style={styles.cardBody}>
                      <Text numberOfLines={2} style={styles.cardTitle}>
                        {service.name}
                      </Text>
                      <Text numberOfLines={2} style={styles.cardDescription}>
                        {service.description}
                      </Text>

                      <View style={styles.cardFooter}>
                        <TouchableOpacity style={styles.cardBookBtn}>
                          <Text style={styles.cardBookBtnText}>Book</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <ServiceModal
        visible={showServiceModal}
        category={selectedCategory}
        services={categoryServices}
        onClose={() => {
          setShowServiceModal(false);
          setCategoryServices([]);
        }}
        onServicePress={handleServiceItemPress}
      />

      <WorkersModal
        visible={showWorkerModal}
        workers={availableWorkers}
        serviceName={selectedService?.name || ''}
        onClose={() => {
          setShowWorkerModal(false);
          setAvailableWorkers([]);
        }}
        onWorkerSelect={() => {}}
      />
    </Container>
  );
};

export default ServicesScreen;

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
  },
  loadingText: {
    marginTop: 16,
    color: theme.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },

  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    gap: 8,
  },
  locationText: {
    fontSize: 13,
    color: theme.primary,
    fontWeight: '600',
  },

  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.text.secondary,
    marginTop: 4,
    fontWeight: '600',
  },

  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.text.primary,
    fontWeight: '500',
  },
  clearBtn: {
    padding: 4,
  },

  filters: {
    marginBottom: 20,
    paddingBottom: 10,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: theme.surface,
    borderWidth: 1.5,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  filterActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
    shadowColor: theme.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  filterText: {
    color: theme.text.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  resultsHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text.primary,
  },
  resultsSubtext: {
    fontSize: 13,
    color: theme.text.secondary,
    marginTop: 2,
    fontWeight: '500',
  },

  categorySection: {
    marginBottom: 48,
  },
  categoryHeaderCard: {
    marginHorizontal: 20,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  categoryHeaderImage: {
    width: '100%',
    height: '100%',
  },
  categoryHeaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
  },
  categoryHeaderLeft: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryMetaText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
  },
  viewAllBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  viewAllBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
    justifyContent: 'space-between',
  },

  card: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    width: '47%',
  },
  cardImageContainer: {
    position: 'relative',
    height: 140,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  ratingBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 6,
    lineHeight: 22,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.text.secondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.primary,
  },
  cardBookBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  cardBookBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  bottomSpacer: {
    height: 40,
  },
});
