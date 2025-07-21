/**
 * Enterprise Image Caching and Optimization Service
 * 
 * Handles image loading, caching, and optimization for pharmacy product images
 * with fallback mechanisms and performance monitoring.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { ImageSourcePropType } from 'react-native';

export interface CachedImage {
  url: string;
  localUri: string;
  size: number;
  timestamp: number;
  expires: number;
}

export interface ImageLoadResult {
  uri: string;
  isLocal: boolean;
  isFallback: boolean;
  loadTime: number;
}

class ImageCacheService {
  private static instance: ImageCacheService;
  private cache: Map<string, CachedImage> = new Map();
  private loadingPromises: Map<string, Promise<ImageLoadResult>> = new Map();
  private readonly cacheDir = `${FileSystem.documentDirectory}image_cache/`;
  private readonly maxCacheSize = 100 * 1024 * 1024; // 100MB
  private readonly cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days

  static getInstance(): ImageCacheService {
    if (!ImageCacheService.instance) {
      ImageCacheService.instance = new ImageCacheService();
    }
    return ImageCacheService.instance;
  }

  /**
   * Initialize the cache service
   */
  async initialize(): Promise<void> {
    try {
      // Ensure cache directory exists
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }

      // Load cache index
      await this.loadCacheIndex();
      
      // Clean expired cache
      await this.cleanExpiredCache();
      
      console.log('Image cache service initialized');
    } catch (error) {
      console.error('Error initializing image cache:', error);
    }
  }

  /**
   * Get optimized image with caching and fallback
   */
  async getOptimizedImage(
    imageUrl: string,
    fallbackImage?: ImageSourcePropType,
    options: {
      width?: number;
      height?: number;
      quality?: number;
    } = {}
  ): Promise<ImageLoadResult> {
    const startTime = Date.now();

    try {
      // If imageUrl is empty or invalid, return fallback immediately
      if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
        if (fallbackImage) {
          const fallbackUri = this.getFallbackImageUri(fallbackImage);
          if (fallbackUri) {
            return {
              uri: fallbackUri,
              isLocal: true,
              isFallback: true,
              loadTime: Date.now() - startTime
            };
          }
        }
        
        // Return default fallback
        return {
          uri: this.getDefaultFallbackUri(),
          isLocal: true,
          isFallback: true,
          loadTime: Date.now() - startTime
        };
      }

      // Check if already loading
      if (this.loadingPromises.has(imageUrl)) {
        return await this.loadingPromises.get(imageUrl)!;
      }

      // Check cache first
      const cached = await this.getCachedImage(imageUrl);
      if (cached) {
        return {
          uri: cached.localUri,
          isLocal: true,
          isFallback: false,
          loadTime: Date.now() - startTime
        };
      }

      // Create loading promise
      const loadingPromise = this.loadAndCacheImage(imageUrl, options);
      this.loadingPromises.set(imageUrl, loadingPromise);

      try {
        const result = await loadingPromise;
        this.loadingPromises.delete(imageUrl);
        return result;
      } catch (error) {
        this.loadingPromises.delete(imageUrl);
        
        // Return fallback image
        if (fallbackImage) {
          const fallbackUri = this.getFallbackImageUri(fallbackImage);
          return {
            uri: fallbackUri,
            isLocal: true,
            isFallback: true,
            loadTime: Date.now() - startTime
          };
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Error getting optimized image:', error);
      
      // Return default fallback
      return {
        uri: this.getDefaultFallbackUri(),
        isLocal: true,
        isFallback: true,
        loadTime: Date.now() - startTime
      };
    }
  }

  /**
   * Preload images for better performance
   */
  async preloadImages(imageUrls: string[]): Promise<void> {
    const promises = imageUrls.map(url => 
      this.getOptimizedImage(url).catch(error => {
        console.warn(`Failed to preload image: ${url}`, error);
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Load and cache image from URL
   */
  private async loadAndCacheImage(
    imageUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
    }
  ): Promise<ImageLoadResult> {
    const startTime = Date.now();

    try {
      // Validate URL
      if (!this.isValidImageUrl(imageUrl)) {
        throw new Error('Invalid image URL');
      }

      // Generate cache key and file path
      const cacheKey = this.generateCacheKey(imageUrl, options);
      const localPath = `${this.cacheDir}${cacheKey}.jpg`;

      // Download image
      const downloadResult = await FileSystem.downloadAsync(imageUrl, localPath);
      
      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status: ${downloadResult.status}`);
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (!fileInfo.exists) {
        throw new Error('Downloaded file not found');
      }

      // Create cache entry
      const cachedImage: CachedImage = {
        url: imageUrl,
        localUri: localPath,
        size: fileInfo.size || 0,
        timestamp: Date.now(),
        expires: Date.now() + this.cacheExpiry
      };

      // Save to cache
      this.cache.set(imageUrl, cachedImage);
      await this.saveCacheIndex();

      return {
        uri: localPath,
        isLocal: true,
        isFallback: false,
        loadTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Error loading and caching image:', error);
      throw error;
    }
  }

  /**
   * Get cached image if available and not expired
   */
  private async getCachedImage(imageUrl: string): Promise<CachedImage | null> {
    try {
      const cached = this.cache.get(imageUrl);
      
      if (cached) {
        // Check if expired
        if (Date.now() > cached.expires) {
          await this.removeCachedImage(imageUrl);
          return null;
        }

        // Check if file still exists
        const fileInfo = await FileSystem.getInfoAsync(cached.localUri);
        if (fileInfo.exists) {
          return cached;
        } else {
          // File was deleted, remove from cache
          await this.removeCachedImage(imageUrl);
        }
      }
    } catch (error) {
      console.error('Error getting cached image:', error);
    }

    return null;
  }

  /**
   * Remove image from cache
   */
  private async removeCachedImage(imageUrl: string): Promise<void> {
    try {
      const cached = this.cache.get(imageUrl);
      if (cached) {
        // Delete file
        const fileInfo = await FileSystem.getInfoAsync(cached.localUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(cached.localUri);
        }
        
        // Remove from cache
        this.cache.delete(imageUrl);
        await this.saveCacheIndex();
      }
    } catch (error) {
      console.error('Error removing cached image:', error);
    }
  }

  /**
   * Clean expired cache entries
   */
  private async cleanExpiredCache(): Promise<void> {
    try {
      const now = Date.now();
      const expiredUrls: string[] = [];

      for (const [url, cached] of this.cache.entries()) {
        if (now > cached.expires) {
          expiredUrls.push(url);
        }
      }

      // Remove expired entries
      const promises = expiredUrls.map(url => this.removeCachedImage(url));
      await Promise.allSettled(promises);

      console.log(`Cleaned ${expiredUrls.length} expired cache entries`);
    } catch (error) {
      console.error('Error cleaning expired cache:', error);
    }
  }

  /**
   * Load cache index from storage
   */
  private async loadCacheIndex(): Promise<void> {
    try {
      const cacheIndexData = await AsyncStorage.getItem('image_cache_index');
      if (cacheIndexData) {
        const cacheIndex: CachedImage[] = JSON.parse(cacheIndexData);
        
        for (const cached of cacheIndex) {
          this.cache.set(cached.url, cached);
        }
      }
    } catch (error) {
      console.error('Error loading cache index:', error);
    }
  }

  /**
   * Save cache index to storage
   */
  private async saveCacheIndex(): Promise<void> {
    try {
      const cacheIndex = Array.from(this.cache.values());
      await AsyncStorage.setItem('image_cache_index', JSON.stringify(cacheIndex));
    } catch (error) {
      console.error('Error saving cache index:', error);
    }
  }

  /**
   * Generate cache key for image with options
   */
  private generateCacheKey(imageUrl: string, options: any): string {
    const urlHash = this.hashString(imageUrl);
    const optionsHash = this.hashString(JSON.stringify(options));
    return `${urlHash}_${optionsHash}`;
  }

  /**
   * Simple hash function for strings
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Validate if URL is a valid image URL
   */
  private isValidImageUrl(url: string): boolean {
    try {
      // Check for empty or whitespace-only strings
      if (!url || typeof url !== 'string' || url.trim() === '') {
        return false;
      }

      // Basic URL format validation
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return false;
      }

      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      
      // Check for image extensions
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));
      
      // Check for common image indicators
      const hasImageIndicator = pathname.includes('image') || 
                               pathname.includes('img') || 
                               pathname.includes('photo') ||
                               pathname.includes('product');

      return hasImageExtension || hasImageIndicator;
    } catch {
      return false;
    }
  }

  /**
   * Get URI for fallback image
   */
  private getFallbackImageUri(fallbackImage: ImageSourcePropType): string {
    if (typeof fallbackImage === 'string') {
      return fallbackImage;
    } else if (typeof fallbackImage === 'number') {
      // For require() images, we can't get the URI directly
      return '';
    } else if (typeof fallbackImage === 'object' && !Array.isArray(fallbackImage) && 'uri' in fallbackImage) {
      return fallbackImage.uri || '';
    }
    return '';
  }

  /**
   * Get default fallback image URI
   */
  private getDefaultFallbackUri(): string {
    return 'https://via.placeholder.com/300x300/CCCCCC/666666?text=Product+Image';
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalEntries: number;
    totalSize: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  }> {
    let totalSize = 0;
    let oldestTimestamp = Number.MAX_SAFE_INTEGER;
    let newestTimestamp = 0;

    for (const cached of this.cache.values()) {
      totalSize += cached.size;
      oldestTimestamp = Math.min(oldestTimestamp, cached.timestamp);
      newestTimestamp = Math.max(newestTimestamp, cached.timestamp);
    }

    return {
      totalEntries: this.cache.size,
      totalSize,
      oldestEntry: oldestTimestamp === Number.MAX_SAFE_INTEGER ? null : new Date(oldestTimestamp),
      newestEntry: newestTimestamp === 0 ? null : new Date(newestTimestamp)
    };
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    try {
      // Delete all cached files
      const promises = Array.from(this.cache.values()).map(cached =>
        FileSystem.deleteAsync(cached.localUri).catch(error => {
          console.warn('Error deleting cached file:', error);
        })
      );

      await Promise.allSettled(promises);

      // Clear memory cache
      this.cache.clear();

      // Clear storage index
      await AsyncStorage.removeItem('image_cache_index');

      console.log('Image cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export default ImageCacheService;
