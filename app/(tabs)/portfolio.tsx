
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Platform, Dimensions } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

const { width } = Dimensions.get('window');
const imageSize = (width - 60) / 2;

interface PortfolioItem {
  id: string;
  imageUrl: string;
  category: string;
  description: string;
}

const portfolioItems: PortfolioItem[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=800',
    category: 'Black & Grey',
    description: 'Realistic portrait work',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800',
    category: 'Color',
    description: 'Vibrant floral design',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800',
    category: 'Black & Grey',
    description: 'Geometric patterns',
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1590246814883-57c511a8c4b9?w=800',
    category: 'Custom',
    description: 'Custom sleeve design',
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800',
    category: 'Color',
    description: 'Traditional style',
  },
  {
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800',
    category: 'Black & Grey',
    description: 'Fine line work',
  },
];

const categories = ['All', 'Black & Grey', 'Color', 'Custom'];

export default function PortfolioScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null);

  const filteredItems = selectedCategory === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <IconSymbol 
            ios_icon_name="photo.fill" 
            android_material_icon_name="photo_library" 
            size={48} 
            color={colors.primary} 
          />
          <Text style={commonStyles.title}>Portfolio</Text>
          <Text style={[commonStyles.text, commonStyles.textCenter]}>
            Browse through my recent work and custom designs
          </Text>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Portfolio Grid */}
        <View style={styles.grid}>
          {filteredItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gridItem}
              onPress={() => setSelectedImage(item)}
            >
              <Image 
                source={{ uri: item.imageUrl }}
                style={styles.gridImage}
                resizeMode="cover"
              />
              <View style={styles.gridOverlay}>
                <Text style={styles.gridCategory}>{item.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}
          >
            <View style={styles.modalContent}>
              {selectedImage && (
                <>
                  <Image 
                    source={{ uri: selectedImage.imageUrl }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalCategory}>{selectedImage.category}</Text>
                    <Text style={styles.modalDescription}>{selectedImage.description}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setSelectedImage(null)}
                  >
                    <IconSymbol 
                      ios_icon_name="xmark.circle.fill" 
                      android_material_icon_name="cancel" 
                      size={36} 
                      color={colors.textBright} 
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryContent: {
    gap: 12,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  gridCategory: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
  },
  modalInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  modalCategory: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalDescription: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 24,
  },
  bottomPadding: {
    height: 40,
  },
});
