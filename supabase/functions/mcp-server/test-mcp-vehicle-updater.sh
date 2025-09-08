#!/bin/bash

# Test script for the new update-vehicle-details MCP tool
# This script tests the MCP server's update-vehicle-details functionality

set -e

# Configuration
MCP_SERVER_URL="${MCP_SERVER_URL:-http://localhost:54321/functions/v1/mcp-server}"
SERVICE_TOKEN="${SERVICE_TOKEN:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing MCP Server - update-vehicle-details Tool${NC}"
echo "=================================================="
echo ""

# Check if service token is provided
if [ -z "$SERVICE_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Warning: SERVICE_TOKEN not provided${NC}"
    echo "   This test will use a placeholder token"
    echo "   For production use, provide a valid service token"
    echo ""
    SERVICE_TOKEN="sbp_test_token"
fi

echo -e "${BLUE}📋 Test Configuration:${NC}"
echo "   MCP Server URL: $MCP_SERVER_URL"
echo "   Service Token: ${SERVICE_TOKEN:0:20}..."
echo ""

# Test 1: Initialize MCP Server
echo -e "${BLUE}🔧 Test 1: Initialize MCP Server${NC}"
INIT_REQUEST='{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "test-client",
      "version": "1.0.0"
    }
  }
}'

echo "Sending initialize request..."
INIT_RESPONSE=$(curl -s -X POST "$MCP_SERVER_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -d "$INIT_REQUEST")

echo "Response: $INIT_RESPONSE"
echo ""

# Test 2: List Available Tools
echo -e "${BLUE}🔧 Test 2: List Available Tools${NC}"
LIST_REQUEST='{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}'

echo "Sending tools/list request..."
LIST_RESPONSE=$(curl -s -X POST "$MCP_SERVER_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -d "$LIST_REQUEST")

echo "Response: $LIST_RESPONSE"
echo ""

# Check if update-vehicle-details tool is available
if echo "$LIST_RESPONSE" | grep -q "update-vehicle-details"; then
    echo -e "${GREEN}✅ update-vehicle-details tool found in tools list${NC}"
else
    echo -e "${RED}❌ update-vehicle-details tool not found in tools list${NC}"
    exit 1
fi
echo ""

# Test 3: Execute update-vehicle-details Tool
echo -e "${BLUE}🔧 Test 3: Execute update-vehicle-details Tool${NC}"
UPDATE_REQUEST='{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "update-vehicle-details",
    "arguments": {
      "manufacturer": "Tesla",
      "model": "Model 3",
      "trim": "Performance",
      "year": 2025
    }
  }
}'

echo "Sending update-vehicle-details request..."
echo "Parameters: Tesla Model 3 Performance 2025"
echo ""

UPDATE_RESPONSE=$(curl -s -X POST "$MCP_SERVER_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_TOKEN" \
  -d "$UPDATE_REQUEST")

echo "Response: $UPDATE_RESPONSE"
echo ""

# Check if the response contains success
if echo "$UPDATE_RESPONSE" | grep -q '"success": true'; then
    echo -e "${GREEN}✅ update-vehicle-details tool executed successfully${NC}"
    
    # Extract and display key statistics
    echo ""
    echo -e "${BLUE}📊 Results Summary:${NC}"
    
    # Extract manufacturer stats
    MANUFACTURER_CREATED=$(echo "$UPDATE_RESPONSE" | grep -o '"manufacturer_created": [0-9]*' | grep -o '[0-9]*')
    MANUFACTURER_UPDATED=$(echo "$UPDATE_RESPONSE" | grep -o '"manufacturer_updated": [0-9]*' | grep -o '[0-9]*')
    VEHICLES_CREATED=$(echo "$UPDATE_RESPONSE" | grep -o '"vehicles_created": [0-9]*' | grep -o '[0-9]*')
    VEHICLES_UPDATED=$(echo "$UPDATE_RESPONSE" | grep -o '"vehicles_updated": [0-9]*' | grep -o '[0-9]*')
    SPECS_CREATED=$(echo "$UPDATE_RESPONSE" | grep -o '"specifications_created": [0-9]*' | grep -o '[0-9]*')
    SPECS_UPDATED=$(echo "$UPDATE_RESPONSE" | grep -o '"specifications_updated": [0-9]*' | grep -o '[0-9]*')
    NEWS_ADDED=$(echo "$UPDATE_RESPONSE" | grep -o '"news_articles_added": [0-9]*' | grep -o '[0-9]*')
    
    echo "   Manufacturers created: ${MANUFACTURER_CREATED:-0}"
    echo "   Manufacturers updated: ${MANUFACTURER_UPDATED:-0}"
    echo "   Vehicles created: ${VEHICLES_CREATED:-0}"
    echo "   Vehicles updated: ${VEHICLES_UPDATED:-0}"
    echo "   Specifications created: ${SPECS_CREATED:-0}"
    echo "   Specifications updated: ${SPECS_UPDATED:-0}"
    echo "   News articles added: ${NEWS_ADDED:-0}"
    
elif echo "$UPDATE_RESPONSE" | grep -q '"error"'; then
    echo -e "${RED}❌ update-vehicle-details tool failed with error${NC}"
    echo "Error details:"
    echo "$UPDATE_RESPONSE" | grep -o '"message": "[^"]*"' | sed 's/"message": "//g' | sed 's/"//g'
    echo "$UPDATE_RESPONSE" | grep -o '"data": "[^"]*"' | sed 's/"data": "//g' | sed 's/"//g'
else
    echo -e "${YELLOW}⚠️  Unexpected response format${NC}"
    echo "Response: $UPDATE_RESPONSE"
fi

echo ""
echo -e "${BLUE}🎉 Test completed!${NC}"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "   - Check the Supabase database to verify data was created/updated"
echo "   - Review the logs for detailed execution information"
echo "   - Use a valid service token for production testing"
echo ""
