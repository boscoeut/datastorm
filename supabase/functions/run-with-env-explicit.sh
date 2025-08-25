#!/bin/bash

# Explicitly set environment variables from .env.local
if [ -f .env.local ]; then
    echo "Loading environment variables from .env.local..."
    
    # Read and set each variable explicitly
    while IFS='=' read -r key value; do
        # Skip empty lines and comments
        if [[ -n "$key" && ! "$key" =~ ^[[:space:]]*# ]]; then
            # Remove quotes and trim whitespace
            clean_value=$(echo "$value" | sed 's/^"//;s/"$//' | xargs)
            export "$key=$clean_value"
            echo "Set: $key"
        fi
    done < .env.local
    
    echo "Environment variables loaded successfully!"
    
    # Debug: Show what was actually loaded
    echo "Verifying environment variables:"
    echo "GOOGLE_GEMINI_API_KEY: ${GOOGLE_GEMINI_API_KEY:0:10}..."
    echo "SUPABASE_URL: ${SUPABASE_URL:0:20}..."
    echo "SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:0:10}..."
    
    # Check if all required variables are set
    if [[ -z "$GOOGLE_GEMINI_API_KEY" || -z "$SUPABASE_URL" || -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
        echo "Error: Some required environment variables are missing!"
        exit 1
    fi
else
    echo "Error: .env.local file not found!"
    exit 1
fi

# Run the Deno function with loaded environment variables
echo "Starting Tesla News Fetcher Edge Function..."
deno task dev
