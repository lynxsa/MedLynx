import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GeminiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface GeminiResponse {
  text: string;
  type: 'health-advice' | 'emergency' | 'general' | 'appointment-needed';
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  sources?: string[];
  followUp?: string[];
}

class GeminiHealthService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  private conversationHistory: GeminiMessage[] = [];
  private maxHistoryLength = 10;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.loadConversationHistory();
  }

  /**
   * Initialize with medical context and safety guidelines
   */
  private getSystemPrompt(): string {
    return `You are Dr. LYNX, an advanced AI health assistant integrated into the MedLYNX health app. You provide accurate, empathetic, and evidence-based health guidance while maintaining professional medical standards.

IMPORTANT GUIDELINES:
- You are NOT a replacement for professional medical care
- For emergencies, always direct users to call emergency services (10177 in South Africa)
- Provide evidence-based information from reputable medical sources
- Be empathetic but maintain professional boundaries
- Ask clarifying questions when symptoms are vague
- Always recommend consulting healthcare providers for serious concerns
- Use a warm, caring tone while being informative

RESPONSE FORMAT:
- Start with empathy and acknowledgment
- Provide clear, actionable information
- Include relevant medical context when appropriate
- End with appropriate follow-up questions or next steps
- Use emojis sparingly but effectively for readability

SPECIALIZATIONS:
- General health advice and symptom guidance
- Medication information and interactions
- Preventive care recommendations
- Mental health support and resources
- Nutrition and lifestyle guidance
- Emergency triage and guidance

Remember: You're helping users in South Africa, so reference local emergency numbers, healthcare systems, and medical practices when relevant.`;
  }

  /**
   * Send message to Gemini API with context and medical safety
   */
  async sendMessage(userMessage: string): Promise<GeminiResponse> {
    try {
      // Analyze urgency first
      const urgency = this.analyzeUrgency(userMessage);
      
      // For emergency situations, return immediate guidance
      if (urgency === 'emergency') {
        return this.handleEmergencyResponse(userMessage);
      }

      // Build conversation context
      const messages = await this.buildConversationContext(userMessage);
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `${this.getSystemPrompt()}\n\nConversation Context:\n${messages}\n\nUser Query: ${userMessage}\n\nPlease provide a helpful, medical-appropriate response:`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_MEDICAL",
            threshold: "BLOCK_LOW_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini API');
      }

      const aiText = data.candidates[0].content.parts[0].text;
      
      // Store conversation history
      await this.addToHistory('user', userMessage);
      await this.addToHistory('assistant', aiText);

      // Analyze response for type and confidence
      const responseType = this.determineResponseType(userMessage, aiText);
      const confidence = this.calculateConfidence(data);

      return {
        text: aiText,
        type: responseType,
        confidence,
        urgency,
        sources: ['Gemini AI - Medical Knowledge Base'],
        followUp: this.generateFollowUpQuestions(userMessage, responseType)
      };

    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Fallback to basic response for API failures
      return {
        text: "I apologize, but I'm experiencing technical difficulties connecting to my knowledge base. For immediate health concerns, please contact your healthcare provider or call emergency services at 10177 if urgent.",
        type: 'general',
        confidence: 0.5,
        urgency: 'medium',
        sources: ['Fallback Response'],
        followUp: ['Would you like me to try again?', 'Do you need emergency contact information?']
      };
    }
  }

  /**
   * Analyze message urgency for proper triage
   */
  private analyzeUrgency(message: string): GeminiResponse['urgency'] {
    const lowerMessage = message.toLowerCase();
    
    const emergencyKeywords = [
      'chest pain', 'heart attack', 'stroke', 'can\'t breathe', 'difficulty breathing',
      'severe bleeding', 'unconscious', 'overdose', 'suicidal', 'emergency'
    ];
    
    const highUrgencyKeywords = [
      'severe pain', 'high fever', 'vomiting blood', 'severe headache',
      'blurred vision', 'dizzy', 'faint', 'allergic reaction', 'rash spreading'
    ];

    const mediumUrgencyKeywords = [
      'pain', 'fever', 'headache', 'nausea', 'worried', 'concerned', 'sick'
    ];

    if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'emergency';
    } else if (highUrgencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'high';
    } else if (mediumUrgencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Handle emergency responses with immediate action items
   */
  private handleEmergencyResponse(message: string): GeminiResponse {
    return {
      text: `🚨 **MEDICAL EMERGENCY DETECTED** 🚨

**IMMEDIATE ACTION REQUIRED:**

📞 **CALL NOW:**
• **Emergency Services: 10177**
• **Private Emergency: ER24 - 084 124**
• **Poison Information: 0861 555 777**

🏥 **Go to nearest hospital emergency room immediately**

**While waiting for help:**
- Stay calm and try to remain conscious
- If possible, have someone stay with you
- Keep your medical information ready
- Follow any specific emergency protocols you know

**This is not a substitute for emergency medical care. Please seek immediate professional help.**

Do you need me to help you find the nearest hospital?`,
      type: 'emergency',
      confidence: 1.0,
      urgency: 'emergency',
      sources: ['Emergency Medical Protocol'],
      followUp: [
        'Are you able to call for help?',
        'Do you need the nearest hospital location?',
        'Is someone with you right now?'
      ]
    };
  }

  /**
   * Build conversation context for better AI responses
   */
  private async buildConversationContext(currentMessage: string): Promise<string> {
    const recentHistory = this.conversationHistory.slice(-6); // Last 6 messages for context
    
    if (recentHistory.length === 0) {
      return `This is the start of a new conversation. User is asking: ${currentMessage}`;
    }

    let context = "Recent conversation history:\n";
    recentHistory.forEach((msg, index) => {
      context += `${msg.role === 'user' ? 'Patient' : 'Dr. LYNX'}: ${msg.content}\n`;
    });
    
    return context;
  }

  /**
   * Determine response type based on content
   */
  private determineResponseType(userMessage: string, aiResponse: string): GeminiResponse['type'] {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    if (lowerMessage.includes('appointment') || lowerMessage.includes('see a doctor') || 
        lowerResponse.includes('consult') || lowerResponse.includes('see your doctor')) {
      return 'appointment-needed';
    } else if (this.analyzeUrgency(userMessage) === 'emergency') {
      return 'emergency';
    } else if (lowerMessage.includes('health') || lowerMessage.includes('symptom') || 
               lowerMessage.includes('medication') || lowerMessage.includes('pain')) {
      return 'health-advice';
    }

    return 'general';
  }

  /**
   * Calculate confidence based on API response
   */
  private calculateConfidence(apiResponse: any): number {
    // Basic confidence calculation based on response quality indicators
    if (apiResponse.candidates && apiResponse.candidates[0]) {
      const candidate = apiResponse.candidates[0];
      
      // Check for safety ratings and other indicators
      if (candidate.finishReason === 'STOP') {
        return 0.9;
      } else if (candidate.finishReason === 'SAFETY') {
        return 0.7;
      }
    }
    
    return 0.8; // Default confidence
  }

  /**
   * Generate contextual follow-up questions
   */
  private generateFollowUpQuestions(userMessage: string, responseType: string): string[] {
    const baseQuestions = [
      'Is there anything else you\'d like to know about this?',
      'Do you have any other symptoms I should know about?',
      'Would you like me to explain anything in more detail?'
    ];

    switch (responseType) {
      case 'health-advice':
        return [
          'How long have you been experiencing this?',
          'Have you tried any treatments so far?',
          'Are there other symptoms accompanying this?',
          'Would you like information about when to see a doctor?'
        ];
      
      case 'appointment-needed':
        return [
          'Would you like help finding healthcare providers nearby?',
          'Do you need guidance on what to tell your doctor?',
          'Are there any urgent symptoms I should know about?'
        ];
        
      case 'emergency':
        return [
          'Are you able to get help right now?',
          'Do you need the nearest emergency room location?',
          'Is there someone who can assist you?'
        ];
        
      default:
        return baseQuestions;
    }
  }

  /**
   * Add message to conversation history
   */
  private async addToHistory(role: 'user' | 'assistant', content: string): Promise<void> {
    const message: GeminiMessage = {
      role,
      content,
      timestamp: new Date()
    };

    this.conversationHistory.push(message);
    
    // Keep history within limits
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }

    await this.saveConversationHistory();
  }

  /**
   * Save conversation history to device storage
   */
  private async saveConversationHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        '@gemini_conversation_history',
        JSON.stringify(this.conversationHistory)
      );
    } catch (error) {
      console.error('Failed to save conversation history:', error);
    }
  }

  /**
   * Load conversation history from device storage
   */
  private async loadConversationHistory(): Promise<void> {
    try {
      const history = await AsyncStorage.getItem('@gemini_conversation_history');
      if (history) {
        this.conversationHistory = JSON.parse(history);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      this.conversationHistory = [];
    }
  }

  /**
   * Clear conversation history
   */
  async clearHistory(): Promise<void> {
    this.conversationHistory = [];
    try {
      await AsyncStorage.removeItem('@gemini_conversation_history');
    } catch (error) {
      console.error('Failed to clear conversation history:', error);
    }
  }

  /**
   * Get conversation statistics
   */
  getConversationStats(): { messageCount: number; sessionsToday: number } {
    const today = new Date().toDateString();
    const todayMessages = this.conversationHistory.filter(msg => 
      msg.timestamp && new Date(msg.timestamp).toDateString() === today
    );

    return {
      messageCount: this.conversationHistory.length,
      sessionsToday: Math.ceil(todayMessages.length / 2) // Rough session estimate
    };
  }
}

export default GeminiHealthService;
