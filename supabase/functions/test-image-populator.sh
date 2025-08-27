#!/bin/bash

# Test script for Vehicle Image Populator Edge Function
# This script helps test the edge function locally and remotely

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FUNCTION_NAME="vehicle-image-populator"
PROJECT_REF=""
ANON_KEY=""
SERVICE_ROLE_KEY=""
SUPABASE_URL=""

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to load environment variables
load_env() {
    if [ -f ".env" ]; then
        print_status "Loading environment variables from .env file"
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Set variables from environment or use defaults
    PROJECT_REF=${PROJECT_REF:-$SUPABASE_PROJECT_REF}
    ANON_KEY=${ANON_KEY:-$SUPABASE_ANON_KEY}
    SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY:-$SUPABASE_SERVICE_ROLE_KEY}
    SUPABASE_URL=${SUPABASE_URL:-$SUPABASE_URL}
}

# Function to validate configuration
validate_config() {
    local missing_vars=()
    
    if [ -z "$PROJECT_REF" ]; then
        missing_vars+=("PROJECT_REF")
    fi
    
    if [ -z "$ANON_KEY" ]; then
        missing_vars+=("ANON_KEY")
    fi
    
    if [ -z "$SERVICE_ROLE_KEY" ]; then
        missing_vars+=("SERVICE_ROLE_KEY")
    fi
    
    if [ -z "$SUPABASE_URL" ]; then
        missing_vars+=("SUPABASE_URL")
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables: ${missing_vars[*]}"
        print_status "Please set these variables or create a .env file"
        return 1
    fi
    
    print_success "Configuration validated successfully"
    return 0
}

# Function to test local development
test_local() {
    print_status "Testing local development..."
    
    if ! command_exists "deno"; then
        print_error "Deno is not installed. Please install Deno first."
        return 1
    fi
    
    cd "$FUNCTION_NAME" || {
        print_error "Failed to change to function directory"
        return 1
    }
    
    print_status "Running local development server..."
    deno run --allow-net --allow-env --allow-read index.ts
}

# Function to test remote function
test_remote() {
    print_status "Testing remote function..."
    
    local function_url="$SUPABASE_URL/functions/v1/$FUNCTION_NAME"
    
    print_status "Function URL: $function_url"
    
    # Test with anon key
    print_status "Testing with anon key..."
    local response=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $ANON_KEY" \
        -H "Content-Type: application/json" \
        "$function_url")
    
    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        print_success "Function call successful with anon key"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    else
        print_warning "Function call with anon key returned HTTP $http_code"
        echo "$response_body"
    fi
    
    echo
    
    # Test with service role key
    print_status "Testing with service role key..."
    response=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        "$function_url")
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        print_success "Function call successful with service role key"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    else
        print_error "Function call with service role key returned HTTP $http_code"
        echo "$response_body"
    fi
}

# Function to check function status
check_status() {
    print_status "Checking function status..."
    
    local function_url="$SUPABASE_URL/functions/v1/$FUNCTION_NAME"
    
    # Test if function is accessible
    local response=$(curl -s -w "\n%{http_code}" \
        -X OPTIONS \
        "$function_url")
    
    local http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq 200 ]; then
        print_success "Function is accessible and responding"
    else
        print_error "Function is not accessible (HTTP $http_code)"
        return 1
    fi
}

# Function to deploy function
deploy_function() {
    print_status "Deploying function..."
    
    if ! command_exists "supabase"; then
        print_error "Supabase CLI is not installed. Please install it first."
        return 1
    fi
    
    supabase functions deploy "$FUNCTION_NAME"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  local     Test local development"
    echo "  remote    Test remote function"
    echo "  status    Check function status"
    echo "  deploy    Deploy function to Supabase"
    echo "  help      Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  PROJECT_REF         Supabase project reference"
    echo "  ANON_KEY           Supabase anonymous key"
    echo "  SERVICE_ROLE_KEY   Supabase service role key"
    echo "  SUPABASE_URL       Supabase project URL"
    echo ""
    echo "Example:"
    echo "  $0 remote"
}

# Main script
main() {
    print_status "Vehicle Image Populator Edge Function Test Script"
    echo ""
    
    # Load environment variables
    load_env
    
    # Validate configuration
    if ! validate_config; then
        exit 1
    fi
    
    # Parse command
    case "${1:-help}" in
        "local")
            test_local
            ;;
        "remote")
            test_remote
            ;;
        "status")
            check_status
            ;;
        "deploy")
            deploy_function
            ;;
        "help"|*)
            show_usage
            ;;
    esac
}

# Run main function
main "$@"
