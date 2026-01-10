
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Platform, Dimensions, ImageBackground } from 'react-native';
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';

interface PortfolioItem {
  id: string;
  imageUrl: string;
  category: string;
  description: string;
}

// Using placeholder URLs until actual images are uploaded
const portfolioItems: PortfolioItem[] = [
  // Color Category - Using placeholder images
  { id: '1', imageUrl: 'https://images.unsplash.com/photo-1590246814883-57c511e2aa85?w=400&h=400&fit=crop', category: 'Color', description: 'Vibrant color tattoo' },
  { id: '2', imageUrl: 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=400&h=400&fit=crop', category: 'Color', description: 'Colorful design' },
  { id: '3', imageUrl: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=400&fit=crop', category: 'Color', description: 'Bold color work' },
  { id: '4', imageUrl: 'https://images.unsplash.com/photo-1598371611756-e2a8f9a27b8c?w=400&h=400&fit=crop', category: 'Color', description: 'Bright tattoo art' },
  { id: '5', imageUrl: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=400&h=400&fit=crop', category: 'Color', description: 'Color masterpiece' },
  
  // Full Chest Piece - Using existing uploaded images
  { id: '6', imageUrl: require('@/assets/images/19ce952e-1a16-437a-a5c5-00a57a981f0f.jpeg'), category: 'Full Chest Piece', description: 'Epic chest piece' },
  { id: '7', imageUrl: require('@/assets/images/5218d117-8e58-41b8-9c7a-5be17ef8be67.jpeg'), category: 'Full Chest Piece', description: 'Detailed chest work' },
  { id: '8', imageUrl: require('@/assets/images/6c3284b5-0f51-4f2b-933a-644588f28f0c.jpeg'), category: 'Full Chest Piece', description: 'Intricate design' },
  { id: '9', imageUrl: require('@/assets/images/96452489-bfb6-4410-9711-cb94eed663db.jpeg'), category: 'Full Chest Piece', description: 'Bold chest tattoo' },
  { id: '10', imageUrl: require('@/assets/images/dda2e130-a70a-40b3-bb91-aa26c3252d3c.jpeg'), category: 'Full Chest Piece', description: 'Masterful chest piece' },
  
  // Portraits - Placeholder
  { id: '11', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop', category: 'Portraits', description: 'Realistic portrait' },
  { id: '12', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', category: 'Portraits', description: 'Portrait art' },
  
  // Custom
  { id: '13', imageUrl: 'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=400&h=400&fit=crop', category: 'Custom', description: 'Custom design' },
  
  // Cover Ups
  { id: '14', imageUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400&h=400&fit=crop', category: 'Cover Ups', description: 'Cover up transformation' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  categoryFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: colors.background,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.7,
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null);

  const categories = ['All', 'Color', 'Full Chest Piece', 'Portraits', 'Custom', 'Cover Ups'];

  const filteredItems = selectedCategory === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  const renderGrid = () => (
    <View style={styles.grid}>
      {filteredItems.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.gridItem}
          onPress={() => {
            setSelectedImage(item);
            setModalVisible(true);
          }}
        >
          <View style={styles.imageContainer}>
            <Image 
              source={typeof item.imageUrl === 'string' ? { uri: item.imageUrl } : item.imageUrl} 
              style={styles.image} 
            />
          </View>
          <Text style={styles.description}>{item.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ImageBackground 
      source={require('@/assets/images/natively-dark.png')}
      style={styles.container}
      imageStyle={{ opacity: 0.1 }}
    >
      <ScrollView>
        <View style={styles.categoryFilter}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderGrid()}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <IconSymbol 
              ios_icon_name="xmark" 
              android_material_icon_name="close" 
              size={24} 
              color={colors.background} 
            />
          </TouchableOpacity>
          {selectedImage && (
            <Image 
              source={typeof selectedImage.imageUrl === 'string' ? { uri: selectedImage.imageUrl } : selectedImage.imageUrl} 
              style={styles.modalImage} 
            />
          )}
        </View>
      </Modal>
    </ImageBackground>
  );
}
