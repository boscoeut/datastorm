#!/bin/bash

# Test script for Google Search MCP Server Edge Function
# This script tests both MCP protocol and direct search functionality

set -e

# Configuration
FUNCTION_URL="http://localhost:54321/functions/v1/google-search-mcp"
CONTENT_TYPE="Content-Type: application/json"

echo "🧪 Testing Google Search MCP Server Edge Function"
echo "=================================================="

# Check if function is running
echo "📡 Checking if function is available..."
if ! curl -s -f "$FUNCTION_URL" -X OPTIONS > /dev/null; then
    echo "❌ Function is not available. Make sure to start it with:"
    echo "   supabase functions serve google-search-mcp"
    exit 1
fi
echo "✅ Function is available"

echo ""
echo "🔧 Testing MCP Protocol Requests"
echo "================================"

# Test 1: MCP Initialize
echo "1️⃣ Testing MCP Initialize..."
INIT_RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
    -H "$CONTENT_TYPE" \
    -d '{
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
    }')

echo "Response: $INIT_RESPONSE"
if echo "$INIT_RESPONSE" | grep -q '"result"'; then
    echo "✅ MCP Initialize successful"
else
    echo "❌ MCP Initialize failed"
fi

echo ""

# Test 2: MCP Tools List
echo "2️⃣ Testing MCP Tools List..."
TOOLS_RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
    -H "$CONTENT_TYPE" \
    -d '{
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/list"
    }')

echo "Response: $TOOLS_RESPONSE"
if echo "$TOOLS_RESPONSE" | grep -q '"tools"'; then
    echo "✅ MCP Tools List successful"
else
    echo "❌ MCP Tools List failed"
fi

echo ""

# Test 3: MCP Tools Call (Google Search)
echo "3️⃣ Testing MCP Google Search..."
SEARCH_RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
    -H "$CONTENT_TYPE" \
    -d '{
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "google_search",
            "arguments": {
                "query": "electric vehicles 2024",
                "num_results": 3
            }
        }
    }')

echo "Response: $SEARCH_RESPONSE"
if echo "$SEARCH_RESPONSE" | grep -q '"result"'; then
    echo "✅ MCP Google Search successful"
else
    echo "❌ MCP Google Search failed"
fi

echo ""
echo "🔍 Testing Direct Search Requests"
echo "================================="

# Test 4: Direct Search
echo "4️⃣ Testing Direct Search..."
DIRECT_RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
    -H "$CONTENT_TYPE" \
    -d '{
        "query": "Tesla Model 3",
        "num_results": 2,
        "site_restriction": "tesla.com"
    }')

echo "Response: $DIRECT_RESPONSE"
if echo "$DIRECT_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Direct Search successful"
else
    echo "❌ Direct Search failed"
fi

echo ""

# Test 5: Error Handling - Invalid Request
echo "5️⃣ Testing Error Handling..."
ERROR_RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
    -H "$CONTENT_TYPE" \
    -d '{
        "invalid": "request"
    }')

echo "Response: $ERROR_RESPONSE"
if echo "$ERROR_RESPONSE" | grep -q '"success":false'; then
    echo "✅ Error Handling working correctly"
else
    echo "❌ Error Handling failed"
fi

echo ""

# Test 6: Rate Limiting (make multiple requests quickly)
echo "6️⃣ Testing Rate Limiting..."
echo "Making multiple rapid requests..."

for i in {1..5}; do
    RATE_RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
        -H "$CONTENT_TYPE" \
        -d '{
            "query": "test query '${i}'",
            "num_results": 1
        }')
    
    if echo "$RATE_RESPONSE" | grep -q '"success":true'; then
        echo "✅ Request $i successful"
    elif echo "$RATE_RESPONSE" | grep -q "Rate limit"; then
        echo "⚠️  Request $i rate limited (expected)"
        break
    else
        echo "❌ Request $i failed"
    fi
done

echo ""
echo "🎯 Test Summary"
echo "==============="
echo "All tests completed. Check the output above for results."
echo ""
echo "💡 Tips:"
echo "- Make sure GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID are set"
echo "- Check function logs for detailed error information"
echo "- Rate limiting may affect test results if run multiple times quickly"

