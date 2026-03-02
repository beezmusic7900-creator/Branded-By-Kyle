
import { colors, commonStyles } from '@/styles/commonStyles';
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Platform, Dimensions, ImageBackground } from 'react-native';

interface PortfolioItem {
  id: string;
  imageUrl: any;
  category: string;
  description: string;
}

const portfolioItems: PortfolioItem[] = [
  // Color Category
  { id: '1', imageUrl: require('@/assets/images/b80590d0-612a-4e41-9af7-798c3337a3a7.jpeg'), category: 'Color', description: 'Vibrant eye tattoo with electric blue and rainbow colors' },
  
  // Portraits Category
  { id: '2', imageUrl: require('@/assets/images/dee359f2-8548-4cef-a1c3-9c18aa3201f8.jpeg'), category: 'Portraits', description: 'Realistic portrait with "Mommy" script' },
  { id: '3', imageUrl: require('@/assets/images/5ab40570-5339-4299-9f57-898750e0d4d3.jpeg'), category: 'Portraits', description: 'Detailed portrait tattoo' },
  
  // Full Chest Piece Category
  { id: '4', imageUrl: require('@/assets/images/b3cea864-7864-48f0-a3c3-d582b37fe054.png'), category: 'Full Chest Piece', description: 'Intricate full chest piece with Greek key pattern' },
  { id: '5', imageUrl: require('@/assets/images/7ee7d9b9-138a-4a9c-8460-51a59e8473ae.jpeg'), category: 'Full Chest Piece', description: 'Religious themed full chest tattoo' },
];

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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  categoryContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 144, 255, 0.2)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: colors.background,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  gridItem: {
    width: '48%',
    aspectRatio: 0.75,
    margin: '1%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: colors.primary,
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
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function PortfolioScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null);

  const categories = ['All', 'Color', 'Full Chest Piece', 'Portraits', 'Custom', 'Cover Ups'];

  const filteredItems = selectedCategory === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  const handleCategorySelect = (category: string) => {
    console.log('Portfolio: Category selected:', category);
    setSelectedCategory(category);
  };

  const handleImagePress = (item: PortfolioItem) => {
    console.log('Portfolio: Image selected:', item.id);
    setSelectedImage(item);
  };

  const handleCloseModal = () => {
    console.log('Portfolio: Closing image modal');
    setSelectedImage(null);
  };

  const renderGrid = () => {
    return (
      <View style={styles.grid}>
        {filteredItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.gridItem}
            onPress={() => handleImagePress(item)}
          >
            <Image source={item.imageUrl} style={styles.portfolioImage} resizeMode="cover" />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/final_quest_240x240.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.title}>Portfolio</Text>
            <Text style={styles.subtitle}>Kyle's Masterpieces</Text>
          </View>

          <View style={styles.categoryContainer}>
            <View style={styles.categoryButtons}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {renderGrid()}
        </ScrollView>

        <Modal
          visible={selectedImage !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalContainer}>
            {selectedImage && (
              <>
                <Image
                  source={selectedImage.imageUrl}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseModal}
                >
                  <IconSymbol 
                    ios_icon_name="xmark" 
                    android_material_icon_name="close" 
                    size={24} 
                    color={colors.background} 
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
}
