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
    if ! supabase projects list >/dev/null 2>&1; then
        print_error "Not logged in to Supabase. Please login first:"
        echo "  supabase login"
        exit 1
    fi
    
    print_success "Authenticated with Supabase Cloud"
}

# Function to validate .env file format
validate_env_file() {
    local env_file="$1"
    local line_number=0
    local has_errors=false
    
    print_status "Validating .env file format..."
    
    while IFS= read -r line || [ -n "$line" ]; do
        ((line_number++))
        
        # Skip empty lines and comments
        if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
            continue
        fi
        
        # Check for common formatting issues
        if [[ "$line" =~ $'\n' ]]; then
            print_error "Line $line_number: Contains newline character - this will cause parsing errors"
            has_errors=true
        fi
        
        if [[ "$line" =~ $'\r' ]]; then
            print_error "Line $line_number: Contains carriage return character - this will cause parsing errors"
            has_errors=true
        fi
        
        # Check if line contains an equals sign
        if [[ "$line" == *"="* ]]; then
            # Extract variable name and value
            var_name="${line%%=*}"
            var_value="${line#*=}"
            
            # Remove leading/trailing whitespace
            var_name=$(echo "$var_name" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            
            # Validate variable name format
            if [[ ! "$var_name" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
                print_error "Line $line_number: Invalid variable name '$var_name' - must start with letter or underscore and contain only alphanumeric characters and underscores"
                has_errors=true
            fi
            
            # Check for empty variable names
            if [[ -z "$var_name" ]]; then
                print_error "Line $line_number: Empty variable name"
                has_errors=true
            fi
        else
            print_error "Line $line_number: Missing equals sign - format should be VARIABLE_NAME=value"
            has_errors=true
        fi
    done < "$env_file"
    
    if [ "$has_errors" = true ]; then
        print_error "Environment file validation failed. Please fix the errors above and try again."
        echo ""
        print_status "Common fixes:"
        echo "  - Remove any newline characters from variable values"
        echo "  - Ensure each variable is on its own line"
        echo "  - Use quotes around values that contain spaces: VARIABLE=\"value with spaces\""
        echo "  - Check for hidden characters or encoding issues"
        return 1
    else
        print_success "Environment file validation passed!"
        return 0
    fi
}

# Function to create .env file template
create_env_template() {
    print_status "Creating .env file template..."
    
    cat > ".env" << 'EOF'
# Supabase Configuration
# Replace the placeholder values with your actual credentials

# Google Gemini API Key (get from https://makersuite.google.com/app/apikey)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Project URL (get from your Supabase project dashboard)
SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Service Role Key (get from your Supabase project dashboard)
# WARNING: Keep this secret and never commit it to version control
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Add any other environment variables your functions need
# DATABASE_URL=your_database_url_here
# API_KEY=your_api_key_here
EOF

    print_success ".env file template created successfully!"
    print_warning "Please edit the .env file with your actual credentials before running the deployment."
    echo ""
}

# Global variables to store environment variable values
GEMINI_API_KEY=""
SUPABASE_URL_VALUE=""
SUPABASE_SERVICE_ROLE_KEY_VALUE=""

# Function to set environment variables
set_environment_variables() {
    print_status "Setting environment variables..."
    
    # Check if .env file exists
    if [ -f ".env" ]; then
        print_status "Found .env file, validating format..."
        
        # Validate the .env file format first
        if ! validate_env_file ".env"; then
            print_error "Environment file validation failed. Please fix the errors and try again."
            exit 1
        fi
        
        print_status "Loading environment variables from .env file..."
        
        # More robust .env file parsing
        while IFS= read -r line || [ -n "$line" ]; do
            # Skip empty lines and comments
            if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
                continue
            fi
            
            # Remove leading/trailing whitespace and newlines
            line=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr -d '\r\n')
            
            # Check if line contains an equals sign
            if [[ "$line" == *"="* ]]; then
                # Extract variable name and value
                var_name="${line%%=*}"
                var_value="${line#*=}"
                
                # Remove leading/trailing whitespace from name and value
                var_name=$(echo "$var_name" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
                var_value=$(echo "$var_value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr -d '\r\n')
                
                # Remove surrounding quotes if present (with length check)
                if [[ ${#var_value} -gt 2 ]]; then
                    if [[ "$var_value" =~ ^\".*\"$ ]]; then
                        var_value=$(echo "$var_value" | sed 's/^"\(.*\)"$/\1/')
                    elif [[ "$var_value" =~ ^\'.*\'$ ]]; then
                        var_value=$(echo "$var_value" | sed "s/^'\(.*\)'$/\1/")
                    fi
                elif [[ ${#var_value} -eq 2 ]]; then
                    # Handle edge case of exactly 2 characters (like "" or '')
                    if [[ "$var_value" == '""' || "$var_value" == "''" ]]; then
                        var_value=""
                    fi
                fi
                
                # Store the value in global variables and export
                if [[ -n "$var_name" && "$var_name" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
                    # Final cleanup: remove any remaining newlines or carriage returns
                    local final_value=$(echo "$var_value" | tr -d '\r\n')
                    
                    # Store in global variables for use in the script
                    case "$var_name" in
                        "GOOGLE_GEMINI_API_KEY")
                            GEMINI_API_KEY="$final_value"
                            ;;
                        "SUPABASE_URL")
                            SUPABASE_URL_VALUE="$final_value"
                            ;;
                        "SUPABASE_SERVICE_ROLE_KEY")
                            SUPABASE_SERVICE_ROLE_KEY_VALUE="$final_value"
                            ;;
                    esac
                    
                    # Export for external commands
                    export "$var_name"="$final_value"
                    print_status "Loaded: $var_name (length: ${#final_value})"
                    # Debug: show first few characters of the value
                    if [[ ${#final_value} -gt 0 ]]; then
                        print_status "  Value preview: '${final_value:0:20}...'"
                    fi
                else
                    print_warning "Skipping invalid variable name: $var_name"
                fi
            fi
        done < ".env"
    else
        print_warning ".env file not found. Creating template..."
        create_env_template
        print_error "Please edit the .env file with your credentials and run the deployment again."
        exit 1
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
    local function_path="../functions/$function_name"
    local gemini_api_key="$2"  # Pass the API key as a parameter
    
    if [ ! -d "$function_path" ]; then
        print_warning "Function directory not found: $function_path"
        return 1
    fi
    
    print_status "Deploying function: $function_name"
    
    # Change to the supabase directory for deployment
    local current_dir=$(pwd)
    cd ../..
    
    if supabase functions deploy "$function_name" --no-verify-jwt; then
        print_success "Function $function_name deployed successfully"
        
        # Set secrets for the function if API key is available
        if [ -n "$gemini_api_key" ]; then
            print_status "Setting secrets for $function_name..."
            
            # Final cleanup before sending to Supabase
            local final_clean_key=$(echo -n "$gemini_api_key" | tr -d '\r\n' | tr -d '\0')
            
            # Supabase expects NAME=VALUE format
            echo "GOOGLE_GEMINI_API_KEY=$final_clean_key" | supabase secrets set --env-file /dev/stdin
            if [ $? -eq 0 ]; then
                print_success "Secrets set for $function_name"
            else
                print_warning "Failed to set secrets for $function_name, but function was deployed successfully"
            fi
        else
            print_warning "No API key provided, skipping secrets configuration"
        fi
        
        # Return to original directory
        cd "$current_dir"
        return 0
    else
        print_error "Failed to deploy function: $function_name"
        # Return to original directory
        cd "$current_dir"
        return 1
    fi
}

# Function to deploy all functions
deploy_all_functions() {
    print_status "Deploying all Supabase functions..."
    
    local functions_dir="../functions"
    local deployed_count=0
    local failed_count=0
    
    if [ ! -d "$functions_dir" ]; then
        print_error "Functions directory not found: $functions_dir"
        exit 1
    fi
    
    # Get list of function directories
    local functions=($(ls -d "$functions_dir"/*/ 2>/dev/null | sed 's|.*/||g' | sed 's|/$||g' 2>/dev/null | grep -v '^$' || echo ""))
    
    # Alternative approach if the above doesn't work
    if [ ${#functions[@]} -eq 0 ]; then
        functions=($(basename -a "$functions_dir"/*/ 2>/dev/null | sed 's|/$||g' 2>/dev/null || echo ""))
    fi
    

    
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
        if deploy_function "$func" "$GEMINI_API_KEY"; then
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

# Function to fix common .env file issues
fix_env_file() {
    local env_file="$1"
    local temp_file="${env_file}.tmp"
    
    print_status "Attempting to fix common .env file issues..."
    
    # Create a cleaned version of the file
    {
        # Remove carriage returns and normalize line endings
        cat "$env_file" | tr -d '\r' | sed 's/\r$//'
    } > "$temp_file"
    
    # Check if the fixed file is valid
    if validate_env_file "$temp_file"; then
        # Backup original and replace with fixed version
        mv "$env_file" "${env_file}.backup"
        mv "$temp_file" "$env_file"
        print_success "Fixed .env file issues! Original file backed up as ${env_file}.backup"
        return 0
    else
        # Clean up temp file
        rm -f "$temp_file"
        print_error "Could not automatically fix .env file. Please fix manually."
        return 1
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
    echo "  --fix-env      Attempt to fix common .env file formatting issues"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy all functions"
    echo "  $0 mcp-server         # Deploy specific function"
    echo "  $0 --fix-env          # Fix .env file formatting issues"
    echo "  $0 --help            # Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  GOOGLE_GEMINI_API_KEY     Google Gemini API key"
    echo "  SUPABASE_URL              Supabase project URL"
    echo "  SUPABASE_SERVICE_ROLE_KEY Supabase service role key"
    echo ""
    echo "The script will automatically:"
    echo "  - Create a .env template if none exists"
    echo "  - Validate .env file format before loading"
    echo "  - Detect and report common formatting issues"
    echo "  - Provide helpful error messages for troubleshooting"
    echo ""
    echo "You can set these in a .env file in the supabase directory."
    echo "If you encounter parsing errors, try running with --fix-env option."
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
            --fix-env)
                fix_env_file ".env"
                exit 0
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
        
        deploy_function "$specific_function" "$GEMINI_API_KEY"
    fi
    
    echo ""
    print_success "Deployment process completed!"
}

# Run main function with all arguments
main "$@"
