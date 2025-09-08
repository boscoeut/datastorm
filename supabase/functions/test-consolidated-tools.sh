#!/bin/bash

# Quick test to verify the consolidated MCP server tools
# This script tests that the new web_search and image_search tools are available

set -e

# Configuration
SUPABASE_URL="${SUPABASE_URL:-http://localhost:54321}"
FUNCTION_URL="${SUPABASE_URL}/functions/v1/mcp-server"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Consolidated MCP Server Tools Test ===${NC}"
echo "Function URL: $FUNCTION_URL"
echo ""

# Test: List Available Tools
echo -e "${YELLOW}Testing: List Available Tools${NC}"
LIST_REQUEST='{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}'

echo "Request: $LIST_REQUEST"
echo ""

LIST_RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d "$LIST_REQUEST")

echo "Response: $LIST_RESPONSE"
echo ""

# Check if all three tools are present
if echo "$LIST_RESPONSE" | grep -q '"name":"populate-images"'; then
    echo -e "${GREEN}✓ populate-images tool found${NC}"
else
    echo -e "${RED}✗ populate-images tool not found${NC}"
    exit 1
fi

if echo "$LIST_RESPONSE" | grep -q '"name":"web_search"'; then
    echo -e "${GREEN}✓ web_search tool found${NC}"
else
    echo -e "${RED}✗ web_search tool not found${NC}"
    exit 1
fi

if echo "$LIST_RESPONSE" | grep -q '"name":"image_search"'; then
    echo -e "${GREEN}✓ image_search tool found${NC}"
else
    echo -e "${RED}✗ image_search tool not found${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ All consolidated tools are available!${NC}"
echo ""
echo "Available tools:"
echo "1. populate-images - Populate vehicle image galleries (admin only)"
echo "2. web_search - Perform web searches using Google's Programmable Search Engine"
echo "3. image_search - Search for images using Google's Programmable Search Engine"
echo ""
echo -e "${BLUE}Consolidation successful! Google Search functionality has been integrated into the main MCP server.${NC}"
