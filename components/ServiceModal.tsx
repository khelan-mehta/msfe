import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import {
  X,
  Star,
  Info,
  Wind,
  Wrench,
  Settings,
  Droplet,
  Zap,
  Hammer,
  Sparkles,
  Scissors,
  Car,
  Bike,
  Paintbrush,
  Camera,
  Wifi,
  Home,
  BadgeCheck,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

interface ServiceModalProps {
  visible: boolean;
  category: string | null;
  services: any;
  onClose: () => void;
  onServicePress: any;
}

const theme = {
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  success: '#10B981',
  warning: '#F59E0B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    tertiary: '#94A3B8',
  },
  border: '#E2E8F0',
};

// Icon mapping
const getServiceIcon = (iconName: string, size: number = 28, color: string = '#FFFFFF') => {
  const iconMap: { [key: string]: any } = {
    Fan: Wind,
    Wrench: Wrench,
    Settings: Settings,
    Droplet: Droplet,
    Zap: Zap,
    Hammer: Hammer,
    Sparkles: Sparkles,
    Scissors: Scissors,
    Car: Car,
    Bike: Bike,
    Paintbrush: Paintbrush,
    Camera: Camera,
    Wifi: Wifi,
    Home: Home,
  };

  const IconComponent = iconMap[iconName] || Settings;
  return <IconComponent size={size} color={color} strokeWidth={2} />;
};

export const ServiceModal: React.FC<ServiceModalProps> = ({
  visible,
  category,
  services,
  onClose,
  onServicePress,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View style={styles.modal}>
          {/* Modal Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.categoryBadge}>
                <BadgeCheck size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={styles.title}>{category || 'Services'}</Text>
                <Text style={styles.subtitle}>
                  {services.length} {services.length === 1 ? 'service' : 'services'} available
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={24} color={theme.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Services List */}
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}>
            {services.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Info size={64} color={theme.text.tertiary} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyText}>No services available</Text>
                <Text style={styles.emptySubtext}>Check back later for updates</Text>
              </View>
            ) : (
              services.map((service:any, index:any) => (
                <TouchableOpacity
                  key={service.serviceId}
                  style={[
                    styles.serviceCard,
                    index === 0 && styles.serviceCardFirst,
                  ]}
                  onPress={() => onServicePress(service)}
                  activeOpacity={0.7}>
                  {/* Icon Container with Gradient Background */}
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: service.color || theme.primary },
                    ]}>
                    {getServiceIcon(service.icon, 32, '#FFFFFF')}
                    
                    {/* Subtle gradient overlay */}
                    <View style={styles.iconGradient} />
                  </View>

                  {/* Service Info */}
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDesc} numberOfLines={2}>
                      {service.description}
                    </Text>

                    <View style={styles.serviceFooter}>
                      <View style={styles.ratingContainer}>
                        <Star size={16} color="#FACC15" fill="#FACC15" />
                        <Text style={styles.ratingText}>{service.rating}</Text>
                        <Text style={styles.ratingLabel}>rating</Text>
                      </View>
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>{service.price}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Arrow Indicator */}
                  <View style={styles.arrowContainer}>
                    <View style={styles.arrowCircle}>
                      <Text style={styles.arrowText}>→</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 24,
  },
  handle: {
    width: 48,
    height: 5,
    backgroundColor: theme.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.text.secondary,
    marginTop: 4,
    fontWeight: '500',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  serviceCardFirst: {
    marginTop: 0,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  iconGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  serviceDesc: {
    fontSize: 14,
    color: theme.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  ratingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B45309',
  },
  priceContainer: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.primary,
  },
  arrowContainer: {
    marginLeft: 8,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
});