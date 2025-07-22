// Google Vision API Test - CommonJS
const axios = require('axios');

const API_KEY = 'AIzaSyA_V3ztgV0sgGDriOs-Ov3_lpefqXdyo_M';

async function testGoogleVisionAPI() {
  console.log('🔍 Testing Google Vision API connection...');
  console.log('🔑 Using API Key:', API_KEY.substring(0, 20) + '...');
  
  try {
    // Create a simple test image (1x1 white pixel in base64)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
      {
        requests: [
          {
            image: { content: testImageBase64 },
            features: [{ type: 'TEXT_DETECTION', maxResults: 10 }],
          },
        ],
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('✅ SUCCESS: Google Vision API Connected!');
    console.log('📊 Response Status:', response.status);
    console.log('🎉 Your API key is working perfectly!');
    console.log('🚀 MedLynx can now use real AI vision analysis!');
    
    return true;
  } catch (error) {
    console.error('❌ Google Vision API Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
    return false;
  }
}

// Run the test
testGoogleVisionAPI()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
