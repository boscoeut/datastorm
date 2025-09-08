#!/bin/bash

# Test script for populate-images edge function
# Usage: ./test-populate-images.sh [vehicle_id] [model] [trim] [manufacturer]

# Set default values
VEHICLE_ID=${1:-"test-vehicle-123"}
MODEL=${2:-"Model 3"}
TRIM=${3:-"Performance"}
MANUFACTURER=${4:-"Tesla"}

# Get Supabase URL and anon key from environment or prompt
if [ -z "$SUPABASE_URL" ]; then
    echo "Please set SUPABASE_URL environment variable"
    exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "Please set SUPABASE_ANON_KEY environment variable"
    exit 1
fi

# Get JWT token (you'll need to replace this with a valid admin token)
if [ -z "$ADMIN_JWT_TOKEN" ]; then
    echo "Please set ADMIN_JWT_TOKEN environment variable with a valid admin JWT token"
    echo "You can get this by logging in as an admin user and checking the browser's network tab"
    exit 1
fi

echo "Testing populate-images edge function..."
echo "Vehicle ID: $VEHICLE_ID"
echo "Model: $MODEL"
echo "Trim: $TRIM"
echo "Manufacturer: $MANUFACTURER"
echo ""

# Make the request
curl -X POST \
  "$SUPABASE_URL/functions/v1/populate-images" \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"vehicleId\": \"$VEHICLE_ID\",
    \"model\": \"$MODEL\",
    \"trim\": \"$TRIM\",
    \"manufacturer\": \"$MANUFACTURER\",
    \"maxImages\": 5
  }" \
  | jq '.'

echo ""
echo "Test completed!"
