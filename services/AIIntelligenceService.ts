// AI Intelligence Service for MedLynx
// Provides advanced health analysis, smart recommendations, and contextual assistance

export interface HealthAnalysisResult {
  category: 'symptom' | 'medication' | 'wellness' | 'emergency' | 'nutrition' | 'vital';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  recommendations: string[];
  followUpActions: string[];
  urgentCare: boolean;
  estimatedResponse: string;
}

export interface UserHealthProfile {
  medications: string[];
  conditions: string[];
  allergies: string[];
  age?: number;
  vitals?: {
    heartRate?: number;
    bloodPressure?: string;
    weight?: number;
    height?: number;
    lastUpdated?: Date;
  };
  preferences?: {
    language: string;
    units: 'metric' | 'imperial';
    notificationFrequency: 'high' | 'medium' | 'low';
  };
}

class AIIntelligenceService {
  private healthProfile: UserHealthProfile | null = null;
  private conversationContext: string[] = [];

  // Initialize AI with user's health profile
  async initializeWithProfile(profile: UserHealthProfile): Promise<void> {
    this.healthProfile = profile;
  }

  // Advanced health query analysis
  async analyzeHealthQuery(query: string): Promise<HealthAnalysisResult> {
    // Simulate advanced AI analysis with contextual understanding
    const lowerQuery = query.toLowerCase();
    
    // Emergency detection keywords
    const emergencyKeywords = ['chest pain', 'can\'t breathe', 'severe pain', 'bleeding', 'unconscious', 'stroke', 'heart attack'];
    const isEmergency = emergencyKeywords.some(keyword => lowerQuery.includes(keyword));
    
    if (isEmergency) {
      return {
        category: 'emergency',
        severity: 'critical',
        confidence: 0.95,
        recommendations: [
          '🚨 SEEK IMMEDIATE MEDICAL ATTENTION',
          'Call emergency services (10177 in South Africa)',
          'Do not drive yourself to the hospital',
          'Have someone stay with you until help arrives'
        ],
        followUpActions: [
          'Contact your doctor after emergency care',
          'Keep a record of this incident for medical history',
          'Follow up with Dr. LYNX for recovery monitoring'
        ],
        urgentCare: true,
        estimatedResponse: 'EMERGENCY - Immediate medical attention required'
      };
    }

    // Symptom analysis
    const symptomKeywords = ['pain', 'headache', 'fever', 'nausea', 'dizzy', 'tired', 'cough', 'rash'];
    const hasSymptoms = symptomKeywords.some(keyword => lowerQuery.includes(keyword));
    
    if (hasSymptoms) {
      return this.analyzeSymptoms(query, lowerQuery);
    }

    // Medication queries
    const medicationKeywords = ['medication', 'pill', 'dose', 'side effect', 'interaction', 'prescription'];
    const isMedication = medicationKeywords.some(keyword => lowerQuery.includes(keyword));
    
    if (isMedication) {
      return this.analyzeMedication(query, lowerQuery);
    }

    // Wellness and prevention
    const wellnessKeywords = ['exercise', 'diet', 'nutrition', 'sleep', 'stress', 'wellness', 'healthy'];
    const isWellness = wellnessKeywords.some(keyword => lowerQuery.includes(keyword));
    
    if (isWellness) {
      return this.analyzeWellness(query, lowerQuery);
    }

    // Default general health response
    return this.generateGeneralHealthResponse(query);
  }

  private analyzeSymptoms(query: string, lowerQuery: string): HealthAnalysisResult {
    const severityIndicators = {
      high: ['severe', 'intense', 'unbearable', 'worst', 'extreme'],
      medium: ['moderate', 'noticeable', 'bothering', 'uncomfortable'],
      low: ['mild', 'slight', 'little', 'barely']
    };

    let severity: 'low' | 'medium' | 'high' = 'medium';
    
    if (severityIndicators.high.some(word => lowerQuery.includes(word))) {
      severity = 'high';
    } else if (severityIndicators.low.some(word => lowerQuery.includes(word))) {
      severity = 'low';
    }

    const baseRecommendations = [
      '🩺 Monitor your symptoms closely',
      '📊 Track symptom patterns and triggers',
      '💧 Stay hydrated and get adequate rest',
      '📱 Use MedLynx to log symptoms for your doctor'
    ];

    if (severity === 'high') {
      baseRecommendations.unshift('⚕️ Consider consulting with a healthcare provider soon');
    }

    return {
      category: 'symptom',
      severity,
      confidence: 0.85,
      recommendations: baseRecommendations,
      followUpActions: [
        'Schedule a check-in with Dr. LYNX in 24-48 hours',
        'Book an appointment if symptoms worsen',
        'Review medication interactions if taking any'
      ],
      urgentCare: severity === 'high',
      estimatedResponse: `Symptom analysis complete. Severity: ${severity}. Providing personalized guidance.`
    };
  }

