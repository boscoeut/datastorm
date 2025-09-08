#!/bin/bash

# Deployment script for populate-images edge function
# Usage: ./deploy-populate-images.sh

echo "Deploying populate-images edge function..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "Please login to Supabase first:"
    echo "supabase login"
    exit 1
fi

# Deploy the function
echo "Deploying function..."
supabase functions deploy populate-images

if [ $? -eq 0 ]; then
    echo "✅ populate-images function deployed successfully!"
    echo ""
    echo "You can test it using the test script:"
    echo "./test-populate-images.sh"
else
    echo "❌ Failed to deploy populate-images function"
    exit 1
fi
