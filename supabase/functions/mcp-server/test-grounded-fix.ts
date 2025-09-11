#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Test script to verify the grounded Gemini fix
 * This script tests the corrected web grounding configuration
 */

import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1';

async function testGroundedGemini() {
  console.log('🧪 Testing grounded Gemini configuration...');
  
  try {
    const apiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY not found in environment');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    // Test with web grounding
    const result = await model.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [{ 
          text: 'What are the latest specifications for the Tesla Model 3 2024? Please search for current information.' 
        }] 
      }],
      tools: [{
        googleSearchRetrieval: {
          dynamicRetrievalConfig: {
            dynamicThreshold: 0.7
          }
        }
      }]
    });

    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Grounded Gemini test successful!');
    console.log('📊 Response length:', text.length);
    console.log('📝 Response preview:', text.substring(0, 200) + '...');
    
    // Check for grounding metadata
    if (response.groundingMetadata) {
      console.log('🔍 Grounding metadata found:', response.groundingMetadata);
    }
    
  } catch (error) {
    console.error('❌ Grounded Gemini test failed:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test
if (import.meta.main) {
  await testGroundedGemini();
}
