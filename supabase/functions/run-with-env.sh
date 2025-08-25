#!/bin/bash

# Load environment variables from .env.local
if [ -f .env.local ]; then
    echo "Loading environment variables from .env.local..."
    export $(cat .env.local | grep -v '^#' | xargs)
    echo "Environment variables loaded successfully!"
else
    echo "Error: .env.local file not found!"
    exit 1
fi

# Run the Deno function with loaded environment variables
echo "Starting Tesla News Fetcher Edge Function..."
deno task dev
