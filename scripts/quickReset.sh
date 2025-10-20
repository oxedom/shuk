#!/bin/bash

# PRODUCTION SAFETY GUARDS
# This script is designed ONLY for development environments
# Multiple safeguards are in place to prevent accidental production usage

# Load environment variables from .env.development
set -a
source .env.development
set +a

# Function to validate environment safety
validate_environment() {
    echo "Validating environment safety..."
    
    # Check 1: Ensure we're using .env.development (not .env.production)
    if [[ ! -f .env.development ]]; then
        echo "❌ Error: .env.development file not found!" >&2
        echo "This script only works with development environment files." >&2
        exit 1
    fi
    
    # Check 2: Ensure NODE_ENV is not production
    if [[ "$NODE_ENV" == "production" ]]; then
        echo "❌ Error: NODE_ENV is set to 'production'!" >&2
        echo "This script cannot run in production environment." >&2
        exit 1
    fi
    
    # Check 3: Validate database URL patterns to detect production
    if [[ -z "$POSTGRES_URL" ]]; then
        echo "❌ Error: POSTGRES_URL not found in .env.development!" >&2
        exit 1
    fi
    
    # Check for common production URL patterns
    if [[ "$POSTGRES_URL" =~ (prod|production|live|aws|azure|gcp|cloud) ]]; then
        echo "❌ Error: Database URL appears to be production!" >&2
        echo "URL contains production indicators: $POSTGRES_URL" >&2
        exit 1
    fi
    
    # Check for localhost/development patterns
    if [[ ! "$POSTGRES_URL" =~ (localhost|127\.0\.0\.1|dev|development|test) ]]; then
        echo "❌ Error: Database URL doesn't contain development indicators!" >&2
        echo "URL: $POSTGRES_URL" >&2
        echo "For safety, this script only works with URLs containing: localhost, 127.0.0.1, dev, development, or test" >&2
        exit 1
    fi
    
    # Check 4: Environment variable confirmation
    if [[ "$ENVIRONMENT" == "production" ]] || [[ "$ENV" == "production" ]]; then
        echo "❌ Error: Environment variables indicate production!" >&2
        exit 1
    fi
    
    echo "✅ Environment validation passed - safe to proceed"
    echo
}

# Function to run command with proper error handling
run_command() {
    local command="$1"
    shift
    local args=("$@")
    
    echo "Running: $command ${args[*]}"
    
    if "$command" "${args[@]}"; then
        echo "$command completed successfully"
        echo
    else
        echo "Error: $command failed with exit code $?" >&2
        exit 1
    fi
}

# Function to perform quick reset
quick_reset() {
    echo "🚨 DESTRUCTIVE OPERATION WARNING 🚨"
    echo "This will DROP ALL TABLES and recreate the database!"
    echo "Database: $POSTGRES_URL"
    echo
    
    echo "Starting quick reset..."
    echo
    
    # Drop database tables
    run_command psql "$POSTGRES_URL" -f ./scripts/psql-commands/drop.sql
    
    # Migrate up with package json script
    run_command pnpm migrate:up:dev
    
    # Seed up with package json script
    run_command pnpm seed:up:dev
    
    echo "✅ Quick reset completed successfully!"
}

# MAIN EXECUTION
echo "🔒 QuickReset - Development Database Reset Tool"
echo "================================================"
echo

# Validate environment safety first
validate_environment

# Run the quick reset
quick_reset
