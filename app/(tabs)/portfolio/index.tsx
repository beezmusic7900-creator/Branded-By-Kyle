import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const BLUE = '#2979FF';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - 40 - GRID_GAP) / 2;

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

type Category = 'All' | 'Color' | 'Full Chest Piece' | 'Portraits' | 'Custom' | 'Cover Ups';

const FILTERS: Category[] = ['All', 'Color', 'Full Chest Piece', 'Portraits', 'Custom', 'Cover Ups'];

interface PortfolioItem {
  id: string;
  image: ReturnType<typeof require>;
  caption: string;
  category: Category;
}

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: '1',
    image: require('@/assets/images/0a2ea7a9-8938-440e-86a5-ca2c5d835257.jpeg'),
    caption: 'Vibrant eye tattoo with electric blue and rainbow...',
    category: 'Color',
  },
  {
    id: '2',
    image: require('@/assets/images/ea9519a4-0cf7-4376-a900-a5078265b87f.jpeg'),
    caption: 'Realistic portrait with "Mommy" script',
    category: 'Portraits',
  },
  {
    id: '3',
    image: require('@/assets/images/dff1232d-63a6-440a-833a-bae2be576d81.jpeg'),
    caption: 'Detailed portrait tattoo',
    category: 'Portraits',
  },
  {
    id: '4',
    image: require('@/assets/images/640c6610-bbc3-4cf2-b55b-a7cbb2952c39.jpeg'),
    caption: 'Intricate full chest piece with Greek key pattern',
    category: 'Full Chest Piece',
  },
  {
    id: '5',
    image: require('@/assets/images/b03db91a-b58d-41e9-a499-682890ff57a2.jpeg'),
    caption: 'Custom black and grey design',
    category: 'Custom',
  },
  {
    id: '6',
    image: require('@/assets/images/7090ff25-2cd9-4f9d-a605-2eedb3849c4b.jpeg'),
    caption: 'Stunning cover-up transformation',
    category: 'Cover Ups',
  },
  {
    id: '7',
    image: require('@/assets/images/398ce7de-bcec-468d-ada7-0d6cb1ab9c60.jpeg'),
    caption: 'Bold custom color piece',
    category: 'Color',
  },
];

export default function PortfolioScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<Category>('All');

  const handleFilterPress = (filter: Category) => {
    console.log('[Portfolio] Filter selected:', filter);
    setActiveFilter(filter);
  };

  const filteredItems = activeFilter === 'All'
    ? PORTFOLIO_ITEMS
    : PORTFOLIO_ITEMS.filter((item) => item.category === activeFilter);

  // Build rows of 2
  const rows: PortfolioItem[][] = [];
  for (let i = 0; i < filteredItems.length; i += 2) {
    rows.push(filteredItems.slice(i, i + 2));
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
      >
        {/* Title */}
        <Text style={styles.title}>Portfolio</Text>

        {/* Filter chips */}
        <View style={styles.filtersWrap}>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
                onPress={() => handleFilterPress(filter)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((item) => (
                <View key={item.id} style={styles.card}>
                  <Image
                    source={resolveImageSource(item.image)}
                    style={styles.cardImage}
                    contentFit="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.75)']}
                    style={styles.gradient}
                  />
                  <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
                </View>
              ))}
              {row.length === 1 && <View style={[styles.card, { backgroundColor: 'transparent', borderWidth: 0 }]} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: BLUE,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  filtersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
  },
  chipActive: {
    backgroundColor: BLUE,
  },
  chipInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: BLUE,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  chipTextInactive: {
    color: BLUE,
  },
  grid: {
    gap: GRID_GAP,
  },
  row: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: BLUE,
    marginBottom: GRID_GAP,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  caption: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 16,
  },
});
