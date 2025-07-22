#!/usr/bin/env node
// Google Vision API Test Script
// This will test if your API key is working correctly

require('dotenv').config();
const axios = require('axios');

async function testGoogleVisionAPI() {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;
  
  console.log('🔍 Testing Google Vision API Connection...');
  console.log('API Key status:', apiKey ? 'Found' : 'Not found');
  
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.log('❌ API key not configured properly');
    console.log('📋 Follow these steps:');
    console.log('1. Go to: https://console.cloud.google.com/');
    console.log('2. Enable Vision API: https://console.cloud.google.com/flows/enableapi?apiid=vision.googleapis.com');
    console.log('3. Create API Key: https://console.cloud.google.com/apis/credentials');
    console.log('4. Update .env file with your key');
    return;
  }

  try {
    // Test API with a simple request
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        requests: [
          {
            image: {
              content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' // 1x1 white pixel
            },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
          }
        ]
      }
    );

    if (response.status === 200) {
      console.log('✅ SUCCESS! Google Vision API is connected and working!');
      console.log('🎉 Your MedLynx medication scanner will now use real AI analysis!');
      console.log('🔄 Restart your app: npx expo start');
    }

  } catch (error) {
    console.log('❌ API Connection Error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data?.error?.message || 'Unknown error');
      
      if (error.response.status === 403) {
        console.log('🔧 Solution: Make sure Vision API is enabled at:');
        console.log('https://console.cloud.google.com/flows/enableapi?apiid=vision.googleapis.com');
      }
    } else {
      console.log('Network error:', error.message);
    }
  }
}

testGoogleVisionAPI();
