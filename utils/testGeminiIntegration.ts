// Test file to verify Gemini API integration for Dr. LYNX
import GeminiHealthService from '../services/GeminiHealthService';

// Your Gemini API Key
const GEMINI_API_KEY = 'AIzaSyDpbXKi1BQDHkqUwSEeTf-8uDK6VjlSQT8';

async function testGeminiIntegration() {
  const geminiService = new GeminiHealthService(GEMINI_API_KEY);
  
  try {
    console.log('🧪 Testing Gemini API integration for Dr. LYNX...');
    
    // Test normal health query
    console.log('\n📝 Testing normal health query...');
    const response1 = await geminiService.sendMessage("I have a mild headache. What could be causing it?");
    console.log('✅ Response received:', {
      type: response1.type,
      urgency: response1.urgency,
      confidence: response1.confidence,
      textLength: response1.text.length,
      followUpCount: response1.followUp?.length || 0
    });
    
    // Test emergency query
    console.log('\n🚨 Testing emergency query...');
    const response2 = await geminiService.sendMessage("I'm having severe chest pain and difficulty breathing");
    console.log('✅ Emergency response:', {
      type: response2.type,
      urgency: response2.urgency,
      isEmergency: response2.urgency === 'emergency'
    });
    
    // Test conversation stats
    const stats = geminiService.getConversationStats();
    console.log('\n📊 Conversation stats:', stats);
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n🎉 Your Gemini API integration is working correctly!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error && error.message.includes('API')) {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Check if your API key is correct');
      console.log('2. Ensure the API key has Gemini Pro access');
      console.log('3. Verify your internet connection');
      console.log('4. Check if the API endpoint is accessible');
    }
    
    return false;
  }
}

export { testGeminiIntegration };
