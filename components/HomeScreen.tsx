// HomeScreen.tsx
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Image,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Droplet,
  Zap,
  Brush,
  Fan,
  PaintBucket,
  Trees,
  Wrench,
  Gift,
  Clock,
  Lightbulb,
  Refrigerator,
  Home,
  Phone,
} from 'lucide-react-native';
import { Container } from './Container';
import {
  featuredServices,
  popularPackages,
  serviceCategories,
  getWorkersByCategory,
} from 'utils/mockData';

// Import components
import { Header } from 'components/Header';
import { SearchBar } from 'components/SearchBar';
import { FeaturedServices } from 'components/FeaturedServices';
import { PopularPackages } from 'components/PopularPackages';
import { BrowseServices } from 'components/BrowseServices';
import { TabSelector } from 'components/TabSelector';
import { JobList } from 'components/JobList';
import { ServiceModal } from 'components/ServiceModal';
import { PackageModal } from 'components/PackageModal';
import { WorkersModal } from 'components/WorkersModal';
import { NoResults } from 'components/NoResults';
import HeroImages from './HeroImages';
import { theme } from 'theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Service {
  id: string;
  name: string;
  icon?: any;
  color?: string;
  category: string;
  price?: string;
  duration?: string;
  rating?: string;
  description?: string;
}

interface PackageType {
  id: string;
  name: string;
  services: string;
  price: string;
  discount: string;
  backgroundColor: string;
}

interface Worker {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  phone: string;
  experience: string;
  specialization: string[];
  profileImage: any;
}

