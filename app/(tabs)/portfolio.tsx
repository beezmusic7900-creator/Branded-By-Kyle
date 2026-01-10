
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Platform, Dimensions, ImageBackground } from 'react-native';
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';

interface PortfolioItem {
  id: string;
  imageUrl: any;
  category: string;
  description: string;
}

// Portfolio items - only actual uploaded images, no stock photos
const portfolioItems: PortfolioItem[] = [
  // Full Chest Piece - Using existing uploaded images
  { id: '6', imageUrl: require('@/assets/images/19ce952e-1a16-437a-a5c5-00a57a981f0f.jpeg'), category: 'Full Chest Piece', description: 'Epic chest piece' },
  { id: '7', imageUrl: require('@/assets/images/5218d117-8e58-41b8-9c7a-5be17ef8be67.jpeg'), category: 'Full Chest Piece', description: 'Detailed chest work' },
  { id: '8', imageUrl: require('@/assets/images/6c3284b5-0f51-4f2b-933a-644588f28f0c.jpeg'), category: 'Full Chest Piece', description: 'Intricate design' },
  { id: '9', imageUrl: require('@/assets/images/96452489-bfb6-4410-9711-cb94eed663db.jpeg'), category: 'Full Chest Piece', description: 'Bold chest tattoo' },
  { id: '10', imageUrl: require('@/assets/images/dda2e130-a70a-40b3-bb91-aa26c3252d3c.jpeg'), category: 'Full Chest Piece', description: 'Masterful chest piece' },
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
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

  const renderGrid = () => {
    if (filteredItems.length === 0) {
      return (
        <View style={styles.emptyState}>
          <IconSymbol 
            ios_icon_name="photo" 
            android_material_icon_name="image" 
            size={64} 
            color={colors.textSecondary} 
          />
          <Text style={styles.emptyText}>
            No images in this category yet.{'\n'}Check back soon for updates!
          </Text>
        </View>
      );
    }

    return (
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
                source={item.imageUrl} 
                style={styles.image} 
              />
            </View>
            <Text style={styles.description}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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
              source={selectedImage.imageUrl} 
              style={styles.modalImage} 
            />
          )}
        </View>
      </Modal>
    </ImageBackground>
  );
}
