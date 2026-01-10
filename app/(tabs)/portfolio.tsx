
import { colors, commonStyles } from '@/styles/commonStyles';
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Platform, Dimensions, ImageBackground } from 'react-native';

interface PortfolioItem {
  id: string;
  imageUrl: string;
  category: string;
  description: string;
}

const portfolioItems: PortfolioItem[] = [
  // Color Category
  { id: '1', imageUrl: require('@/assets/images/color1.jpg'), category: 'Color', description: 'Vibrant color tattoo' },
  { id: '2', imageUrl: require('@/assets/images/color2.jpg'), category: 'Color', description: 'Colorful design' },
  { id: '3', imageUrl: require('@/assets/images/color3.jpg'), category: 'Color', description: 'Bold color work' },
  { id: '4', imageUrl: require('@/assets/images/color4.jpg'), category: 'Color', description: 'Bright tattoo art' },
  { id: '5', imageUrl: require('@/assets/images/color5.jpg'), category: 'Color', description: 'Color masterpiece' },

  // Full Chest Piece Category - NEW IMAGES
  { id: '6', imageUrl: require('@/assets/images/5218d117-8e58-41b8-9c7a-5be17ef8be67.jpeg'), category: 'Full Chest Piece', description: 'Religious themed chest piece' },
  { id: '7', imageUrl: require('@/assets/images/6c3284b5-0f51-4f2b-933a-644588f28f0c.jpeg'), category: 'Full Chest Piece', description: 'Horror movie chest tattoo' },
  { id: '8', imageUrl: require('@/assets/images/dda2e130-a70a-40b3-bb91-aa26c3252d3c.jpeg'), category: 'Full Chest Piece', description: 'Religious portrait chest piece' },
  { id: '9', imageUrl: require('@/assets/images/19ce952e-1a16-437a-a5c5-00a57a981f0f.jpeg'), category: 'Full Chest Piece', description: 'Wings and text chest tattoo' },
  { id: '10', imageUrl: require('@/assets/images/96452489-bfb6-4410-9711-cb94eed663db.jpeg'), category: 'Full Chest Piece', description: 'Horror themed full chest' },

  // Portraits Category
  { id: '11', imageUrl: require('@/assets/images/d5e7e6f5-e0e0-4b5e-8b5e-5e5e5e5e5e5e.jpeg'), category: 'Portraits', description: 'Realistic portrait' },
  { id: '12', imageUrl: require('@/assets/images/e6f7f8f9-f1f1-4c6f-9c6f-6f6f6f6f6f6f.jpeg'), category: 'Portraits', description: 'Portrait tattoo' },
  { id: '13', imageUrl: require('@/assets/images/f7g8h9i0-g2g2-4d7g-0d7g-7g7g7g7g7g7g.jpeg'), category: 'Portraits', description: 'Face portrait' },
  { id: '14', imageUrl: require('@/assets/images/g8h9i0j1-h3h3-4e8h-1e8h-8h8h8h8h8h8h.jpeg'), category: 'Portraits', description: 'Portrait art' },
  { id: '15', imageUrl: require('@/assets/images/h9i0j1k2-i4i4-4f9i-2f9i-9i9i9i9i9i9i.jpeg'), category: 'Portraits', description: 'Detailed portrait' },

  // Custom Category
  { id: '16', imageUrl: require('@/assets/images/custom1.jpg'), category: 'Custom', description: 'Custom design' },
  { id: '17', imageUrl: require('@/assets/images/custom2.jpg'), category: 'Custom', description: 'Unique custom work' },
  { id: '18', imageUrl: require('@/assets/images/custom3.jpg'), category: 'Custom', description: 'Personalized tattoo' },
  { id: '19', imageUrl: require('@/assets/images/custom4.jpg'), category: 'Custom', description: 'Custom art piece' },
  { id: '20', imageUrl: require('@/assets/images/custom5.jpg'), category: 'Custom', description: 'Bespoke design' },

  // Cover Ups Category
  { id: '21', imageUrl: require('@/assets/images/coverup1.jpg'), category: 'Cover Ups', description: 'Cover up transformation' },
  { id: '22', imageUrl: require('@/assets/images/coverup2.jpg'), category: 'Cover Ups', description: 'Tattoo cover up' },
  { id: '23', imageUrl: require('@/assets/images/coverup3.jpg'), category: 'Cover Ups', description: 'Cover up work' },
  { id: '24', imageUrl: require('@/assets/images/coverup4.jpg'), category: 'Cover Ups', description: 'Rework cover up' },
  { id: '25', imageUrl: require('@/assets/images/coverup5.jpg'), category: 'Cover Ups', description: 'Cover up design' },
];

const categories = ['All', 'Color', 'Full Chest Piece', 'Portraits', 'Custom', 'Cover Ups'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  categoryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  categoryScroll: {
    paddingHorizontal: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 144, 255, 0.2)',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  categoryButtonActive: {
    backgroundColor: colors.accent,
  },
  categoryText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.background,
  },
  gridContainer: {
    paddingHorizontal: 10,
    paddingBottom: 100,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  imageCard: {
    width: '48%',
    aspectRatio: 0.75,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(30, 144, 255, 0.3)',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  imageDescription: {
    color: colors.text,
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default function PortfolioScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null);

  const filteredItems = selectedCategory === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  const renderGrid = () => {
    const rows = [];
    for (let i = 0; i < filteredItems.length; i += 2) {
      rows.push(
        <View key={i} style={styles.gridRow}>
          <TouchableOpacity 
            style={styles.imageCard}
            onPress={() => setSelectedImage(filteredItems[i])}
          >
            <Image source={filteredItems[i].imageUrl} style={styles.portfolioImage} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageDescription}>{filteredItems[i].description}</Text>
            </View>
          </TouchableOpacity>
          {filteredItems[i + 1] && (
            <TouchableOpacity 
              style={styles.imageCard}
              onPress={() => setSelectedImage(filteredItems[i + 1])}
            >
              <Image source={filteredItems[i + 1].imageUrl} style={styles.portfolioImage} />
              <View style={styles.imageOverlay}>
                <Text style={styles.imageDescription}>{filteredItems[i + 1].description}</Text>
              </View>
            </TouchableOpacity>
          )}
          {!filteredItems[i + 1] && <View style={styles.imageCard} />}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('@/assets/images/background.jpg')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
          <Text style={styles.subtitle}>Explore Kyle's finest work</Text>
        </View>

        <View style={styles.categoryContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.gridContainer}>
          {filteredItems.length > 0 ? (
            renderGrid()
          ) : (
            <View style={styles.emptyContainer}>
              <IconSymbol name="photo.stack" size={60} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No items in this category yet</Text>
            </View>
          )}
        </ScrollView>

        <Modal
          visible={selectedImage !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
          <View style={styles.modalContainer}>
            {selectedImage && (
              <Image source={selectedImage.imageUrl} style={styles.modalImage} />
            )}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)}
            >
              <IconSymbol name="xmark" size={24} color={colors.background} />
            </TouchableOpacity>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
}
