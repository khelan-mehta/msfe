// components/ImageSlider.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SlideImage = { id?: string | number; source: any }; // source can be require(...) or { uri: '...' }

type Props = {
  images: SlideImage[];
  autoplay?: boolean;
  interval?: number; // ms
  height?: number;
  dotActiveColor?: string;
  dotInactiveColor?: string;
};

const ImageSlider: React.FC<Props> = ({
  images,
  autoplay = true,
  interval = 3500,
  height = SCREEN_WIDTH * 0.6,
  dotActiveColor = '#0066FF',
  dotInactiveColor = '#E5E7EB',
}) => {
  const flatListRef = useRef<FlatList<any> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoplayRef = useRef<number | null>(null);
  const isInteracting = useRef(false);

  useEffect(() => {
    if (!autoplay || images.length <= 1) return;

    startAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, autoplay, images.length, interval]);

  useEffect(() => {
    return () => stopAutoplay();
  }, []);

  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      if (isInteracting.current) return;
      const next = (currentIndex + 1) % images.length;
      scrollToIndex(next);
    }, interval) as unknown as number;
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(newIndex);
  };

  const renderItem = ({ item }: { item: SlideImage }) => {
    // If source is an object with uri or a require reference, Image handles both.
    return (
      <Image
        source={item.source}
        style={[styles.image, { width: SCREEN_WIDTH, height }]}
        resizeMode="cover"
      />
    );
  };

  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, idx) => (item.id ?? idx).toString()}
        renderItem={renderItem}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={() => {
          isInteracting.current = true;
          stopAutoplay();
        }}
        onScrollEndDrag={() => {
          isInteracting.current = false;
          if (autoplay) startAutoplay();
        }}
      />

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {images.map((_, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => {
              scrollToIndex(idx);
              if (autoplay) {
                stopAutoplay();
                // restart after short delay to give feedback
                setTimeout(() => startAutoplay(), 2000);
              }
            }}
            activeOpacity={0.8}
            style={[
              styles.dot,
              {
                backgroundColor: idx === currentIndex ? dotActiveColor : dotInactiveColor,
                width: idx === currentIndex ? 10 : 8,
                height: idx === currentIndex ? 10 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    // width & height provided dynamically
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    height: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    borderRadius: 8,
    marginHorizontal: 6,
  },
});

export default ImageSlider;