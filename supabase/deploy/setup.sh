#!/bin/bash

# Supabase Functions Setup Script
# This script helps set up the environment for deploying Supabase functions

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

echo "=========================================="
echo "  Supabase Functions Setup Script"
echo "=========================================="
echo ""

# Check if .env file already exists
if [ -f ".env" ]; then
    print_warning ".env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Setup cancelled. Using existing .env file."
        exit 0
    fi
fi

print_status "Setting up environment variables..."

# Copy template
cp env.template .env

print_success "Created .env file from template"

echo ""
print_status "Now you need to fill in your actual values in the .env file:"
echo ""

# Show the .env file contents
echo "Current .env file contents:"
echo "----------------------------------------"
cat .env
echo "----------------------------------------"

echo ""
print_status "Please edit the .env file with your actual values:"
echo ""

# Try to open the file in the default editor
if command -v code >/dev/null 2>&1; then
    print_status "Opening .env file in VS Code..."
    code .env
elif command -v nano >/dev/null 2>&1; then
    print_status "Opening .env file in nano..."
    nano .env
elif command -v vim >/dev/null 2>&1; then
    print_status "Opening .env file in vim..."
    vim .env
else
    print_status "Please manually edit the .env file with your text editor"
fi

echo ""
print_status "After editing the .env file, you can deploy your functions with:"
echo "  ./deploy.sh"
echo ""
print_status "Or deploy a specific function with:"
echo "  ./deploy.sh mcp-server"
echo ""

print_success "Setup complete! 🎉"
