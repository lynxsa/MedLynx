import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserHealthProfile {
  name: string;
  age?: number;
  gender?: string;
  healthConditions: string[];
  medications: string[];
  allergies: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  location?: string;
}

interface AIResponse {
  text: string;
  type: 'text' | 'health-tip' | 'diet-recommendation' | 'emergency' | 'appointment-suggestion';
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  followUpSuggestions?: string[];
}

export class AIHealthAssistant {
  private static instance: AIHealthAssistant;
  private userProfile: UserHealthProfile | null = null;
  private conversationHistory: {role: 'user' | 'assistant', content: string}[] = [];

  static getInstance(): AIHealthAssistant {
    if (!AIHealthAssistant.instance) {
      AIHealthAssistant.instance = new AIHealthAssistant();
    }
    return AIHealthAssistant.instance;
  }

  async initialize() {
    await this.loadUserProfile();
    await this.loadConversationHistory();
  }

  private async loadUserProfile() {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      if (profileData) {
        this.userProfile = JSON.parse(profileData);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  private async loadConversationHistory() {
    try {
      const history = await AsyncStorage.getItem('drLynxConversationContext');
      if (history) {
        this.conversationHistory = JSON.parse(history);
        // Keep only last 10 exchanges for context
        if (this.conversationHistory.length > 20) {
          this.conversationHistory = this.conversationHistory.slice(-20);
        }
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  }

  private async saveConversationHistory() {
    try {
      await AsyncStorage.setItem('drLynxConversationContext', JSON.stringify(this.conversationHistory));
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  }

  private buildSystemPrompt(): string {
    const profile = this.userProfile;
    const conditions = profile?.healthConditions?.join(', ') || 'none reported';
    const medications = profile?.medications?.join(', ') || 'none reported';
    const allergies = profile?.allergies?.join(', ') || 'none reported';

    return `You are Dr. LYNX, an AI health assistant specifically designed for South African healthcare. 

IMPORTANT GUIDELINES:
- Always prioritize user safety and encourage professional medical consultation for serious concerns
- Provide culturally relevant advice for South African patients
- Include local food recommendations and healthcare resources when relevant
- Never provide specific medical diagnoses or prescribe medications
- Be empathetic, professional, and supportive
- If symptoms suggest emergency, strongly advise immediate medical attention

USER PROFILE:
- Name: ${profile?.name || 'Not provided'}
- Health Conditions: ${conditions}
- Current Medications: ${medications}
- Known Allergies: ${allergies}
- Location: ${profile?.location || 'South Africa'}

RESPONSE FORMAT:
Provide helpful, actionable advice while being warm and professional. Include relevant emojis and formatting for readability. Always end with appropriate follow-up questions or suggestions.`;
  }

  async getResponse(userMessage: string): Promise<AIResponse> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({ role: 'user', content: userMessage });

      // Analyze message for urgency and type
      const urgency = this.analyzeUrgency(userMessage);
      const type = this.determineResponseType(userMessage);

      // For emergency situations, provide immediate guidance
      if (urgency === 'emergency') {
        return await this.handleEmergencyResponse(userMessage);
      }

      // In production, this would call Google Gemini API
      // For now, we'll use enhanced simulation with user context
      const response = await this.getEnhancedSimulatedResponse(userMessage, type, urgency);

      // Add AI response to conversation history
      this.conversationHistory.push({ role: 'assistant', content: response.text });
      await this.saveConversationHistory();

      return response;

    } catch (error) {
      console.error('Error getting AI response:', error);
      return {
        text: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment, or contact your healthcare provider if this is urgent.",
        type: 'text',
        urgency: 'low'
      };
    }
  }

  private analyzeUrgency(message: string): 'low' | 'medium' | 'high' | 'emergency' {
    const emergencyKeywords = [
      'chest pain', 'can\'t breathe', 'difficulty breathing', 'heart attack', 'stroke',
      'severe bleeding', 'unconscious', 'overdose', 'suicide', 'emergency'
    ];
    
    const highUrgencyKeywords = [
      'severe pain', 'high fever', 'vomiting blood', 'severe headache',
      'blurred vision', 'dizzy', 'faint', 'allergic reaction'
    ];

    const mediumUrgencyKeywords = [
      'pain', 'fever', 'headache', 'nausea', 'worried', 'concerned', 'sick'
    ];

    const lowerMessage = message.toLowerCase();

    if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'emergency';
    } else if (highUrgencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'high';
    } else if (mediumUrgencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'medium';
    }

    return 'low';
  }

  private determineResponseType(message: string): AIResponse['type'] {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('nutrition')) {
      return 'diet-recommendation';
    } else if (lowerMessage.includes('appointment') || lowerMessage.includes('doctor') || lowerMessage.includes('see someone')) {
      return 'appointment-suggestion';
    } else if (this.analyzeUrgency(message) === 'emergency') {
      return 'emergency';
    } else if (lowerMessage.includes('tip') || lowerMessage.includes('advice') || lowerMessage.includes('help')) {
      return 'health-tip';
    }

    return 'text';
  }

  private async handleEmergencyResponse(message: string): Promise<AIResponse> {
    const emergencyNumbers = {
      general: '10177',
      ambulance: '10177',
      police: '10111',
      fire: '10111'
    };

    return {
      text: `🚨 **EMERGENCY ALERT** 🚨

If this is a life-threatening emergency, please:

📞 **CALL IMMEDIATELY:**
• Emergency Services: ${emergencyNumbers.general}
• Ambulance: ${emergencyNumbers.ambulance}
• Police: ${emergencyNumbers.police}

🏥 **Or go to the nearest hospital emergency room**

${this.userProfile?.emergencyContact ? 
  `📱 **Your Emergency Contact:**\n${this.userProfile.emergencyContact.name} (${this.userProfile.emergencyContact.relationship})\n📞 ${this.userProfile.emergencyContact.phone}` : 
  ''}

⚠️ **Do not wait for my response if you are experiencing:**
• Chest pain or difficulty breathing
• Loss of consciousness
• Severe bleeding
• Signs of stroke (facial drooping, arm weakness, speech difficulty)

Your safety is the priority. Seek immediate professional medical help.`,
      type: 'emergency',
      urgency: 'emergency',
      followUpSuggestions: ['Call Emergency Services', 'Go to Hospital', 'Contact Emergency Contact']
    };
  }

  private async getEnhancedSimulatedResponse(
    userMessage: string, 
    type: AIResponse['type'], 
    urgency: AIResponse['urgency']
  ): Promise<AIResponse> {
    
    const profile = this.userProfile;
    const lowerMessage = userMessage.toLowerCase();

    // Health condition specific responses
    const hasCondition = (condition: string) => 
      profile?.healthConditions?.some(c => c.toLowerCase().includes(condition.toLowerCase())) || false;

    // Enhanced diet recommendations
    if (type === 'diet-recommendation') {
      let dietAdvice = `🍽️ **Personalized South African Diet Recommendations:**\n\n`;
      
      if (hasCondition('diabetes')) {
        dietAdvice += `🩺 **Diabetes-Friendly Options:**
• Low-GI foods: Sweet potatoes, brown rice, oats
• Local vegetables: Morogo, butternut, gem squash
• Lean proteins: Fish, chicken, legumes
• Avoid: White bread, sugary drinks, processed foods\n\n`;
      }

      if (hasCondition('hypertension')) {
        dietAdvice += `💙 **Heart-Healthy Choices:**
• Reduce salt intake
• Include: Rooibos tea, nuts, olive oil
• Fresh fruits: Naartjies, apples, berries
• Limit processed and canned foods\n\n`;
      }

      dietAdvice += `🌍 **Traditional South African Superfoods:**
• Rooibos tea - rich in antioxidants
• Morogo (African spinach) - iron and vitamins
• Samp and beans - protein and fiber
• Mielie meal (whole grain) - complex carbs
• Cape gooseberries - vitamin C

💧 **Hydration:** 8-10 glasses of water daily, especially important in SA's climate.`;

      return {
        text: dietAdvice,
        type: 'diet-recommendation',
        urgency,
        followUpSuggestions: ['Weekly meal plan', 'Local grocery shopping tips', 'Recipe suggestions']
      };
    }

    // Symptom-based responses with condition awareness
    if (lowerMessage.includes('headache')) {
      let headacheAdvice = `🤕 **Headache Management:**\n\n`;
      
      headacheAdvice += `**Immediate Relief:**
🔹 Rest in a quiet, dark room
🔹 Stay hydrated - drink plenty of water
🔹 Apply cold/warm compress to head or neck
🔹 Try gentle neck and shoulder stretches
🔹 Consider relaxation techniques\n\n`;

      if (hasCondition('hypertension')) {
        headacheAdvice += `⚠️ **Important:** With your blood pressure condition, frequent or severe headaches should be evaluated by your doctor promptly.\n\n`;
      }

      headacheAdvice += `**When to Seek Medical Help:**
• Sudden, severe headache
• Headache with fever, stiff neck, or rash
• Changes in vision or speech
• Headache after head injury
• Persistent headaches lasting more than 2 days`;

      return {
        text: headacheAdvice,
        type: 'health-tip',
        urgency,
        followUpSuggestions: ['Stress management tips', 'Find nearby clinic', 'Track headache patterns']
      };
    }

    // General wellness and exercise
    if (lowerMessage.includes('exercise') || lowerMessage.includes('fitness')) {
      let exerciseAdvice = `🏃‍♂️ **Exercise Plan for South African Climate:**\n\n`;
      
      exerciseAdvice += `**Best Times to Exercise:**
🌅 Early morning (5:30-8:00 AM) - cooler temperatures
🌆 Late afternoon (4:00-6:00 PM) - avoiding midday heat\n\n`;

      exerciseAdvice += `**Recommended Activities:**
• Walking/jogging in local parks
• Swimming (excellent for hot weather)
• Dancing to local music (Amapiano, House)
• Hiking (Drakensberg, Table Mountain trails)
• Home workouts during extreme weather\n\n`;

      if (hasCondition('diabetes') || hasCondition('hypertension')) {
        exerciseAdvice += `⚠️ **Medical Considerations:** Always start slowly and monitor how you feel. Consult your doctor before beginning any new exercise program.\n\n`;
      }

      exerciseAdvice += `**Safety Tips:**
☀️ Use sunscreen and wear a hat
💧 Carry water and stay hydrated
👕 Wear breathable, light-colored clothing
📱 Consider exercising with a friend for safety`;

      return {
        text: exerciseAdvice,
        type: 'health-tip',
        urgency,
        followUpSuggestions: ['Find local gyms', 'Exercise tracking apps', 'Workout buddy finder']
      };
    }

    // Default contextual response
    return {
      text: `Thank you for your question, ${profile?.name || 'there'}! 👋

As Dr. LYNX, I'm here to provide health guidance tailored to South African healthcare needs. Based on your profile, I can offer personalized advice considering ${profile?.healthConditions?.length ? `your ${profile.healthConditions.join(' and ')} condition${profile.healthConditions.length > 1 ? 's' : ''}` : 'your health goals'}.

**I can help with:**
🩺 General health information and wellness tips
🍽️ Nutrition advice with local food options
💊 Medication reminders and management
🏥 Finding healthcare facilities nearby
🧘‍♀️ Stress management and mental wellness

**What would you like to discuss today?**
Feel free to ask about symptoms, lifestyle advice, or any health concerns you might have.

Remember: I provide general guidance, but always consult a healthcare professional for medical diagnoses and treatment decisions.`,
      type: 'text',
      urgency,
      followUpSuggestions: ['Health tips', 'Diet advice', 'Find nearby healthcare', 'Medication help']
    };
  }

  async getQuickActions(): Promise<{title: string, description: string, query: string}[]> {
    const profile = this.userProfile;
    const actions = [
      {
        title: "🩺 Daily Health Check",
        description: "Get personalized daily health tips",
        query: "Give me daily health tips based on my profile"
      },
      {
        title: "🍽️ Meal Planning",
        description: "South African diet recommendations",
        query: "Help me plan healthy meals with local foods"
      },
      {
        title: "💊 Medicine Reminder",
        description: "Medication management help",
        query: "Help me manage my medications"
      },
      {
        title: "🏃‍♂️ Exercise Plan",
        description: "Fitness advice for SA climate",
        query: "Create an exercise plan suitable for South African weather"
      },
      {
        title: "🧘‍♀️ Stress Management",
        description: "Mental wellness tips",
        query: "I need help managing stress and anxiety"
      },
      {
        title: "🏥 Find Healthcare",
        description: "Locate nearby medical facilities",
        query: "Help me find healthcare facilities near me"
      }
    ];

    // Add condition-specific quick actions
    if (profile?.healthConditions?.includes('Diabetes')) {
      actions.unshift({
        title: "📊 Blood Sugar Tips",
        description: "Diabetes management advice",
        query: "Give me tips for managing my blood sugar levels"
      });
    }

    if (profile?.healthConditions?.includes('Hypertension')) {
      actions.unshift({
        title: "💙 Blood Pressure Help",
        description: "Hypertension management",
        query: "Help me manage my blood pressure naturally"
      });
    }

    return actions.slice(0, 8); // Limit to 8 most relevant actions
  }

  async clearHistory() {
    this.conversationHistory = [];
    await AsyncStorage.removeItem('drLynxConversationContext');
  }
}

export default AIHealthAssistant;
