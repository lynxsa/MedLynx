/**
 * Smart Product Image Component
 * 
 * Handles automatic image loading, caching, and fallback with
 * loading states and error handling for pharmacy product images.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    ImageStyle,
    StyleSheet,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import ImageCacheService from '../services/ImageCacheService';

interface SmartProductImageProps {
  imageUrl: string;
  fallbackImage?: any;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  showLoadingIndicator?: boolean;
  showErrorIcon?: boolean;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoad?: () => void;
  onError?: (error: Error) => void;
  quality?: number;
  width?: number;
  height?: number;
  borderRadius?: number;
}

export default function SmartProductImage({
  imageUrl,
  fallbackImage,
  style,
  containerStyle,
  showLoadingIndicator = true,
  showErrorIcon = true,
  resizeMode = 'cover',
  onLoad,
  onError,
  quality = 0.8,
  width,
  height,
  borderRadius = 8,
}: SmartProductImageProps) {
  const { theme } = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const imageCache = ImageCacheService.getInstance();

  const loadImage = useCallback(async () => {
    // If no imageUrl provided or it's empty, use fallback immediately
    if (!imageUrl || imageUrl.trim() === '') {
      setIsFallback(true);
      setIsLoading(false);
      setHasError(false);
      
      // If we have a fallback image, use it
      if (fallbackImage) {
        if (typeof fallbackImage === 'string') {
          setImageUri(fallbackImage);
        } else if (typeof fallbackImage === 'number') {
          // For require() images, we can't get URI directly, so we'll let Image component handle it
          setImageUri(null);
        } else if (typeof fallbackImage === 'object' && 'uri' in fallbackImage && fallbackImage.uri) {
          setImageUri(fallbackImage.uri);
        }
      }
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      onLoad?.();
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);

      const result = await imageCache.getOptimizedImage(
        imageUrl,
        fallbackImage,
        { width, height, quality }
      );

      setImageUri(result.uri);
      setIsFallback(result.isFallback);
      setIsLoading(false);

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      onLoad?.();
    } catch (error) {
      console.error('Error loading image:', error);
      setHasError(true);
      setIsLoading(false);
      onError?.(error as Error);
    }
  }, [imageUrl, fallbackImage, width, height, quality, onLoad, onError, fadeAnim, imageCache]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  const handleImageError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    onError?.(new Error('Image failed to load'));
  }, [onError]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const renderContent = () => {
    if (isLoading && showLoadingIndicator) {
      return (
        <View style={[styles.centered, { backgroundColor: theme.colors.backgroundSecondary }]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }

    if (hasError && showErrorIcon) {
      return (
        <View style={[styles.centered, { backgroundColor: theme.colors.backgroundSecondary }]}>
          <Ionicons 
            name="image-outline" 
            size={24} 
            color={theme.colors.textSecondary} 
          />
        </View>
      );
    }

    if (imageUri) {
      return (
        <Animated.Image
          source={{ uri: imageUri }}
          style={[
            styles.image,
            style,
            { 
              opacity: fadeAnim,
              borderRadius,
              backgroundColor: theme.colors.backgroundSecondary 
            }
          ]}
          resizeMode={resizeMode}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      );
    }

    return null;
  };

  return (
    <View 
      style={[
        styles.container,
        containerStyle,
        { borderRadius, backgroundColor: theme.colors.backgroundSecondary }
      ]}
    >
      {renderContent()}
      
      {/* Loading overlay */}
      {isLoading && showLoadingIndicator && (
        <View style={[styles.overlay, { borderRadius }]}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
      
      {/* Error overlay */}
      {hasError && showErrorIcon && (
        <View style={[styles.overlay, { borderRadius }]}>
          <Ionicons 
            name="refresh" 
            size={20} 
            color={theme.colors.textSecondary}
            onPress={loadImage}
          />
        </View>
      )}
      
      {/* Fallback indicator */}
      {isFallback && (
        <View style={styles.fallbackIndicator}>
          <Ionicons 
            name="warning" 
            size={12} 
            color={theme.colors.warning || '#FFA500'} 
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  fallbackIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
