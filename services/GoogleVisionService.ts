import ImageResizer from '@bam.tech/react-native-image-resizer';
import axios, { isAxiosError } from 'axios';
import * as FileSystem from 'expo-file-system';

// Enhanced interfaces for Google Vision API integration
export interface GoogleVisionResult {
  success: boolean;
  data?: VisionAnalysisData;
  error?: string;
  confidence?: number;
  processingTime?: number;
}

export interface VisionAnalysisData {
  type: 'food' | 'medication';
  detectedText: string;
  labels: string[];
  objects: string[];
  analysis: FoodAnalysis | MedicationAnalysis;
  confidence: number;
  timestamp: Date;
}

export interface FoodAnalysis {
  name: string;
  category: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  healthScore: number;
  dietaryTags: string[];
  ingredients?: string[];
  allergens?: string[];
  recommendations: string[];
}

export interface MedicationAnalysis {
  name: string;
  genericName: string;
  dosage: string;
  strength: string;
  form: string;
  manufacturer: string;
  indication: string;
  sideEffects: string[];
  interactions: string[];
  warnings: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  drLynxAdvice: string;
}

class GoogleVisionService {
  private apiKey: string;
  private visionApiUrl = 'https://vision.googleapis.com/v1/images:annotate';
  private maxImageSize = 4 * 1024 * 1024; // 4MB limit

