#!/bin/bash

# Multilingual AI Ticket Management System - Quick Deploy Script
# This script helps you deploy the system quickly

set -e

echo "🚀 Multilingual AI Ticket Management System - Quick Deploy"
echo "=========================================================="

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

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    print_success "npm $(npm -v) is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Check if .env.local exists
check_env() {
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local file not found"
        print_status "Creating .env.local template..."
        
        cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Groq AI Configuration
GROQ_API_KEY=gsk_your_groq_api_key_here
EOF
        
        print_warning "Please update .env.local with your actual credentials before running the app"
        return 1
    else
        print_success ".env.local file exists"
        return 0
    fi
}

# Build the application
build_app() {
    print_status "Building the application..."
    npm run build
    print_success "Application built successfully"
}

# Start development server
start_dev() {
    print_status "Starting development server..."
    print_success "Development server will start at http://localhost:3000"
    print_status "Press Ctrl+C to stop the server"
    npm run dev
}

# Main deployment flow
main() {
    echo ""
    print_status "Starting deployment process..."
    echo ""
    
    # Step 1: Check prerequisites
    print_status "Step 1: Checking prerequisites..."
    check_node
    check_npm
    echo ""
    
    # Step 2: Install dependencies
    print_status "Step 2: Installing dependencies..."
    install_dependencies
    echo ""
    
    # Step 3: Check environment variables
    print_status "Step 3: Checking environment configuration..."
    if ! check_env; then
        echo ""
        print_error "Please configure your environment variables in .env.local"
        print_status "Follow these steps:"
        echo "  1. Create a Supabase project at https://supabase.com"
        echo "  2. Get your Groq AI API key at https://console.groq.com"
        echo "  3. Update the .env.local file with your credentials"
        echo "  4. Run this script again"
        echo ""
        print_status "For detailed setup instructions, see SETUP.md"
        exit 1
    fi
    echo ""
    
    # Step 4: Ask user what they want to do
    echo "What would you like to do?"
    echo "1) Start development server"
    echo "2) Build for production"
    echo "3) Build and start production server"
    echo ""
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            echo ""
            start_dev
            ;;
        2)
            echo ""
            build_app
            print_success "Build complete! You can now deploy the .next folder"
            ;;
        3)
            echo ""
            build_app
            print_status "Starting production server..."
            npm run start
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
}

# Handle script interruption
trap 'echo ""; print_warning "Deployment interrupted by user"; exit 1' INT

# Run main function
main

print_success "Deployment script completed!"
echo ""
print_status "🎉 Your Multilingual AI Ticket Management System is ready!"
echo ""
print_status "Next steps:"
echo "  • Visit http://localhost:3000 to access the application"
echo "  • Use demo accounts: admin@example.com / password123"
echo "  • Check SETUP.md for detailed configuration"
echo "  • Read README.md for feature documentation"
echo ""
print_status "For support, create an issue at: https://github.com/yourusername/multilingual-ticket-system"
echo ""