  private analyzeMedication(query: string, lowerQuery: string): HealthAnalysisResult {
    const recommendations = [
      '💊 Always take medications as prescribed',
      '⏰ Set reminders for consistent timing',
      '🔍 Check for drug interactions regularly',
      '📝 Keep an updated medication list'
    ];

    if (this.healthProfile?.medications && this.healthProfile.medications.length > 0) {
      recommendations.push(`📋 You have ${this.healthProfile.medications.length} medications in your profile`);
    }

    return {
      category: 'medication',
      severity: 'medium',
      confidence: 0.90,
      recommendations,
      followUpActions: [
        'Update your medication list in MedLynx',
        'Schedule medication review with pharmacist',
        'Set up smart reminders for adherence'
      ],
      urgentCare: false,
      estimatedResponse: 'Medication guidance provided with safety considerations.'
    };
  }

  private analyzeWellness(query: string, lowerQuery: string): HealthAnalysisResult {
    const southAfricanContext = [
      '🌍 Consider South African dietary guidelines',
      '☀️ Take advantage of abundant sunshine for Vitamin D',
      '🏃‍♂️ Explore local outdoor activities and hiking trails',
      '🥗 Incorporate indigenous superfoods like rooibos and honeybush'
    ];

    return {
      category: 'wellness',
      severity: 'low',
      confidence: 0.80,
      recommendations: southAfricanContext,
      followUpActions: [
        'Set up wellness goals in MedLynx',
        'Track progress with health metrics',
        'Join local health and wellness communities'
      ],
      urgentCare: false,
      estimatedResponse: 'Wellness optimization plan with South African health insights.'
    };
  }

  private generateGeneralHealthResponse(query: string): HealthAnalysisResult {
    return {
      category: 'wellness',
      severity: 'low',
      confidence: 0.70,
      recommendations: [
        '🤖 I\'m here to help with your health questions',
        '📱 Use specific health terms for better assistance',
        '🩺 I can help with symptoms, medications, and wellness',
        '🚨 For emergencies, always call 10177 immediately'
      ],
      followUpActions: [
        'Try asking about specific symptoms or health concerns',
        'Update your health profile for personalized advice',
        'Explore quick actions for common health topics'
      ],
      urgentCare: false,
      estimatedResponse: 'Ready to assist with your health questions.'
    };
  }

  // Smart medication interaction checking
  async checkMedicationInteractions(newMedication: string): Promise<{
    hasInteractions: boolean;
    interactions: string[];
    severity: 'low' | 'medium' | 'high';
    recommendations: string[];
  }> {
    // Simulate interaction checking with user's current medications
    const currentMeds = this.healthProfile?.medications || [];
    
    // Mock interaction detection (in real implementation, this would use a medical database)
    const commonInteractions = {
      'warfarin': ['aspirin', 'ibuprofen', 'vitamin k supplements'],
      'metformin': ['alcohol', 'contrast dye'],
      'lisinopril': ['potassium supplements', 'nsaids']
    };

    const newMedLower = newMedication.toLowerCase();
    let hasInteractions = false;
    const interactions: string[] = [];
    
    for (const med of currentMeds) {
      const medLower = med.toLowerCase();
      for (const [drug, interactsWith] of Object.entries(commonInteractions)) {
        if ((newMedLower.includes(drug) || medLower.includes(drug)) && 
            (interactsWith.some(interaction => 
              newMedLower.includes(interaction) || medLower.includes(interaction)))) {
          hasInteractions = true;
          interactions.push(`Potential interaction between ${med} and ${newMedication}`);
        }
      }
    }

    return {
      hasInteractions,
      interactions,
      severity: hasInteractions ? 'medium' : 'low',
      recommendations: hasInteractions 
        ? [
            'Consult with your pharmacist or doctor',
            'Monitor for side effects closely',
            'Consider timing adjustments between medications'
          ]
        : [
            'No known interactions detected',
            'Continue monitoring as you start new medication',
            'Report any unexpected side effects'
          ]
    };
  }

  // Generate personalized health insights
  generateHealthInsights(): string[] {
    const insights: string[] = [];
    
    if (this.healthProfile?.medications && this.healthProfile.medications.length > 0) {
      insights.push(`📊 Managing ${this.healthProfile.medications.length} medications - great job staying organized!`);
    }
    
    if (this.healthProfile?.conditions && this.healthProfile.conditions.length > 0) {
      insights.push(`🎯 Monitoring ${this.healthProfile.conditions.length} health conditions with Dr. LYNX`);
    }
    
    insights.push('💡 Regular check-ins with Dr. LYNX help optimize your health journey');
    insights.push('🌟 Your health data helps provide more accurate recommendations');
    
    return insights;
  }

  // Add conversation context for better follow-up responses
  addToContext(message: string): void {
    this.conversationContext.push(message);
    // Keep only last 5 exchanges for context
    if (this.conversationContext.length > 10) {
      this.conversationContext = this.conversationContext.slice(-10);
    }
  }

  // Get conversation context for better AI responses
  getContext(): string[] {
    return this.conversationContext;
  }
}

export const aiIntelligenceService = new AIIntelligenceService();