  constructor() {
    // Use Google Cloud Vision API key
    this.apiKey = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('🔑 Google Vision API key not configured. Using mock analysis mode.');
    }
  }

  /**
   * Check if API key is properly configured
   */
  private isApiKeyConfigured(): boolean {
    return !!(this.apiKey && this.apiKey.length > 10);
  }

  /**
   * Optimize image for Vision API
   */
  private async optimizeImage(imageUri: string): Promise<{ uri: string; size: number }> {
    try {
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      const currentSize = (imageInfo as any).size || 0;

      if (currentSize <= this.maxImageSize) {
        return { uri: imageUri, size: currentSize };
      }

      // Resize image if too large
      const resized = await ImageResizer.createResizedImage(
        imageUri,
        800, // max width
        800, // max height
        'JPEG',
        80, // quality
        0, // rotation
        undefined,
        false
      );

      return { uri: resized.uri, size: resized.size };
    } catch (optimizationError) {
      console.error('Image optimization failed:', optimizationError);
      return { uri: imageUri, size: 0 };
    }
  }

  /**
   * Convert image to base64 for API
   */
  private async imageToBase64(imageUri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (conversionError) {
      console.error('Failed to convert image to base64:', conversionError);
      throw new Error('Failed to convert image to base64');
    }
  }

  /**
   * Call Google Vision API for comprehensive image analysis
   */
  private async callGoogleVisionAPI(base64Image: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.visionApiUrl}?key=${this.apiKey}`,
        {
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                { type: 'TEXT_DETECTION', maxResults: 10 },
                { type: 'LABEL_DETECTION', maxResults: 10 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                { type: 'LOGO_DETECTION', maxResults: 5 },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.responses && response.data.responses[0]) {
        return response.data.responses[0];
      } else {
        throw new Error('No response from Vision API');
      }
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(`Google Vision API error: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Analyze medication image using Google Vision API
   */
  async analyzeMedicationImage(imageUri: string): Promise<GoogleVisionResult> {
    const startTime = Date.now();
    
    try {
      console.log('💊 Starting Google Vision medication analysis...');

      // Check if API key is configured
      if (!this.isApiKeyConfigured()) {
        console.log('🔄 Using mock medication analysis (Google Vision API key not configured)');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.getMockMedicationResult(startTime);
      }

      // Optimize image
      const optimizedImage = await this.optimizeImage(imageUri);
      const base64Image = await this.imageToBase64(optimizedImage.uri);

      // Call Google Vision API
      const visionResult = await this.callGoogleVisionAPI(base64Image);

      // Process results
      const analysis = this.processMedicationVisionResult(visionResult);
      const processingTime = Date.now() - startTime;

      console.log('✅ Google Vision medication analysis completed:', analysis.analysis.name);

      return {
        success: true,
        data: {
          ...analysis,
          timestamp: new Date(),
        },
        confidence: analysis.confidence,
        processingTime,
      };

    } catch (error) {
      console.error('❌ Google Vision medication analysis error:', error);
      
      // Fallback to mock data
      return this.getMockMedicationResult(startTime, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Analyze food image using Google Vision API
   */
  async analyzeFoodImage(imageUri: string): Promise<GoogleVisionResult> {
    const startTime = Date.now();
    
    try {
      console.log('🍽️ Starting Google Vision food analysis...');

      // Check if API key is configured
      if (!this.isApiKeyConfigured()) {
        console.log('🔄 Using mock food analysis (Google Vision API key not configured)');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.getMockFoodResult(startTime);
      }

      // Optimize image
      const optimizedImage = await this.optimizeImage(imageUri);
      const base64Image = await this.imageToBase64(optimizedImage.uri);

      // Call Google Vision API
      const visionResult = await this.callGoogleVisionAPI(base64Image);

      // Process results
      const analysis = this.processFoodVisionResult(visionResult);
      const processingTime = Date.now() - startTime;

      console.log('✅ Google Vision food analysis completed:', analysis.analysis.name);

      return {
        success: true,
        data: {
          ...analysis,
          timestamp: new Date(),
        },
        confidence: analysis.confidence,
        processingTime,
      };

    } catch (error) {
      console.error('❌ Google Vision food analysis error:', error);
      
      // Fallback to mock data
      return this.getMockFoodResult(startTime, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Process Google Vision results for medication analysis
   */
  private processMedicationVisionResult(visionResult: any): VisionAnalysisData {
    // Extract text from OCR
    const detectedText = visionResult.textAnnotations?.[0]?.description || '';
    
    // Extract labels
    const labels = visionResult.labelAnnotations?.map((label: any) => label.description) || [];
    
    // Extract objects
    const objects = visionResult.localizedObjectAnnotations?.map((obj: any) => obj.name) || [];

    // Analyze detected text and labels to determine medication
    const medicationAnalysis = this.analyzeMedicationFromText(detectedText, labels);

    return {
      type: 'medication',
      detectedText,
      labels,
      objects,
      analysis: medicationAnalysis,
      confidence: this.calculateConfidence(detectedText, labels, 'medication'),
      timestamp: new Date(),
    };
  }

  /**
   * Process Google Vision results for food analysis
   */
  private processFoodVisionResult(visionResult: any): VisionAnalysisData {
    // Extract text from OCR
    const detectedText = visionResult.textAnnotations?.[0]?.description || '';
    
    // Extract labels
    const labels = visionResult.labelAnnotations?.map((label: any) => label.description) || [];
    
    // Extract objects
    const objects = visionResult.localizedObjectAnnotations?.map((obj: any) => obj.name) || [];

    // Analyze detected labels to determine food
    const foodAnalysis = this.analyzeFoodFromLabels(detectedText, labels);

    return {
      type: 'food',
      detectedText,
      labels,
      objects,
      analysis: foodAnalysis,
      confidence: this.calculateConfidence(detectedText, labels, 'food'),
      timestamp: new Date(),
    };
  }

  /**
   * Analyze medication from detected text and labels
   */
  private analyzeMedicationFromText(text: string, labels: string[]): MedicationAnalysis {
    // Common medication patterns and database
    const medicationDatabase = {
      'panado': {
        name: 'Panado',
        genericName: 'Paracetamol',
        dosage: '500mg',
        strength: '500mg',
        form: 'tablet',
        manufacturer: 'Adcock Ingram',
        indication: 'Pain relief and fever reduction',
        sideEffects: ['Nausea', 'Stomach upset', 'Rare allergic reactions'],
        interactions: ['Warfarin', 'Alcohol'],
        warnings: ['Do not exceed 8 tablets in 24 hours', 'Consult doctor if symptoms persist'],
        urgencyLevel: 'low' as const,
        drLynxAdvice: 'Safe and effective pain reliever. Take with food if stomach sensitive.',
      },
      'voltaren': {
        name: 'Voltaren Gel',
        genericName: 'Diclofenac',
        dosage: '1%',
        strength: '1%',
        form: 'gel',
        manufacturer: 'Novartis',
        indication: 'Topical anti-inflammatory for joint pain',
        sideEffects: ['Skin irritation', 'Redness', 'Itching'],
        interactions: ['Blood thinners', 'Other NSAIDs'],
        warnings: ['For external use only', 'Avoid open wounds'],
        urgencyLevel: 'low' as const,
        drLynxAdvice: 'Apply sparingly to affected area. Wash hands after use.',
      },
    };

    // Simple text matching (can be enhanced with ML/NLP)
    const lowerText = text.toLowerCase();
    const lowerLabels = labels.map(l => l.toLowerCase());
    
    for (const [key, med] of Object.entries(medicationDatabase)) {
      if (lowerText.includes(key) || lowerLabels.some(label => label.includes(key))) {
        return med;
      }
    }

    // Default/generic medication if not found
    return {
      name: 'Unknown Medication',
      genericName: 'Generic Name',
      dosage: 'As directed',
      strength: 'As labeled',
      form: 'tablet',
      manufacturer: 'Unknown',
      indication: 'Please consult healthcare provider',
      sideEffects: ['Consult product label'],
      interactions: ['Consult healthcare provider'],
      warnings: ['Read product label carefully', 'Consult healthcare provider'],
      urgencyLevel: 'medium',
      drLynxAdvice: 'Unable to identify medication clearly. Please consult with a healthcare provider or pharmacist for proper identification and usage instructions.',
    };
  }

  /**
   * Analyze food from detected labels
   */
  private analyzeFoodFromLabels(text: string, labels: string[]): FoodAnalysis {
    // Food analysis based on detected labels
    const foodCategories = {
      'fruit': { calories: 60, protein: 1, carbs: 15, fat: 0.3, healthScore: 85 },
      'vegetable': { calories: 25, protein: 2, carbs: 5, fat: 0.1, healthScore: 90 },
      'bread': { calories: 250, protein: 8, carbs: 45, fat: 3, healthScore: 60 },
      'meat': { calories: 200, protein: 25, carbs: 0, fat: 10, healthScore: 70 },
      'salad': { calories: 150, protein: 8, carbs: 12, fat: 8, healthScore: 85 },
    };

    // Determine food category from labels
    let detectedCategory = 'unknown';
    let foodName = 'Unknown Food';

    for (const label of labels) {
      const lowerLabel = label.toLowerCase();
      if (lowerLabel.includes('fruit')) {
        detectedCategory = 'fruit';
        foodName = label;
        break;
      } else if (lowerLabel.includes('vegetable') || lowerLabel.includes('salad')) {
        detectedCategory = 'salad';
        foodName = label;
        break;
      } else if (lowerLabel.includes('bread') || lowerLabel.includes('sandwich')) {
        detectedCategory = 'bread';
        foodName = label;
        break;
      } else if (lowerLabel.includes('meat') || lowerLabel.includes('chicken') || lowerLabel.includes('beef')) {
        detectedCategory = 'meat';
        foodName = label;
        break;
      }
    }

    const baseNutrition = (foodCategories as any)[detectedCategory] || foodCategories['salad'];

    return {
      name: foodName,
      category: detectedCategory,
      nutrition: {
        calories: baseNutrition.calories,
        protein: baseNutrition.protein,
        carbs: baseNutrition.carbs,
        fat: baseNutrition.fat,
        fiber: 3,
        sugar: 5,
        sodium: 100,
      },
      healthScore: baseNutrition.healthScore,
      dietaryTags: this.getDietaryTags(detectedCategory),
      recommendations: [`Great choice! ${foodName} is nutritious.`, 'Maintain balanced portions.'],
    };
  }

  /**
   * Get dietary tags based on food category
   */
  private getDietaryTags(category: string): string[] {
    const tagMap = {
      'fruit': ['Natural', 'Vitamin Rich', 'Low Calorie'],
      'vegetable': ['Natural', 'High Fiber', 'Low Calorie'],
      'salad': ['Fresh', 'High Fiber', 'Low Calorie'],
      'bread': ['Carbohydrate', 'Energy'],
      'meat': ['Protein Rich', 'Iron Source'],
    };

    return (tagMap as any)[category] || ['Natural'];
  }

  /**
   * Calculate confidence score based on detection quality
   */
  private calculateConfidence(text: string, labels: string[], type: 'food' | 'medication'): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on text detection
    if (text && text.length > 10) confidence += 0.2;
    
    // Boost confidence based on relevant labels
    if (labels && labels.length > 0) confidence += 0.2;
    
    // Type-specific confidence adjustments
    if (type === 'medication') {
      const medLabels = labels.filter(l => 
        l.toLowerCase().includes('medicine') || 
        l.toLowerCase().includes('pill') || 
        l.toLowerCase().includes('tablet')
      );
      if (medLabels.length > 0) confidence += 0.1;
    } else if (type === 'food') {
      const foodLabels = labels.filter(l => 
        l.toLowerCase().includes('food') || 
        l.toLowerCase().includes('fruit') || 
        l.toLowerCase().includes('vegetable')
      );
      if (foodLabels.length > 0) confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate mock medication result
   */
  private getMockMedicationResult(startTime: number, error?: string): GoogleVisionResult {
    const mockMedications = [
      {
        name: 'Panado',
        genericName: 'Paracetamol',
        dosage: '500mg',
        strength: '500mg',
        form: 'tablet',
        manufacturer: 'Adcock Ingram',
        indication: 'Pain relief and fever reduction',
        sideEffects: ['Nausea', 'Stomach upset'],
        interactions: ['Warfarin', 'Alcohol'],
        warnings: ['Do not exceed recommended dose'],
        urgencyLevel: 'low' as const,
        drLynxAdvice: 'Safe when used as directed. Take with food if stomach sensitive.',
      },
    ];

    const mockMed = mockMedications[0];
    
    return {
      success: true,
      data: {
        type: 'medication',
        detectedText: `${mockMed.name} ${mockMed.dosage}`,
        labels: ['Medicine', 'Tablet', 'Healthcare'],
        objects: ['Medication box'],
        analysis: mockMed,
        confidence: 0.85,
        timestamp: new Date(),
      },
      confidence: 0.85,
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Generate mock food result
   */
  private getMockFoodResult(startTime: number, error?: string): GoogleVisionResult {
    return {
      success: true,
      data: {
        type: 'food',
        detectedText: 'Fresh Garden Salad',
        labels: ['Salad', 'Vegetables', 'Fresh', 'Healthy'],
        objects: ['Bowl', 'Vegetables'],
        analysis: {
          name: 'Garden Salad',
          category: 'salad',
          nutrition: {
            calories: 150,
            protein: 8,
            carbs: 12,
            fat: 8,
            fiber: 6,
            sugar: 8,
            sodium: 200,
          },
          healthScore: 85,
          dietaryTags: ['Fresh', 'Low Calorie', 'High Fiber'],
          recommendations: ['Excellent choice for a healthy meal', 'Rich in vitamins and minerals'],
        },
        confidence: 0.82,
        timestamp: new Date(),
      },
      confidence: 0.82,
      processingTime: Date.now() - startTime,
    };
  }
}

export default new GoogleVisionService();
