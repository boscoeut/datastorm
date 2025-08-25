#!/bin/bash

echo "Testing Tesla News Fetcher Edge Function..."
echo "Function should be running on http://localhost:8000/"
echo ""

# Test the function with a POST request
echo "Sending POST request to function..."
response=$(curl -s -X POST http://localhost:8000/ \
  -H "Content-Type: application/json" \
  -d '{}')

echo "Response:"
echo "$response" | jq '.' 2>/dev/null || echo "$response"

echo ""
echo "Test completed!"
