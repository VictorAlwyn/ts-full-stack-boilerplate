#!/bin/bash

# Package Cleanup Script
# Based on: https://shaneosullivan.wordpress.com/2023/11/10/how-to-clean-up-after-your-nextjs-dev-server/

set -e

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

# Get the directory of the script
script_dir="$(dirname "$0")"
packages_dir="$(dirname "$script_dir")"

print_status "Starting package cleanup process..."
echo "Packages directory: $packages_dir"

# Function to clean individual package
clean_package() {
    local package_name=$1
    local package_path="$packages_dir/$package_name"
    
    if [ -d "$package_path" ]; then
        print_status "Cleaning $package_name..."
        
        # Remove node_modules
        if [ -d "$package_path/node_modules" ]; then
            rm -rf "$package_path/node_modules"
            print_success "Removed node_modules from $package_name"
        fi
        
        # Remove build artifacts
        for dir in dist build .next .turbo coverage .tsbuildinfo; do
            if [ -d "$package_path/$dir" ] || [ -f "$package_path/$dir" ]; then
                rm -rf "$package_path/$dir"
                print_success "Removed $dir from $package_name"
            fi
        done
        
        # Remove log files
        find "$package_path" -name "*.log" -type f -delete 2>/dev/null || true
        find "$package_path" -name "npm-debug.log*" -type f -delete 2>/dev/null || true
        find "$package_path" -name "yarn-debug.log*" -type f -delete 2>/dev/null || true
        find "$package_path" -name "yarn-error.log*" -type f -delete 2>/dev/null || true
        
        # Remove cache directories
        for cache_dir in .cache .parcel-cache .eslintcache; do
            if [ -d "$package_path/$cache_dir" ]; then
                rm -rf "$package_path/$cache_dir"
                print_success "Removed $cache_dir from $package_name"
            fi
        done
        
        print_success "Cleaned $package_name successfully"
    else
        print_warning "Package $package_name not found at $package_path"
    fi
}

# Main cleanup logic
if [ $# -eq 0 ]; then
    # Clean all packages
    print_status "Cleaning all packages..."
    
    for package_dir in "$packages_dir"/*; do
        if [ -d "$package_dir" ] && [ -f "$package_dir/package.json" ]; then
            package_name=$(basename "$package_dir")
            clean_package "$package_name"
        fi
    done
    
    # Clean root level package artifacts
    print_status "Cleaning root package directory..."
    if [ -f "$packages_dir/.eslintcache" ]; then
        rm -f "$packages_dir/.eslintcache"
        print_success "Removed .eslintcache from packages root"
    fi
    
    print_success "All packages cleaned successfully!"
    
else
    # Clean specific packages
    for package_name in "$@"; do
        clean_package "$package_name"
    done
fi

# Display cleanup summary
echo
print_success "🧹 Package cleanup completed!"
echo -e "${BLUE}Summary:${NC}"
echo "  • Removed node_modules directories"
echo "  • Cleaned build artifacts (dist, build, .next, .turbo)"
echo "  • Removed log files and caches"
echo "  • Cleaned temporary files"
echo
echo -e "${YELLOW}💡 Tip:${NC} Run 'npm install' or equivalent to reinstall dependencies"
echo -e "${YELLOW}💡 Tip:${NC} Use 'npm run clean:packages' from project root for convenience" 