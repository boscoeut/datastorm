#!/bin/bash

# Simple .env file validation script
# This script helps test your .env file format before running the main deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Main script
main() {
    local env_file=".env"
    local action="validate"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--fix)
                action="fix"
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  -f, --fix    Attempt to fix common .env file issues"
                echo "  -h, --help   Show this help message"
                echo ""
                echo "This script validates your .env file format and can attempt to fix common issues."
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    echo "=========================================="
    echo "  .env File Validation Script"
    echo "=========================================="
    echo ""
    
    if [ ! -f "$env_file" ]; then
        print_error ".env file not found: $env_file"
        exit 1
    fi
    
    if [ "$action" = "fix" ]; then
        fix_env_file "$env_file"
    else
        validate_env_file "$env_file"
    fi
}

# Run main function with all arguments
main "$@"
