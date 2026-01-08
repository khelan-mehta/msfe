import { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Image, Dimensions, StyleSheet, Platform, Animated } from 'react-native';

const heroImages = [
  require('../assets/hero1.jpg'),
  require('../assets/hero2.jpg'),
  require('../assets/hero3.jpg'),
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 1;
const CARD_HEIGHT = 210;

const HeroImages = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (currentIndex + 1) % heroImages.length;
      scrollViewRef.current?.scrollTo({
        x: next * width,
        animated: true,
      });
      setCurrentIndex(next);
    }, 3500);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={width}>
        {heroImages.map((image, index) => (
          <View key={index} style={styles.slideContainer}>
            <View style={styles.cardWrapper}>
              <Image source={image} style={styles.heroImage} resizeMode="cover" />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsContainer}>
        {heroImages.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.activeDot]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CARD_HEIGHT + 60,
    width: '100%',
    marginBottom: 10,
    position: 'relative',
  },
  slideContainer: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: (width - CARD_WIDTH) / 2,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066FF',
  },
});

export default HeroImages;
