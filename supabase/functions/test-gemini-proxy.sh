#!/bin/bash

# Test script for Gemini Proxy Edge Function
# This script tests the various features of the gemini-proxy function

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FUNCTION_NAME="gemini-proxy"
PROJECT_URL=$(grep "project_id" ../../supabase/config.toml | cut -d'"' -f2)
ANON_KEY=$(grep "anon key" ../../supabase/config.toml | cut -d'"' -f2)

if [ -z "$PROJECT_URL" ]; then
    echo -e "${RED}Error: Could not find project URL in config.toml${NC}"
    exit 1
fi

if [ -z "$ANON_KEY" ]; then
    echo -e "${RED}Error: Could not find anon key in config.toml${NC}"
    exit 1
fi

FUNCTION_URL="https://${PROJECT_URL}.supabase.co/functions/v1/${FUNCTION_NAME}"

echo -e "${BLUE}Testing Gemini Proxy Edge Function${NC}"
echo -e "${BLUE}Function URL: ${FUNCTION_URL}${NC}"
echo ""

# Test 1: Basic functionality
echo -e "${YELLOW}Test 1: Basic functionality${NC}"
curl -X POST "${FUNCTION_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{
    "task": "answer_question",
    "prompt": "What is 2 + 2?",
    "temperature": 0.1
  }' | jq '.'
echo ""

# Test 2: Vehicle data analysis
echo -e "${YELLOW}Test 2: Vehicle data analysis${NC}"
curl -X POST "${FUNCTION_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{
    "task": "analyze_vehicle_data",
    "prompt": "Analyze this vehicle data and provide insights about its performance.",
    "data": {
      "make": "Tesla",
      "model": "Model 3",
      "batteryCapacity": "75 kWh",
      "range": "358 miles",
      "acceleration": "3.1s 0-60 mph"
    },
    "temperature": 0.5
  }' | jq '.'
echo ""

# Test 3: Content generation
echo -e "${YELLOW}Test 3: Content generation${NC}"
curl -X POST "${FUNCTION_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{
    "task": "generate_content",
    "prompt": "Write a brief paragraph about electric vehicles.",
    "maxTokens": 200,
    "temperature": 0.7
  }' | jq '.'
echo ""

# Test 4: Text summarization
echo -e "${YELLOW}Test 4: Text summarization${NC}"
curl -X POST "${FUNCTION_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{
    "task": "summarize_text",
    "prompt": "Summarize this text: Electric vehicles are becoming increasingly popular due to their environmental benefits and lower operating costs. They produce zero emissions and require less maintenance than traditional gasoline vehicles.",
    "temperature": 0.3
  }' | jq '.'
echo ""

# Test 5: Invalid task (should fail)
echo -e "${YELLOW}Test 5: Invalid task (should fail)${NC}"
curl -X POST "${FUNCTION_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{
    "task": "invalid_task",
    "prompt": "This should fail"
  }' | jq '.'
echo ""

# Test 6: Missing prompt (should fail)
echo -e "${YELLOW}Test 6: Missing prompt (should fail)${NC}"
curl -X POST "${FUNCTION_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{
    "task": "answer_question"
  }' | jq '.'
echo ""

# Test 7: Large prompt (should fail)
echo -e "${YELLOW}Test 7: Large prompt (should fail)${NC}"
LARGE_PROMPT=$(printf 'A%.0s' {1..11000})  # Create a string longer than 10KB
curl -X POST "${FUNCTION_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d "{
    \"task\": \"answer_question\",
    \"prompt\": \"${LARGE_PROMPT}\"
  }" | jq '.'
echo ""

# Test 8: Custom task with tools
echo -e "${YELLOW}Test 8: Custom task with tools${NC}"
curl -X POST "${FUNCTION_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{
    "task": "custom_task",
    "prompt": "What are the latest developments in electric vehicle technology?",
    "tools": [{"googleSearch": {}}],
    "temperature": 0.7
  }' | jq '.'
echo ""

# Test 9: Different model
echo -e "${YELLOW}Test 9: Different model${NC}"
curl -X POST "${FUNCTION_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{
    "task": "answer_question",
    "prompt": "Explain quantum computing in simple terms.",
    "model": "gemini-1.5-flash",
    "temperature": 0.8
  }' | jq '.'
echo ""

# Test 10: Expected output format
echo -e "${YELLOW}Test 10: Expected output format${NC}"
curl -X POST "${FUNCTION_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{
    "task": "custom_task",
    "prompt": "List the top 3 electric vehicles in 2024.",
    "expectedOutput": "Provide a numbered list with vehicle name, price range, and key feature for each.",
    "temperature": 0.5
  }' | jq '.'
echo ""

# Test 11: Structured comparison with expected output
echo -e "${YELLOW}Test 11: Structured comparison with expected output${NC}"
curl -X POST "${FUNCTION_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{
    "task": "analyze_vehicle_data",
    "prompt": "Compare these two vehicles.",
    "expectedOutput": "Create a comparison table with columns for Tesla Model 3 and Ford Mustang Mach-E, including rows for Price, Range, and Performance.",
    "data": {
      "tesla_model_3": {
        "price": "$38,990",
        "range": "272 miles",
        "performance": "5.6s 0-60 mph"
      },
      "ford_mach_e": {
        "price": "$42,995",
        "range": "247 miles",
        "performance": "5.8s 0-60 mph"
      }
    }
  }' | jq '.'
echo ""

# Test 12: CORS preflight
echo -e "${YELLOW}Test 12: CORS preflight${NC}"
curl -X OPTIONS "${FUNCTION_URL}" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
echo ""

echo -e "${GREEN}All tests completed!${NC}"
echo ""
echo -e "${BLUE}Test Summary:${NC}"
echo "- Tests 1-4: Should return successful responses with AI-generated content"
echo "- Tests 5-7: Should return validation errors"
echo "- Test 8: Should work with Google Search tools"
echo "- Test 9: Should work with different Gemini models"
echo "- Tests 10-11: Should work with expected output format guidance"
echo "- Test 12: Should return proper CORS headers"
echo ""
echo -e "${YELLOW}Note: Make sure the function is deployed and environment variables are set correctly.${NC}"
