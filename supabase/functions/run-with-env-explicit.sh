#!/bin/bash

# Function to show usage
show_usage() {
    echo "Usage: $0 [FUNCTION_NAME] [PORT]"
    echo ""
    echo "FUNCTION_NAME: Name of the Edge Function to run"
    echo "PORT: Port to run the function on (default: 8000)"
    echo ""
    echo "Examples:"
    echo "  $0 mcp-server 8000                  # Run mcp-server on port 8000"
    echo ""
    echo "Available functions:"
    echo "  - mcp-server"
    echo ""
}

# Default values
FUNCTION_NAME=${1}
PORT=${2:-8000}

# Validate function name
if [[ ! -d "$FUNCTION_NAME" ]]; then
    echo "Error: Function directory '$FUNCTION_NAME' not found!"
    echo ""
    show_usage
    exit 1
fi

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
echo "Starting $FUNCTION_NAME Edge Function on port $PORT..."
echo ""

# Option 1: Run directly with deno run (recommended for flexibility)
echo "Running: deno run --allow-net --allow-env --allow-read --watch $FUNCTION_NAME/index.ts"
echo ""

PORT=$PORT deno run --allow-net --allow-env --allow-read --watch "$FUNCTION_NAME/index.ts"

# Option 2: Use deno tasks (alternative approach)
# Uncomment the line below if you prefer using deno tasks
# case $FUNCTION_NAME in
#   "mcp-server")
#     PORT=$PORT deno task dev:mcp
#     ;;
#   *)
#     echo "Error: No deno task defined for $FUNCTION_NAME"
#     exit 1
#     ;;
# esac
