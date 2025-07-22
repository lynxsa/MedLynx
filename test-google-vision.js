// Google Vision API Test
import axios from 'axios';

const API_KEY = 'AIzaSyA_V3ztgV0sgGDriOs-Ov3_lpefqXdyo_M';

async function testGoogleVisionAPI() {
  console.log('🔍 Testing Google Vision API connection...');
  
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
      }
    );
    
    console.log('✅ Google Vision API Connected Successfully!');
    console.log('📊 API Response:', response.status);
    console.log('🔑 API Key is valid and working!');
    
    return true;
  } catch (error) {
    console.error('❌ Google Vision API Test Failed:', error.response?.data || error.message);
    return false;
  }
}

// Run the test
testGoogleVisionAPI();

export default testGoogleVisionAPI;
