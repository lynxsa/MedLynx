import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { FoodData } from '../services/ComprehensiveFoodService';

export interface SavedFoodScan {
  scanData: FoodData;
  savedAt: string;
  imageUri?: string;
  notes?: string;
  tags?: string[];
  isFavorite: boolean;
}

export interface ScanSaveOptions {
  notes?: string;
  tags?: string[];
  saveImage?: boolean;
}

class FoodScanStorage {
  private static readonly STORAGE_KEY = 'saved_food_scans';
  private static readonly IMAGES_DIR = 'food_scan_images';
  
  /**
   * Save a food scan with optional notes and tags
   */
  static async saveScan(
    scanData: FoodData, 
    imageUri?: string, 
    options: ScanSaveOptions = {}
  ): Promise<string> {
    try {
      const savedAt = new Date().toISOString();
      const scanId = scanData.scanId || `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      let savedImageUri: string | undefined;
      
      // Save image if requested and available
      if (options.saveImage && imageUri) {
        savedImageUri = await this.saveImage(imageUri, scanId);
      }
      
      const savedScan: SavedFoodScan = {
        scanData: {
          ...scanData,
          scanId: scanId
        },
        savedAt,
        imageUri: savedImageUri,
        notes: options.notes,
        tags: options.tags || [],
        isFavorite: false
      };
      
      // Get existing saved scans
      const existingScans = await this.getAllSavedScans();
      
      // Add new scan
      const updatedScans = [savedScan, ...existingScans];
      
      // Keep only the last 50 scans to prevent storage bloat
      const scansToSave = updatedScans.slice(0, 50);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(scansToSave));
      
      console.log(`✅ Food scan saved with ID: ${scanId}`);
      return scanId;
      
    } catch (error) {
      console.error('❌ Error saving food scan:', error);
      throw new Error('Failed to save food scan');
    }
  }
  
  /**
   * Get all saved food scans
   */
  static async getAllSavedScans(): Promise<SavedFoodScan[]> {
    try {
      const scansData = await AsyncStorage.getItem(this.STORAGE_KEY);
      return scansData ? JSON.parse(scansData) : [];
    } catch (error) {
      console.error('❌ Error retrieving saved scans:', error);
      return [];
    }
  }
  
  /**
   * Get a specific saved scan by ID
   */
  static async getSavedScan(scanId: string): Promise<SavedFoodScan | null> {
    try {
      const allScans = await this.getAllSavedScans();
      return allScans.find(scan => scan.scanData.scanId === scanId) || null;
    } catch (error) {
      console.error('❌ Error retrieving saved scan:', error);
      return null;
    }
  }
  
  /**
   * Delete a saved scan
   */
  static async deleteScan(scanId: string): Promise<boolean> {
    try {
      const allScans = await this.getAllSavedScans();
      const scanToDelete = allScans.find(scan => scan.scanData.scanId === scanId);
      
      // Delete associated image if it exists
      if (scanToDelete?.imageUri) {
        try {
          await FileSystem.deleteAsync(scanToDelete.imageUri);
        } catch (imageError) {
          console.warn('⚠️ Could not delete associated image:', imageError);
        }
      }
      
      const updatedScans = allScans.filter(scan => scan.scanData.scanId !== scanId);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedScans));
      
      console.log(`✅ Food scan deleted: ${scanId}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error deleting food scan:', error);
      return false;
    }
  }
  
  /**
   * Update scan notes and tags
   */
  static async updateScan(scanId: string, updates: Partial<Pick<SavedFoodScan, 'notes' | 'tags' | 'isFavorite'>>): Promise<boolean> {
    try {
      const allScans = await this.getAllSavedScans();
      const scanIndex = allScans.findIndex(scan => scan.scanData.scanId === scanId);
      
      if (scanIndex === -1) {
        throw new Error('Scan not found');
      }
      
      allScans[scanIndex] = {
        ...allScans[scanIndex],
        ...updates
      };
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(allScans));
      return true;
      
    } catch (error) {
      console.error('❌ Error updating food scan:', error);
      return false;
    }
  }
  
  /**
   * Get scans by tags
   */
  static async getScansByTags(tags: string[]): Promise<SavedFoodScan[]> {
    try {
      const allScans = await this.getAllSavedScans();
      return allScans.filter(scan => 
        scan.tags && scan.tags.some(tag => tags.includes(tag))
      );
    } catch (error) {
      console.error('❌ Error getting scans by tags:', error);
      return [];
    }
  }
  
  /**
   * Get favorite scans
   */
  static async getFavoriteScans(): Promise<SavedFoodScan[]> {
    try {
      const allScans = await this.getAllSavedScans();
      return allScans.filter(scan => scan.isFavorite);
    } catch (error) {
      console.error('❌ Error getting favorite scans:', error);
      return [];
    }
  }
  
  /**
   * Search scans by food name
   */
  static async searchScans(query: string): Promise<SavedFoodScan[]> {
    try {
      const allScans = await this.getAllSavedScans();
      const searchTerm = query.toLowerCase();
      
      return allScans.filter(scan => 
        scan.scanData.name.toLowerCase().includes(searchTerm) ||
        scan.scanData.category.toLowerCase().includes(searchTerm) ||
        scan.scanData.identifiedItems.some(item => 
          item.name.toLowerCase().includes(searchTerm)
        ) ||
        (scan.notes && scan.notes.toLowerCase().includes(searchTerm)) ||
        (scan.tags && scan.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    } catch (error) {
      console.error('❌ Error searching scans:', error);
      return [];
    }
  }
  
  /**
   * Save image to local storage
   */
  private static async saveImage(imageUri: string, scanId: string): Promise<string> {
    try {
      const imagesDir = `${FileSystem.documentDirectory}${this.IMAGES_DIR}/`;
      
      // Create images directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(imagesDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
      }
      
      const fileName = `${scanId}.jpg`;
      const newImageUri = `${imagesDir}${fileName}`;
      
      await FileSystem.copyAsync({
        from: imageUri,
        to: newImageUri
      });
      
      return newImageUri;
      
    } catch (error) {
      console.error('❌ Error saving image:', error);
      throw error;
    }
  }
  
  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{
    totalScans: number;
    favoriteScans: number;
    totalImages: number;
    storageSize: string;
  }> {
    try {
      const allScans = await this.getAllSavedScans();
      const favoriteScans = allScans.filter(scan => scan.isFavorite).length;
      const totalImages = allScans.filter(scan => scan.imageUri).length;
      
      // Calculate approximate storage size
      const dataSize = JSON.stringify(allScans).length;
      const storageSize = `${(dataSize / 1024).toFixed(1)} KB`;
      
      return {
        totalScans: allScans.length,
        favoriteScans,
        totalImages,
        storageSize
      };
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      return {
        totalScans: 0,
        favoriteScans: 0,
        totalImages: 0,
        storageSize: '0 KB'
      };
    }
  }
  
  /**
   * Clear all saved scans (with confirmation)
   */
  static async clearAllScans(): Promise<boolean> {
    try {
      // Delete all saved images
      const imagesDir = `${FileSystem.documentDirectory}${this.IMAGES_DIR}/`;
      const dirInfo = await FileSystem.getInfoAsync(imagesDir);
      
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(imagesDir);
      }
      
      // Clear saved scans data
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      
      console.log('✅ All food scans cleared');
      return true;
      
    } catch (error) {
      console.error('❌ Error clearing all scans:', error);
      return false;
    }
  }
}

export default FoodScanStorage;
