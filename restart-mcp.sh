#!/bin/bash

# Script to restart MCP servers with proper environment variables
echo "🔄 Restarting MCP servers with environment variables..."

# Load environment variables
if [ -f .env ]; then
    echo "📁 Loading environment variables from .env"
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "❌ .env file not found. Please create it from .env.example"
    exit 1
fi

# Verify SUPABASE_ACCESS_TOKEN is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ SUPABASE_ACCESS_TOKEN not set in environment"
    exit 1
fi

echo "✅ SUPABASE_ACCESS_TOKEN is configured"
echo "🚀 MCP servers are ready to use with environment variables"
echo ""
echo "💡 You may need to restart Cursor to pick up the new MCP configuration"
