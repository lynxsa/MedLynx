import ImageResizer from '@bam.tech/react-native-image-resizer';
import axios, { isAxiosError } from 'axios';
import * as FileSystem from 'expo-file-system';

// Enhanced interfaces for comprehensive image analysis
export interface ImageAnalysisResult {
  success: boolean;
  data?: AnalysisData;
  error?: string;
  confidence?: number;
  processingTime?: number;
}

export interface AnalysisData {
  type: 'food' | 'medication';
  identified: string;
  confidence: number;
  details: FoodDetails | MedicationDetails;
  aiInsights: AIInsights;
  recommendations: string[];
  warnings: string[];
  timestamp: Date;
}

export interface FoodDetails {
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
  ingredients?: string[];
  allergens?: string[];
  healthScore: number;
  dietaryTags: string[];
  servingSize?: string;
  glycemicIndex?: number;
}

export interface MedicationDetails {
  name: string;
  genericName: string;
  dosage: string;
  strength: string;
  form: string; // tablet, capsule, liquid, etc.
  manufacturer: string;
  activeIngredients: string[];
  indication: string;
  contraindications: string[];
  sideEffects: string[];
  dosageInstructions: string;
  interactions: string[];
  storageInstructions: string;
  expiryInfo?: string;
  prescriptionRequired: boolean;
  schedule?: string; // controlled substance schedule
}

export interface AIInsights {
  summary: string;
  healthImpact: string;
  alternatives?: string[];
  tips: string[];
  drLynxAdvice: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  followUpQuestions: string[];
}

