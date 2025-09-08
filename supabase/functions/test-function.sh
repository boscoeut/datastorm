#!/bin/bash

# Function to show usage
show_usage() {
    echo "Usage: $0 [FUNCTION_NAME] [PORT] [TEST_DATA]"
    echo ""
    echo "FUNCTION_NAME: Name of the Edge Function to test (default: tesla-news-fetcher)"
    echo "PORT: Port the function is running on (default: 8000)"
    echo "TEST_DATA: JSON data to send in POST request (default: {})"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Test tesla-news-fetcher on port 8000 with empty data"
    echo "  $0 tesla-news-fetcher 9000          # Test tesla-news-fetcher on port 9000"
    echo ""
    echo "Available functions:"
    echo "  - tesla-news-fetcher"
    echo ""
    echo "Test data examples:"
    echo "  Tesla News Fetcher: {}"
    echo ""
    echo "Note: When passing JSON data, ensure proper escaping:"
    echo ""
}

# Default values
FUNCTION_NAME=${1:-tesla-news-fetcher}
PORT=${2:-8000}

# Handle TEST_DATA parameter carefully to avoid shell expansion issues
if [[ -n "$3" ]]; then
    TEST_DATA="$3"
else
    TEST_DATA="{}"
fi

# Validate function name
if [[ ! -d "$FUNCTION_NAME" ]]; then
    echo "Error: Function directory '$FUNCTION_NAME' not found!"
    echo ""
    show_usage
    exit 1
fi

echo "Testing $FUNCTION_NAME Edge Function..."
echo "Function should be running on http://localhost:$PORT/"
echo ""

# Test the function with a POST request
echo "Sending POST request to function..."
echo "Test data: $TEST_DATA"
echo ""

# Validate JSON if test data is provided
if [[ "$TEST_DATA" != "{}" ]]; then
    if ! echo "$TEST_DATA" | jq . > /dev/null 2>&1; then
        echo "Error: Invalid JSON provided: $TEST_DATA"
        echo "Please provide valid JSON format"
        exit 1
    fi
fi

response=$(curl -s -X POST "http://localhost:$PORT/" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

echo "Response:"
echo "$response" | jq . 2>/dev/null || echo "$response"

echo ""
echo "Test completed!"