const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState<'recent' | 'personalized'>('personalized');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);

  const allServices = Object.values(serviceCategories).flat();
  const allCategories = Object.keys(serviceCategories);

  // Mock data (fixed color strings)
  const recentJobs = [
    {
      id: '1',
      title: 'Need a plumber for a leaky faucet',
      time: 'Posted 2 hours ago',
      location: 'New York, NY',
      icon: Droplet,
      color: '#B3E5FC',
      budget: '₹80-120',
    },
    {
      id: '2',
      title: 'Looking for an electrician to fix a short circuit',
      time: 'Posted 5 hours ago',
      location: 'Newark, NJ',
      icon: Zap,
      color: '#B3E5FC',
      budget: '₹100-150',
    },
    {
      id: '3',
      title: 'Deep cleaning service needed for 3BR apartment',
      time: 'Posted 8 hours ago',
      location: 'Brooklyn, NY',
      icon: Brush,
      color: '#B3E5FC',
      budget: '₹150-200',
    },
    {
      id: '4',
      title: 'AC repair - not cooling properly',
      time: 'Posted 12 hours ago',
      location: 'Queens, NY',
      icon: Fan,
      color: '#B3E5FC',
      budget: '₹90-160',
    },
    {
      id: '5',
      title: 'Interior painting for living room and bedroom',
      time: 'Posted 1 day ago',
      location: 'Manhattan, NY',
      icon: PaintBucket,
      color: '#B3E5FC',
      budget: '₹400-600',
    },
    {
      id: '6',
      title: 'Tree trimming and lawn maintenance',
      time: 'Posted 1 day ago',
      location: 'Staten Island, NY',
      icon: Trees,
      color: '#B3E5FC',
      budget: '₹200-350',
    },
  ];

  // Filter services and categories based on search query
  const filteredServices = allServices.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = allCategories.filter((category) =>
    category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const categoryServices = serviceCategories[category as keyof typeof serviceCategories];
    if (categoryServices && categoryServices.length > 0) {
      return categoryServices[0].icon;
    }
    return Home;
  };

  // Get category services for modal
  const getCategoryServices = () => {
    if (!selectedCategory) return [];
    return serviceCategories[selectedCategory as keyof typeof serviceCategories] || [];
  };

  // Prepare categories for browse
  const browseCategoriesData = allCategories.slice(0, 6).map((category) => ({
    name: category,
    icon: getCategoryIcon(category),
    color: '#0EA5E9',
  }));

  // Event handlers
  const handleNotificationPress = () => {
    console.log('Notification pressed');
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    if (searchQuery === '') {
      setIsSearchFocused(false);
    }
  };

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  const handleJobsButtonPress = () => {
    setIsSearchFocused(false);
    setSearchQuery('');
    console.log('Navigate to Jobs Screen');
  };

  const handleFeaturedServicePress = (service: any) => {
    setSelectedCategory(service.category);
    setShowServiceModal(true);
  };

  const handlePackagePress = (pkg: PackageType) => {
    setSelectedPackage(pkg);
    setShowPackageModal(true);
  };

  // Direct worker selection after service selection
  const handleServiceItemPress = (service: Service) => {
    setSelectedService(service);
    setShowServiceModal(false);

    const category = service.category;
    const workers = getWorkersByCategory(category);

    if (workers.length === 0) {
      Alert.alert(
        'No Workers Available',
        'Sorry, no workers are available for this service at the moment.'
      );
      return;
    }

    setAvailableWorkers(workers);
    setShowWorkerModal(true);
  };

  const handleCategoryPress = (category: any) => {
    setSelectedCategory(category.name);
    setShowServiceModal(true);
  };

  const handleServiceModalClose = () => {
    setShowServiceModal(false);
  };

  const handlePackageModalClose = () => {
    setShowPackageModal(false);
  };

  // Package booking goes directly to worker selection
  const handleBookPackage = () => {
    setShowPackageModal(false);

    const category = selectedCategory || 'General';
    const workers = getWorkersByCategory(category);

    if (workers.length === 0) {
      Alert.alert(
        'No Workers Available',
        'Sorry, no workers are available for this package at the moment.'
      );
      return;
    }

    setAvailableWorkers(workers);
    setShowWorkerModal(true);
  };

  // Worker selection confirmation (fixed template string)
  const handleWorkerSelect = (worker: Worker) => {
    setSelectedWorker(worker);
    setShowWorkerModal(false);

    const serviceName = selectedService?.name || selectedPackage?.name || '';
    Alert.alert(
      'Booking Confirmed!',
      `Your ${serviceName} has been booked!\n\nWorker: ${worker.name}\nPhone: ${worker.phone}\nExperience: ${worker.experience}\n\nThe worker will contact you shortly to schedule the service.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setSelectedService(null);
            setSelectedPackage(null);
            setSelectedWorker(null);
            setAvailableWorkers([]);
          },
        },
      ]
    );
  };

  const handleWorkerModalClose = () => {
    setShowWorkerModal(false);
  };

  const handleJobPress = (job: any) => {
    console.log('Job pressed:', job.title);
  };

  const handleOffersPress = () => {
    console.log('Book Advance pressed');
    Alert.alert('Offers', 'Book your service in advance and get exclusive discounts!');
  };

  // Featured services data - improved cards (4 items)
  const featuredServicesData = [
    {
      id: 'f1',
      name: 'AC Services',
      image: require('../assets/acrepair.jpg'),
      category: 'Ac',
      subtitle: 'Repair • Installation • Service',
      price: 'From ₹300',
    },
    {
      id: 'f2',
      name: 'Plumbing Services',
      image: require('../assets/plumber.jpg'),
      category: 'Plumbing Services',
      subtitle: 'Leak Fix • Fittings • Tank Cleaning',
      price: 'From ₹150',
    },
    {
      id: 'f3',
      name: 'Electrical Services',
      image: require('../assets/electrician.jpg'),
      category: 'Electrical Services',
      subtitle: 'Wiring • Socket • Lighting',
      price: 'From ₹200',
    },
    {
      id: 'f4',
      name: 'Home Appliances Repair',
      image: require('../assets/homeappliances.jpg'),
      category: 'Home Appliances Repair',
      subtitle: 'Fridge • WM • RO • Microwave',
      price: 'From ₹250',
    },
  ];

  /* -----------------------
     FeaturedGrid component
     Minimal, professional cards (2x2)
     ----------------------- */
  const FeaturedGrid: React.FC = () => {
    const cardMargin = 12;
    const numColumns = 2;
    const totalHorizontalPadding = 40;
    const cardWidth = Math.floor(
      (SCREEN_WIDTH - totalHorizontalPadding - cardMargin * (numColumns - 1)) / numColumns
    );

    return (
      <View style={styles.featuredWrapper}>
        {/* Header Row */}
        <View style={styles.featuredHeaderRow}>
          <Text style={styles.sectionTitle}>Featured Services</Text>
          <TouchableOpacity onPress={() => console.log('View all featured')}>
            <Text style={styles.viewAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Grid */}
        <View style={styles.featuredGrid}>
          {featuredServicesData.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.featuredCardRevamp, { width: cardWidth }]}
              activeOpacity={0.9}
              onPress={() => {
                setSelectedCategory(item.category);
                setShowServiceModal(true);
              }}>
              <ImageBackground
                source={item.image}
                style={styles.cardImageRevamp}
                imageStyle={styles.cardImageStyleRevamp}>
                {/* Dark overlay + soft gradient */}
                <View style={styles.cardOverlayRevamp} />

                {/* Price Chip */}
                <View style={styles.priceChipRevamp}>
                  <Text style={styles.priceChipText}>{item.price}</Text>
                </View>

                {/* Content */}
                <View style={styles.cardBodyRevamp}>
                  <Text numberOfLines={1} style={styles.cardTitleRevamp}>
                    {item.name}
                  </Text>

                  <Text numberOfLines={1} style={styles.cardSubtitleRevamp}>
                    {item.subtitle}
                  </Text>

                  {/* Bottom Action Bar */}
                  <TouchableOpacity
                    style={styles.actionBarRevamp}
                    onPress={() => {
                      setSelectedCategory(item.category);
                      setShowServiceModal(true);
                    }}
                    activeOpacity={0.85}>
                    <Text style={styles.actionBarText}>Call Now</Text>

                    <View style={styles.actionArrowCircle}>
                      <Phone size={18} color={theme.colors.background} />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Shine Overlay */}
                <View style={styles.shineOverlayRevamp} />
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Container>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Header onNotificationPress={handleNotificationPress} />

        {/* Hero Banner */}
        {!isSearchFocused && <HeroImages />}

        {/* Offers Button */}
        {!isSearchFocused && (
          <TouchableOpacity style={styles.offersButton} onPress={handleOffersPress}>
            <Text style={styles.offersButtonText}>Offers 20% Off</Text>
            <Text style={styles.offersButtonSubtext}>Book Advance</Text>
          </TouchableOpacity>
        )}

        {/* Featured (new look) */}
        {!isSearchFocused && <FeaturedGrid />}

        {/* Main Content - Only show when not searching */}
        {!isSearchFocused && (
          <>
            {/* Popular Packages */}
            {/* <PopularPackages packages={popularPackages} onPackagePress={handlePackagePress} /> */}

            {/* Browse Services Section */}
            <BrowseServices
              title="Browse Services"
              items={browseCategoriesData}
              onItemPress={handleCategoryPress}
            />

            {/* Tabs */}
            <View style={styles.featuredWrapper}>

              <View style={styles.featuredHeaderRow}>
                <Text style={styles.sectionTitle}>Recent Jobs</Text>
                <TouchableOpacity onPress={() => console.log('View all featured')}>
                  <Text style={styles.viewAllText}>See all</Text>
                </TouchableOpacity>
              </View>
              <JobList jobs={recentJobs} onJobPress={handleJobPress} />
            </View>

            {/* Updates Section */}
            <View style={styles.featuredWrapper}>

              <View style={styles.featuredHeaderRow}>
                <Text style={styles.sectionTitle}>Updates</Text>
              </View>
              <TouchableOpacity
                style={styles.updateItem}
                onPress={() => console.log('Update pressed')}>
                <View style={[styles.updateIcon, { backgroundColor: '#B3E5FC' }]}>
                  <Gift size={24} color="#0EA5E9" />
                </View>
                <View style={styles.updateContent}>
                  <Text style={styles.updateTitle}>Check out our latest promotions</Text>
                  <Text style={styles.updateSubtitle}>New offers available</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <ServiceModal
        visible={showServiceModal}
        category={selectedCategory}
        services={getCategoryServices()}
        onClose={handleServiceModalClose}
        onServicePress={handleServiceItemPress}
      />

      <PackageModal
        visible={showPackageModal}
        package={selectedPackage}
        onClose={handlePackageModalClose}
        onBookPress={handleBookPackage}
      />

      <WorkersModal
        visible={showWorkerModal}
        workers={availableWorkers}
        serviceName={selectedService?.name || selectedPackage?.name || ''}
        onClose={handleWorkerModalClose}
        onWorkerSelect={handleWorkerSelect}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 100,
  },


  /* Section Headers */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
    // paddingHorizontal: 14
  },

  viewAllText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  /* --- Revamped Featured Styles --- */

  featuredCardRevamp: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
    marginBottom: 14,
  },

  cardImageRevamp: {
    width: '100%',
    height: 190,
    justifyContent: 'flex-end',
  },

  cardImageStyleRevamp: {
    resizeMode: 'cover',
  },

  cardOverlayRevamp: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  priceChipRevamp: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: { elevation: 4 },
    }),
  },

  priceChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },

  cardBodyRevamp: {
    padding: 16,
    paddingBottom: 20,
  },

  cardTitleRevamp: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.background,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  cardSubtitleRevamp: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F1F5F9',
    opacity: 0.9,
    marginBottom: 14,
  },

  actionBarRevamp: {
    backgroundColor: theme.colors.background,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },

  actionBarText: {
    fontSize: 14,
    fontWeight: '800',
    color: 'black',
    flex: 1,
  },

  actionArrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  shineOverlayRevamp: {
    position: 'absolute',
    left: -80,
    top: 0,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    transform: [{ skewX: '-20deg' }],
  },

  /* Featured Grid */
  featuredWrapper: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  featuredHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
    marginBottom: 12,
  },
  cardImage: {
    width: '100%',
    height: 180,
    justifyContent: 'flex-end',
  },
  cardImageStyle: {
    resizeMode: 'cover',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,10,0.25)',
  },
  cardTopRightChip: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: 0.2,
  },
  cardBody: {
    padding: 14,
    backgroundColor: 'transparent',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.background,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#F0F4F8',
    marginBottom: 12,
    fontWeight: '500',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bookButtonText: {
    fontWeight: '700',
    color: theme.colors.background,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  infoButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  infoButtonText: {
    fontWeight: '600',
    fontSize: 13,
    color: theme.colors.background,
    opacity: 0.95,
    textDecorationLine: 'underline',
  },

  /* other styles (kept & fixed) */
  searchWithButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  jobsButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  jobsButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  updateIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  updateContent: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  updateSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  heroBanner: {
    marginTop: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    height: 160,
  },
  heroImageIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    position: 'absolute',
    maxWidth: '50%',
    flex: 1,
    paddingLeft: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 2,
    marginTop: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
  },
  heroImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
  heroButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: 'black',
    fontSize: 15,
    fontWeight: '600',
  },
  offersButton: {
    backgroundColor: '#0EA5E9',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offersButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  offersButtonSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 24,
  },
  gridCard: {
    width: '40%', // legacy - not used for new featured
    aspectRatio: 1, // Square cards
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridTitle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    color: 'black',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
});

export default HomeScreen;