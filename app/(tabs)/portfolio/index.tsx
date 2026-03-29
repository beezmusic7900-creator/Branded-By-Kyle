import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const BG = require('../../../assets/images/58f69f1a-4699-4acb-8d6c-e139c289ff00.webp');

const BLUE = '#2979FF';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - 40 - GRID_GAP) / 2;

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

type Category = 'All' | 'Color' | 'Portraits' | 'Neo-Traditional';

const FILTERS: Category[] = ['All', 'Color', 'Portraits', 'Neo-Traditional'];

interface PortfolioItem {
  id: string;
  image: ReturnType<typeof require>;
  caption: string;
  category: Category;
}

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: '1',
    image: require('../../../assets/images/6f697cdc-e6c2-41e2-a10a-4347c0fe5a37.jpeg'),
    caption: 'Vibrant Eye',
    category: 'Color',
  },
  {
    id: '2',
    image: require('../../../assets/images/ef4612ba-fa15-4117-a867-aad3a06cabfb.jpeg'),
    caption: 'Mommy Portrait',
    category: 'Portraits',
  },
  {
    id: '3',
    image: require('../../../assets/images/649f26f4-677f-41ab-bec7-aacdf5fe8117.jpeg'),
    caption: 'Portrait & Reference',
    category: 'Portraits',
  },
  {
    id: '4',
    image: require('../../../assets/images/c5205a19-eb3a-4e40-b551-ad3c70e5513b.jpeg'),
    caption: 'Portrait with Script',
    category: 'Portraits',
  },
  {
    id: '5',
    image: require('../../../assets/images/033a0edf-f449-4e25-a7c3-ae4b4cf6f3ae.jpeg'),
    caption: 'Betty Boop Nurse',
    category: 'Neo-Traditional',
  },
  {
    id: '6',
    image: require('../../../assets/images/dcecead8-1681-451c-be83-5652e34e5151.jpeg'),
    caption: 'Blindfolded Figure',
    category: 'Portraits',
  },
  {
    id: '7',
    image: require('../../../assets/images/57770ded-0f13-439d-94aa-0a94cd3518ec.jpeg'),
    caption: 'Horror Icons',
    category: 'Neo-Traditional',
  },
  {
    id: '8',
    image: require('../../../assets/images/5d8c6f06-6cb7-4c09-ac40-27b6c13727a9.jpeg'),
    caption: 'Jesus & Dove',
    category: 'Portraits',
  },
  {
    id: '9',
    image: require('../../../assets/images/c54d87a1-87c8-4cc1-9a2a-2e76c3ede244.jpeg'),
    caption: 'Anime Chest Piece',
    category: 'Neo-Traditional',
  },
  {
    id: '10',
    image: require('../../../assets/images/5e539714-0419-4c58-a235-77541bc30ddd.jpeg'),
    caption: 'Grim Reaper Clock',
    category: 'Portraits',
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
    <ImageBackground source={BG} style={[styles.container, { paddingTop: insets.top }]} resizeMode="cover">
      <View style={styles.overlay} />
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
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
