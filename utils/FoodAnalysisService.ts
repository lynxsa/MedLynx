import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export interface NutritionData {
  foodName: string;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  healthScore: number;
  recommendations: string[];
  warnings: string[];
  ingredients?: string[];
  allergens?: string[];
  dietaryTags?: string[];
}

export interface FoodAnalysisResult {
  success: boolean;
  data?: NutritionData;
  error?: string;
}

class FoodAnalysisService {
  private geminiApiKey: string | null = null;
  private nutritionApiKey: string | null = null;
  
  constructor() {
    // In production, these would come from secure environment variables
    // For now, we'll use mock data but structure for real API integration
    this.geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || null;
    this.nutritionApiKey = process.env.EXPO_PUBLIC_NUTRITION_API_KEY || null;
  }

  /**
   * Analyze food image using Google Gemini Vision API
   */
  async analyzeFood(imageUri: string): Promise<FoodAnalysisResult> {
    try {
      // Convert image to base64 for API call
      const base64Image = await this.imageToBase64(imageUri);
      
      if (this.geminiApiKey) {
        return await this.analyzeWithGemini(base64Image);
      } else {
        // Fallback to mock analysis for development
        return await this.mockAnalysis(imageUri);
      }
    } catch (error) {
      console.error('Food analysis error:', error);
      return {
        success: false,
        error: 'Failed to analyze food image. Please try again.',
      };
    }
  }

  /**
   * Analyze food using Google Gemini Vision API
   */
  private async analyzeWithGemini(base64Image: string): Promise<FoodAnalysisResult> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this food image and provide detailed nutritional information. 
                    Return the response as a JSON object with the following structure:
                    {
                      "foodName": "identified food name",
                      "confidence": 0.95,
                      "calories": 250,
                      "protein": 12,
                      "carbs": 35,
                      "fat": 8,
                      "fiber": 4,
                      "sugar": 15,
                      "sodium": 420,
                      "healthScore": 7.5,
                      "recommendations": ["recommendation 1", "recommendation 2"],
                      "warnings": ["warning 1", "warning 2"],
                      "ingredients": ["ingredient 1", "ingredient 2"],
                      "allergens": ["allergen 1", "allergen 2"],
                      "dietaryTags": ["vegan", "gluten-free", etc.]
                    }
                    
