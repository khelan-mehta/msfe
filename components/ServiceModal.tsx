import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
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
  services = [], // Default to empty array
  onClose,
  onServicePress,
}) => {
  // Ensure services is always an array
  const serviceList = Array.isArray(services) ? services : [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop - clicking closes modal */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Modal Content */}
        <View style={styles.modal}>
          {/* Modal Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.categoryBadge}>
                <Info size={24} color={theme.primary} />
              </View>
              <View>
                <Text style={styles.title} numberOfLines={1}>
                  {category || 'Services'}
                </Text>
                <Text style={styles.subtitle}>
                  {serviceList.length} {serviceList.length === 1 ? 'service' : 'services'} available
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={22} color={theme.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Services List */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            bounces={true}
            keyboardShouldPersistTaps="handled"
          >
            {serviceList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Info size={48} color={theme.text.tertiary} />
                </View>
                <Text style={styles.emptyText}>No services available</Text>
                <Text style={styles.emptySubtext}>Check back later for updates</Text>
              </View>
            ) : (
              serviceList.map((service: Service, index: number) => (
                <TouchableOpacity
                  key={service._id || service.serviceId || `service-${index}`}
                  style={[styles.serviceCard, index === 0 && styles.serviceCardFirst]}
                  onPress={() => onServicePress(service)}
                  activeOpacity={0.7}
                >
                  {/* Icon Container */}
                  <View style={[styles.iconContainer, { backgroundColor: service.color || theme.primary }]}>
                    {getServiceIcon(service.icon, 32, '#FFFFFF')}
                    <View style={styles.iconGradient} />
                  </View>

                  {/* Service Info */}
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName} numberOfLines={1}>
                      {service.name}
                    </Text>
                    <Text style={styles.serviceDesc} numberOfLines={2}>
                      {service.description}
                    </Text>
                    <View style={styles.serviceFooter}>
                      <View style={styles.ratingContainer}>
                        <Star size={14} color="#F59E0B" fill="#F59E0B" />
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
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  modal: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: SCREEN_HEIGHT * 0.85,
    minHeight: SCREEN_HEIGHT * 0.3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 24,
    // Ensure the modal doesn't overflow
    overflow: 'hidden',
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: theme.text.secondary,
    marginTop: 2,
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24, // Account for home indicator
    flexGrow: 1,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceCardFirst: {
    marginTop: 0,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
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
    marginLeft: 14,
    marginRight: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  serviceDesc: {
    fontSize: 13,
    color: theme.text.secondary,
    lineHeight: 18,
    marginBottom: 10,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  ratingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
  },
  priceContainer: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.primary,
  },
  arrowContainer: {
    marginLeft: 4,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    flex: 1,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});