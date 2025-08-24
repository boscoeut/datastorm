#!/bin/bash

# Supabase Functions Deployment Script
# This script deploys all Supabase Edge Functions and sets required environment variables

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to check if Supabase CLI is installed
check_supabase_cli() {
    if ! command_exists supabase; then
        print_error "Supabase CLI is not installed. Please install it first:"
        echo "  npm install -g supabase"
        echo "  or visit: https://supabase.com/docs/guides/cli"
        exit 1
    fi
    
    print_success "Supabase CLI found: $(supabase --version)"
}

# Function to check if user is logged in to Supabase
check_supabase_auth() {
    if ! supabase status >/dev/null 2>&1; then
        print_error "Not logged in to Supabase. Please login first:"
        echo "  supabase login"
        exit 1
    fi
    
    print_success "Authenticated with Supabase"
}

# Function to set environment variables
set_environment_variables() {
    print_status "Setting environment variables..."
    
    # Check if .env file exists
    if [ -f ".env" ]; then
        print_status "Loading environment variables from .env file..."
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Set required environment variables
    local required_vars=(
        "GOOGLE_GEMINI_API_KEY"
        "SUPABASE_URL"
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_warning "The following environment variables are not set:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        
        echo ""
        print_status "Please set these variables in your .env file or export them manually:"
        echo ""
        echo "Example .env file:"
        echo "  GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here"
        echo "  SUPABASE_URL=https://your-project.supabase.co"
        echo "  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here"
        echo ""
        
        read -p "Do you want to continue without these variables? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled. Please set the required environment variables."
            exit 1
        fi
    else
        print_success "All required environment variables are set"
    fi
}

# Function to deploy a specific function
deploy_function() {
    local function_name=$1
    local function_path="functions/$function_name"
    
    if [ ! -d "$function_path" ]; then
        print_warning "Function directory not found: $function_path"
        return 1
    fi
    
    print_status "Deploying function: $function_name"
    
    if supabase functions deploy "$function_name" --no-verify-jwt; then
        print_success "Function $function_name deployed successfully"
        
        # Set secrets for the function if environment variables are available
        if [ -n "$GOOGLE_GEMINI_API_KEY" ]; then
            print_status "Setting secrets for $function_name..."
            echo "$GOOGLE_GEMINI_API_KEY" | supabase secrets set --env-file /dev/stdin GOOGLE_GEMINI_API_KEY
            print_success "Secrets set for $function_name"
        fi
        
        return 0
    else
        print_error "Failed to deploy function: $function_name"
        return 1
    fi
}

# Function to deploy all functions
deploy_all_functions() {
    print_status "Deploying all Supabase functions..."
    
    local functions_dir="functions"
    local deployed_count=0
    local failed_count=0
    
    if [ ! -d "$functions_dir" ]; then
        print_error "Functions directory not found: $functions_dir"
        exit 1
    fi
    
    # Get list of function directories
    local functions=($(ls -d "$functions_dir"/*/ 2>/dev/null | sed 's|/$||g' | sed 's|functions/||g'))
    
    if [ ${#functions[@]} -eq 0 ]; then
        print_warning "No functions found in $functions_dir"
        return 0
    fi
    
    print_status "Found ${#functions[@]} functions to deploy:"
    for func in "${functions[@]}"; do
        echo "  - $func"
    done
    echo ""
    
    # Deploy each function
    for func in "${functions[@]}"; do
        if deploy_function "$func"; then
            ((deployed_count++))
        else
            ((failed_count++))
        fi
        echo ""
    done
    
    # Summary
    echo "=========================================="
    print_status "Deployment Summary:"
    echo "  Successfully deployed: $deployed_count"
    echo "  Failed: $failed_count"
    echo "  Total: ${#functions[@]}"
    echo "=========================================="
    
    if [ $failed_count -gt 0 ]; then
        print_warning "Some functions failed to deploy. Check the logs above for details."
        return 1
    else
        print_success "All functions deployed successfully!"
        return 0
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] [FUNCTION_NAME]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -a, --all      Deploy all functions (default)"
    echo "  -v, --verbose  Enable verbose output"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy all functions"
    echo "  $0 tesla-news-fetcher # Deploy specific function"
    echo "  $0 --help            # Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  GOOGLE_GEMINI_API_KEY     Google Gemini API key"
    echo "  SUPABASE_URL              Supabase project URL"
    echo "  SUPABASE_SERVICE_ROLE_KEY Supabase service role key"
    echo ""
    echo "You can set these in a .env file in the supabase directory."
}

# Main script
main() {
    local deploy_all=true
    local specific_function=""
    local verbose=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -a|--all)
                deploy_all=true
                shift
                ;;
            -v|--verbose)
                verbose=true
                shift
                ;;
            -*)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
            *)
                if [ -n "$specific_function" ]; then
                    print_error "Multiple function names specified. Use --help for usage."
                    exit 1
                fi
                specific_function="$1"
                deploy_all=false
                shift
                ;;
        esac
    done
    
    # Enable verbose mode if requested
    if [ "$verbose" = true ]; then
        set -x
    fi
    
    echo "=========================================="
    echo "  Supabase Functions Deployment Script"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_supabase_cli
    check_supabase_auth
    
    # Set environment variables
    set_environment_variables
    
    echo ""
    
    # Deploy functions
    if [ "$deploy_all" = true ]; then
        deploy_all_functions
    else
        if [ -z "$specific_function" ]; then
            print_error "No function name specified. Use --help for usage."
            exit 1
        fi
        
        deploy_function "$specific_function"
    fi
    
    echo ""
    print_success "Deployment process completed!"
}

# Run main function with all arguments
main "$@"
