#!/bin/bash

# Development script for Supabase Edge Functions
# Usage: ./dev.sh [command]

set -e

FUNCTION_DIR="tesla-news-fetcher"

case "$1" in
  "dev")
    echo "Starting development server with hot reload..."
    deno task dev
    ;;
  "dev:mock")
    echo "Starting development server with mock data (no external APIs required)..."
    deno task dev:mock
    ;;
  "start")
    echo "Starting function once..."
    deno task start
    ;;
  "start:mock")
    echo "Starting function once with mock data..."
    deno task start:mock
    ;;
  "test")
    echo "Running tests..."
    deno task test
    ;;
  "lint")
    echo "Running linter..."
    deno task lint
    ;;
  "fmt")
    echo "Formatting code..."
    deno task fmt
    ;;
  "check")
    echo "Type checking..."
    deno task check
    ;;
  "compile")
    echo "Compiling to executable..."
    deno task compile
    ;;
  "clean")
    echo "Cleaning Deno cache..."
    deno cache --reload tesla-news-fetcher/index.ts
    ;;
  "help"|*)
    echo "Available commands:"
    echo "  dev      - Start development server with hot reload"
    echo "  dev:mock - Start development server with mock data (no external APIs)"
    echo "  start    - Run function once"
    echo "  start:mock - Run function once with mock data"
    echo "  test     - Run tests"
    echo "  lint     - Run linter"
    echo "  fmt      - Format code"
    echo "  check    - Type check"
    echo "  compile  - Compile to executable"
    echo "  clean    - Clean Deno cache"
    echo "  help     - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh dev      # Start development"
    echo "  ./dev.sh test     # Run tests"
    echo "  ./dev.sh lint     # Check code quality"
    ;;
esac