                    Provide realistic nutritional values per typical serving size.
                    Health score should be 1-10 based on nutritional quality.
                    Include helpful recommendations and warnings for health conditions.
                    Be specific about ingredients and allergens if visible.`
                  },
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      const result = await response.json();
      
      if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
        const analysisText = result.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const nutritionData = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            data: nutritionData,
          };
        }
      }

      throw new Error('Invalid response format from Gemini API');
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback to mock analysis
      return await this.mockAnalysis('');
    }
  }

  /**
   * Enhanced mock analysis with realistic food data
   */
  private async mockAnalysis(imageUri: string): Promise<FoodAnalysisResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Mock food database - in production, this would be more sophisticated
    const mockFoods = [
      {
        foodName: 'Grilled Chicken Salad',
        confidence: 0.92,
        calories: 285,
        protein: 26,
        carbs: 8,
        fat: 16,
        fiber: 3,
        sugar: 5,
        sodium: 380,
        healthScore: 8.5,
        recommendations: [
          'Excellent source of lean protein',
          'Low in carbohydrates, great for weight management',
          'Add avocado for healthy fats',
          'Consider reducing dressing portion to lower sodium'
        ],
        warnings: [
          'Moderate sodium content - monitor if managing blood pressure',
          'Dressing may contain hidden sugars'
        ],
        ingredients: ['chicken breast', 'mixed greens', 'tomatoes', 'cucumber', 'olive oil', 'vinegar'],
        allergens: ['may contain traces of nuts'],
        dietaryTags: ['high-protein', 'low-carb', 'gluten-free']
      },
      {
        foodName: 'Margherita Pizza Slice',
        confidence: 0.88,
        calories: 320,
        protein: 12,
        carbs: 45,
        fat: 12,
        fiber: 2,
        sugar: 6,
        sodium: 680,
        healthScore: 5.5,
        recommendations: [
          'Good source of calcium from cheese',
          'Consider whole grain crust for more fiber',
          'Pair with a side salad for balanced nutrition',
          'Share with others to control portions'
        ],
        warnings: [
          'High in sodium - limit if managing hypertension',
          'Refined carbohydrates may cause blood sugar spikes',
          'High calorie density'
        ],
        ingredients: ['pizza dough', 'tomato sauce', 'mozzarella cheese', 'basil', 'olive oil'],
        allergens: ['gluten', 'dairy'],
        dietaryTags: ['vegetarian', 'contains-gluten']
      },
      {
        foodName: 'Fresh Fruit Bowl',
        confidence: 0.95,
        calories: 180,
        protein: 3,
        carbs: 45,
        fat: 1,
        fiber: 8,
        sugar: 35,
        sodium: 5,
        healthScore: 9.2,
        recommendations: [
          'Excellent source of vitamins and antioxidants',
          'High fiber content supports digestive health',
          'Natural energy from fruit sugars',
          'Perfect pre or post-workout snack'
        ],
        warnings: [
          'High natural sugar content - monitor portions if diabetic',
          'May cause blood sugar elevation'
        ],
        ingredients: ['strawberries', 'blueberries', 'kiwi', 'mango', 'grapes'],
        allergens: [],
        dietaryTags: ['vegan', 'gluten-free', 'raw', 'high-fiber']
      },
      {
        foodName: 'Cheeseburger with Fries',
        confidence: 0.87,
        calories: 750,
        protein: 28,
        carbs: 68,
        fat: 42,
        fiber: 4,
        sugar: 8,
        sodium: 1250,
        healthScore: 3.2,
        recommendations: [
          'High protein content supports muscle health',
          'Consider lettuce wrap instead of bun',
          'Share fries or substitute with salad',
          'Drink water instead of sugary beverages'
        ],
        warnings: [
          'Very high in sodium - exceeds daily recommended limit',
          'High saturated fat content',
          'High calorie density may contribute to weight gain',
          'Processed meat may increase health risks'
        ],
        ingredients: ['ground beef', 'cheese', 'bun', 'lettuce', 'tomato', 'potatoes', 'oil'],
        allergens: ['gluten', 'dairy'],
        dietaryTags: ['high-protein', 'high-fat', 'processed']
      }
    ];

    // Randomly select a mock food item
    const randomFood = mockFoods[Math.floor(Math.random() * mockFoods.length)];

    return {
      success: true,
      data: randomFood,
    };
  }

  /**
   * Convert image URI to base64 string
   */
  private async imageToBase64(imageUri: string): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        // For web platform
        const response = await fetch(imageUri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        // For mobile platforms
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return base64;
      }
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  /**
   * Get detailed nutrition information from food database
   */
  async getNutritionDetails(foodName: string): Promise<NutritionData | null> {
    try {
      if (this.nutritionApiKey) {
        // Call to nutrition database API (e.g., USDA FoodData Central, Spoonacular)
        const response = await fetch(
          `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(foodName)}&apiKey=${this.nutritionApiKey}&number=1`
        );
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          // Process and return nutrition data
          return this.processNutritionApiResponse(data.results[0]);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Nutrition API error:', error);
      return null;
    }
  }

  private processNutritionApiResponse(apiData: any): NutritionData {
    // Process API response and convert to our NutritionData format
    return {
      foodName: apiData.name || 'Unknown food',
      confidence: 0.9,
      calories: apiData.nutrition?.calories || 0,
      protein: apiData.nutrition?.protein || 0,
      carbs: apiData.nutrition?.carbohydrates || 0,
      fat: apiData.nutrition?.fat || 0,
      fiber: apiData.nutrition?.fiber || 0,
      sugar: apiData.nutrition?.sugar || 0,
      sodium: apiData.nutrition?.sodium || 0,
      healthScore: this.calculateHealthScore(apiData.nutrition || {}),
      recommendations: this.generateRecommendations(apiData.nutrition || {}),
      warnings: this.generateWarnings(apiData.nutrition || {}),
      ingredients: apiData.possibleUnits || [],
      allergens: apiData.aisle?.toLowerCase().includes('allergen') ? ['check label'] : [],
      dietaryTags: this.generateDietaryTags(apiData),
    };
  }

  private calculateHealthScore(nutrition: any): number {
    // Simple health score calculation based on nutrition values
    let score = 5; // Base score
    
    // Positive factors
    if (nutrition.fiber > 3) score += 1;
    if (nutrition.protein > 10) score += 1;
    if (nutrition.sugar < 10) score += 1;
    if (nutrition.sodium < 400) score += 1;
    
    // Negative factors
    if (nutrition.sugar > 20) score -= 1;
    if (nutrition.sodium > 800) score -= 1;
    if (nutrition.fat > 20) score -= 0.5;
    
    return Math.max(1, Math.min(10, score));
  }

  private generateRecommendations(nutrition: any): string[] {
    const recommendations = [];
    
    if (nutrition.protein > 15) {
      recommendations.push('Good source of protein for muscle health');
    }
    if (nutrition.fiber > 5) {
      recommendations.push('High fiber content supports digestive health');
    }
    if (nutrition.calories < 200) {
      recommendations.push('Low calorie option for weight management');
    }
    
    return recommendations;
  }

  private generateWarnings(nutrition: any): string[] {
    const warnings = [];
    
    if (nutrition.sodium > 600) {
      warnings.push('High sodium content - monitor if managing blood pressure');
    }
    if (nutrition.sugar > 25) {
      warnings.push('High sugar content may cause blood sugar spikes');
    }
    if (nutrition.calories > 500) {
      warnings.push('High calorie content - consider portion control');
    }
    
    return warnings;
  }

  private generateDietaryTags(apiData: any): string[] {
    const tags = [];
    
    if (apiData.vegetarian) tags.push('vegetarian');
    if (apiData.vegan) tags.push('vegan');
    if (apiData.glutenFree) tags.push('gluten-free');
    if (apiData.dairyFree) tags.push('dairy-free');
    
    return tags;
  }
}

export const foodAnalysisService = new FoodAnalysisService();
export default foodAnalysisService;