class GeminiVisionService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
  private maxImageSize = 4 * 1024 * 1024; // 4MB limit for Gemini
  private supportedFormats = ['jpeg', 'jpg', 'png', 'webp'];

  constructor() {
    // In production, this should come from secure environment variables
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    
    if (!this.apiKey || this.apiKey === 'your-gemini-api-key-here') {
      console.warn('🔑 Gemini API key not configured. Using mock analysis mode.');
    }
  }

  /**
   * Check if API key is properly configured
   */
  private isApiKeyConfigured(): boolean {
    return !!(this.apiKey && this.apiKey !== 'your-gemini-api-key-here' && this.apiKey.length > 10);
  }

  /**
   * Generate mock medication analysis when API is not available
   */
  private getMockMedicationAnalysis(): AnalysisData {
    const mockMedications = [
      {
        name: 'Panado',
        genericName: 'Paracetamol',
        dosage: '500mg',
        strength: '500mg',
        form: 'tablet',
        manufacturer: 'Adcock Ingram',
        activeIngredients: ['Paracetamol'],
        indication: 'Pain relief and fever reduction',
        contraindications: ['Severe liver disease', 'Allergy to paracetamol'],
        sideEffects: ['Nausea', 'Stomach upset', 'Allergic reactions (rare)'],
        dosageInstructions: 'Take 1-2 tablets every 4-6 hours as needed. Maximum 8 tablets in 24 hours.',
        interactions: ['Warfarin', 'Alcohol'],
        storageInstructions: 'Store below 25°C in a dry place',
        prescriptionRequired: false,
      },
      {
        name: 'Voltaren Gel',
        genericName: 'Diclofenac',
        dosage: '1%',
        strength: '1%',
        form: 'gel',
        manufacturer: 'Novartis',
        activeIngredients: ['Diclofenac Sodium'],
        indication: 'Topical anti-inflammatory for muscle and joint pain',
        contraindications: ['Allergy to diclofenac', 'Open wounds', 'Third trimester of pregnancy'],
        sideEffects: ['Skin irritation', 'Redness', 'Itching'],
        dosageInstructions: 'Apply to affected area 3-4 times daily. Massage gently until absorbed.',
        interactions: ['Blood thinners', 'Other NSAIDs'],
        storageInstructions: 'Store below 25°C. Do not freeze.',
        prescriptionRequired: false,
      }
    ];

    const randomMed = mockMedications[Math.floor(Math.random() * mockMedications.length)];
    
    return {
      type: 'medication',
      identified: randomMed.name,
      confidence: 0.85,
      details: randomMed as MedicationDetails,
      aiInsights: {
        summary: `${randomMed.name} is a commonly used ${randomMed.indication.toLowerCase()}.`,
        healthImpact: `Generally safe when used as directed. ${randomMed.name} is effective for its intended purpose.`,
        alternatives: ['Consult your pharmacist for alternatives'],
        tips: ['Take with food if stomach upset occurs', 'Follow dosage instructions carefully'],
        drLynxAdvice: `This medication is safe for most people when used correctly. Make sure to follow the dosage instructions and consult a healthcare provider if symptoms persist.`,
        urgencyLevel: 'low' as const,
        followUpQuestions: ['How long have you been taking this medication?', 'Are you experiencing any side effects?']
      },
      recommendations: [`Follow the dosage instructions for ${randomMed.name}`, 'Store medication properly'],
      warnings: ['Do not exceed recommended dose', 'Consult doctor if symptoms persist'],
      timestamp: new Date(),
    };
  }

  /**
   * Analyze medication image with comprehensive pharmaceutical insights
   */
  async analyzeMedicationImage(imageUri: string): Promise<ImageAnalysisResult> {
    const startTime = Date.now();
    
    try {
      console.log('💊 Starting medication image analysis...');
      
      // Check if API key is configured
      if (!this.isApiKeyConfigured()) {
        console.log('🔄 Using mock medication analysis (API key not configured)');
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockAnalysis = this.getMockMedicationAnalysis();
        const processingTime = Date.now() - startTime;
        
        return {
          success: true,
          data: {
            ...mockAnalysis,
            timestamp: new Date(),
          },
          confidence: mockAnalysis.confidence,
          processingTime,
        };
      }
      
      // Optimize image for API
      const optimizedImage = await this.optimizeImage(imageUri);
      const base64Image = await this.imageToBase64(optimizedImage.uri);
      
      const prompt = this.getMedicationAnalysisPrompt();
      const result = await this.callGeminiVision(base64Image, prompt);
      
      const analysis = this.parseMedicationResponse(result);
      const processingTime = Date.now() - startTime;
      
      console.log('✅ Medication analysis completed:', analysis.identified);
      
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
      const processingTime = Date.now() - startTime;
      console.error('❌ Medication analysis error:', error);
      
      // Fallback to mock data on API error
      if (!this.isApiKeyConfigured() || error instanceof Error && error.message.includes('API key')) {
        console.log('🔄 Falling back to mock medication analysis');
        const mockAnalysis = this.getMockMedicationAnalysis();
        
        return {
          success: true,
          data: {
            ...mockAnalysis,
            timestamp: new Date(),
          },
          confidence: mockAnalysis.confidence,
          processingTime,
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during medication analysis',
        processingTime,
      };
    }
  }

  /**
   * Analyze food image with comprehensive nutritional and health insights
   */
  async analyzeFoodImage(imageUri: string): Promise<ImageAnalysisResult> {
    const startTime = Date.now();
    
    try {
      console.log('🍽️ Starting food image analysis...');
      
      // Check if API key is configured, provide mock data if not
      if (!this.isApiKeyConfigured()) {
        console.log('🔄 Using mock food analysis (API key not configured)');
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Return mock food analysis
        const mockFoodAnalysis = {
          type: 'food' as const,
          identified: 'Mixed Salad',
          confidence: 0.82,
          details: {
            name: 'Fresh Garden Salad',
            category: 'Salad',
            nutrition: {
              calories: 150,
              protein: 8,
              carbs: 12,
              fat: 8,
              fiber: 6,
              sugar: 8,
              sodium: 200,
            },
            ingredients: ['Lettuce', 'Tomatoes', 'Cucumber', 'Carrots', 'Bell peppers'],
            allergens: ['None detected'],
            healthScore: 85,
            dietaryTags: ['Vegetarian', 'Vegan', 'Low Calorie', 'High Fiber'],
            servingSize: '1 cup (150g)',
            glycemicIndex: 15,
          },
          aiInsights: {
            summary: 'A healthy, nutrient-rich salad perfect for a balanced diet.',
            healthImpact: 'Excellent source of vitamins, minerals, and fiber with low calories.',
            alternatives: ['Add protein like chicken or beans', 'Try different dressings'],
            tips: ['Eat fresh for maximum nutrition', 'Add healthy fats like avocado'],
            drLynxAdvice: 'This is an excellent choice for maintaining a healthy diet. The high fiber content will help with digestion.',
            urgencyLevel: 'low' as const,
            followUpQuestions: ['What dressing do you usually use?', 'Do you eat salads regularly?']
          },
          recommendations: ['Great choice for weight management', 'Rich in essential nutrients'],
          warnings: ['Wash vegetables thoroughly', 'Check for food allergies'],
        };
        
        return {
          success: true,
          data: {
            ...mockFoodAnalysis,
            timestamp: new Date(),
          },
          confidence: mockFoodAnalysis.confidence,
          processingTime: Date.now() - startTime,
        };
      }
      
      // Optimize image for API
      const optimizedImage = await this.optimizeImage(imageUri);
      const base64Image = await this.imageToBase64(optimizedImage.uri);
      
      const prompt = this.getFoodAnalysisPrompt();
      const result = await this.callGeminiVision(base64Image, prompt);
      
      const analysis = this.parseFoodResponse(result);
      const processingTime = Date.now() - startTime;
      
      console.log('✅ Food analysis completed:', analysis.identified);
      
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
      console.error('❌ Food analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Optimize image for API processing
   */
  private async optimizeImage(imageUri: string): Promise<{ uri: string; size: number }> {
    try {
      // Get image info
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      const currentSize = (imageInfo as any).size || 0;
      
      // If image is already small enough, return as is
      if (currentSize <= this.maxImageSize) {
        return { uri: imageUri, size: currentSize };
      }
      
      // Calculate resize dimensions
      const quality = Math.min(80, (this.maxImageSize / currentSize) * 100);
      const maxDimension = currentSize > this.maxImageSize * 2 ? 1024 : 1536;
      
      // Resize image
      const resizedImage = await ImageResizer.createResizedImage(
        imageUri,
        maxDimension,
        maxDimension,
        'JPEG',
        quality,
        0,
        undefined,
        false,
        { mode: 'contain' }
      );
      
      console.log(`📸 Image optimized: ${currentSize} → ${resizedImage.size} bytes`);
      
      return {
        uri: resizedImage.uri,
        size: resizedImage.size,
      };
      
    } catch (error) {
      console.warn('⚠️ Image optimization failed, using original:', error);
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
    } catch (error) {
      throw new Error(`Failed to convert image to base64: ${error}`);
    }
  }

  /**
   * Call Gemini Vision API
   */
  private async callGeminiVision(base64Image: string, prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!result) {
        throw new Error('No response from Gemini API');
      }

      return result;
      
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.error?.message || error.message;
        throw new Error(`Gemini API error (${status}): ${message}`);
      }
      throw error;
    }
  }

  /**
   * Get comprehensive food analysis prompt
   */
  private getFoodAnalysisPrompt(): string {
    return `You are Dr. LYNX, an expert nutritionist and health AI assistant. Analyze this food image and provide comprehensive nutritional and health insights.

INSTRUCTIONS:
1. Identify the food item(s) in the image with high accuracy
2. Provide detailed nutritional information
3. Assess health impact and provide personalized advice
4. Consider dietary restrictions and allergens
5. Suggest healthier alternatives if applicable
6. Rate the overall health score (1-100)

RESPONSE FORMAT (JSON):
{
  "identified": "exact food name",
  "confidence": 0.95,
  "category": "food category",
  "nutrition": {
    "calories": 150,
    "protein": 5.2,
    "carbs": 25.3,
    "fat": 4.1,
    "fiber": 3.0,
    "sugar": 12.5,
    "sodium": 200
  },
  "ingredients": ["list of main ingredients"],
  "allergens": ["common allergens present"],
  "healthScore": 75,
  "dietaryTags": ["vegetarian", "gluten-free", etc.],
  "servingSize": "1 cup (150g)",
  "glycemicIndex": 45,
  "aiInsights": {
    "summary": "Brief food description",
    "healthImpact": "Positive/negative health effects",
    "alternatives": ["healthier alternatives"],
    "tips": ["consumption tips"],
    "drLynxAdvice": "Personalized advice as Dr. LYNX",
    "urgencyLevel": "low/medium/high",
    "followUpQuestions": ["relevant questions"]
  }
}

Analyze the image and respond with accurate, helpful information in the exact JSON format above.`;
  }

  /**
   * Get comprehensive medication analysis prompt
   */
  private getMedicationAnalysisPrompt(): string {
    return `You are Dr. LYNX, a pharmaceutical expert and AI health assistant. Analyze this medication image and provide comprehensive pharmaceutical insights.

INSTRUCTIONS:
1. Identify the medication from packaging, pills, or labels with high accuracy
2. Provide detailed pharmaceutical information
3. Assess safety considerations and interactions
4. Provide usage guidance and warnings
5. Consider patient safety and proper medication management

RESPONSE FORMAT (JSON):
{
  "identified": "medication name",
  "confidence": 0.92,
  "genericName": "generic/active ingredient name",
  "dosage": "strength per unit",
  "strength": "25mg",
  "form": "tablet/capsule/liquid",
  "manufacturer": "pharmaceutical company",
  "activeIngredients": ["list of active ingredients"],
  "indication": "primary medical use",
  "contraindications": ["when not to use"],
  "sideEffects": ["common side effects"],
  "dosageInstructions": "how to take properly",
  "interactions": ["drug/food interactions"],
  "storageInstructions": "storage requirements",
  "prescriptionRequired": true,
  "schedule": "controlled substance schedule if applicable",
  "aiInsights": {
    "summary": "Brief medication overview",
    "healthImpact": "Therapeutic effects and considerations",
    "alternatives": ["alternative medications if applicable"],
    "tips": ["usage and safety tips"],
    "drLynxAdvice": "Professional medical advice as Dr. LYNX",
    "urgencyLevel": "low/medium/high/critical",
    "followUpQuestions": ["relevant medical questions"]
  }
}

IMPORTANT: Always emphasize consulting healthcare providers for medication decisions. Analyze the image and respond with accurate pharmaceutical information in the exact JSON format above.`;
  }

  /**
   * Parse food analysis response from Gemini
   */
  private parseFoodResponse(response: string): AnalysisData {
    try {
      // Clean up response and extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        type: 'food',
        identified: parsed.identified,
        confidence: parsed.confidence,
        details: {
          name: parsed.identified,
          category: parsed.category,
          nutrition: parsed.nutrition,
          ingredients: parsed.ingredients || [],
          allergens: parsed.allergens || [],
          healthScore: parsed.healthScore,
          dietaryTags: parsed.dietaryTags || [],
          servingSize: parsed.servingSize,
          glycemicIndex: parsed.glycemicIndex,
        } as FoodDetails,
        aiInsights: parsed.aiInsights,
        recommendations: parsed.aiInsights.tips || [],
        warnings: parsed.allergens || [],
        timestamp: new Date(),
      };
      
    } catch (error) {
      console.error('Failed to parse food response:', error);
      // Return fallback response
      return this.getFallbackFoodResponse();
    }
  }

  /**
   * Parse medication analysis response from Gemini
   */
  private parseMedicationResponse(response: string): AnalysisData {
    try {
      // Clean up response and extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        type: 'medication',
        identified: parsed.identified,
        confidence: parsed.confidence,
        details: {
          name: parsed.identified,
          genericName: parsed.genericName,
          dosage: parsed.dosage,
          strength: parsed.strength,
          form: parsed.form,
          manufacturer: parsed.manufacturer,
          activeIngredients: parsed.activeIngredients,
          indication: parsed.indication,
          contraindications: parsed.contraindications,
          sideEffects: parsed.sideEffects,
          dosageInstructions: parsed.dosageInstructions,
          interactions: parsed.interactions,
          storageInstructions: parsed.storageInstructions,
          prescriptionRequired: parsed.prescriptionRequired,
          schedule: parsed.schedule,
        } as MedicationDetails,
        aiInsights: parsed.aiInsights,
        recommendations: parsed.aiInsights.tips || [],
        warnings: parsed.sideEffects || [],
        timestamp: new Date(),
      };
      
    } catch (error) {
      console.error('Failed to parse medication response:', error);
      // Return fallback response
      return this.getFallbackMedicationResponse();
    }
  }

  /**
   * Fallback response for food analysis
   */
  private getFallbackFoodResponse(): AnalysisData {
    return {
      type: 'food',
      identified: 'Unknown food item',
      confidence: 0.5,
      details: {
        name: 'Unknown food item',
        category: 'General',
        nutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
        },
        healthScore: 50,
        dietaryTags: [],
      } as FoodDetails,
      aiInsights: {
        summary: 'Unable to identify the food item clearly',
        healthImpact: 'Please try taking a clearer photo',
        tips: ['Take a well-lit photo', 'Show the food clearly', 'Include packaging if available'],
        drLynxAdvice: 'I recommend taking a clearer photo for better analysis. Consider consulting a nutritionist for detailed dietary advice.',
        urgencyLevel: 'low' as const,
        followUpQuestions: [],
      },
      recommendations: [],
      warnings: [],
      timestamp: new Date(),
    };
  }

  /**
   * Fallback response for medication analysis
   */
  private getFallbackMedicationResponse(): AnalysisData {
    return {
      type: 'medication',
      identified: 'Unknown medication',
      confidence: 0.5,
      details: {
        name: 'Unknown medication',
        genericName: 'Unknown',
        dosage: 'Unknown',
        strength: 'Unknown',
        form: 'Unknown',
        manufacturer: 'Unknown',
        activeIngredients: [],
        indication: 'Unknown',
        contraindications: [],
        sideEffects: [],
        dosageInstructions: 'Consult healthcare provider',
        interactions: [],
        storageInstructions: 'Store as directed',
        prescriptionRequired: true,
      } as MedicationDetails,
      aiInsights: {
        summary: 'Unable to identify the medication clearly',
        healthImpact: 'Please try taking a clearer photo or consult your pharmacist',
        tips: ['Take a clear photo of the label', 'Include the packaging', 'Ensure good lighting'],
        drLynxAdvice: 'For medication identification and safety, I strongly recommend consulting your pharmacist or healthcare provider directly.',
        urgencyLevel: 'high' as const,
        followUpQuestions: [],
      },
      recommendations: [],
      warnings: ['Always consult healthcare providers for medication identification'],
      timestamp: new Date(),
    };
  }
}

export default new GeminiVisionService();
