# 3alemny Shokran - Educational Platform

An interactive educational platform offering courses in multiple languages (English, German, Arabic), Mathematics, and Science with various difficulty levels.

## Features

- **Multiple Courses**: Language learning (English, German, Arabic), Mathematics, and Science
- **Level-Based Learning**: Progressive difficulty levels from A1 to C2 for languages
- **Dark/Light Mode**: Seamless theme switching with persistent settings
- **User Authentication**: Secure login and registration system
- **Mobile Optimized**: Enhanced UI/UX for smartphones and tablets
- **Progress Tracking**: Track your learning progress across courses and chapters

## Mobile Optimization

The platform has been fully optimized for mobile devices:

- **Responsive Layout**: Adapts to various screen sizes
- **Touch-Friendly UI**: Larger touch targets (44px minimum)
- **Mobile Navigation**: Bottom navigation for easy thumb access
- **Optimized Typography**: Improved readability on small screens
- **Mobile Performance**: Reduced animations and optimized resources for faster loading
- **iOS/Android Compatible**: Specific fixes for cross-platform compatibility

## Recent Mobile Improvements (May 2025)

The latest update delivers a complete mobile optimization for all courses:

- **Centralized Mobile Optimization Resources**:
  - `global-mobile.css`: Shared mobile styles for the entire platform
  - `mobile-utils.js`: Universal mobile-specific utilities and enhancements
  - Course-specific `mobile-styles.css` files for tailored optimizations
  - Enhanced existing utilities with mobile compatibility

- **All Course Pages Optimized**:
  - **English Course**: Complete mobile optimization for all lesson pages
  - **German Course**: Added mobile navigation and responsive layout
  - **Arabic Course**: RTL-specific optimizations for mobile devices
  - **Math Course**: Formula display optimizations for small screens
  - **Science Course**: Diagram and experiment visualization improvements

- **Mobile UX Enhancements**:
  - Bottom navigation bar across all pages
  - Improved touch targets (44px minimum size)
  - Haptic feedback for better interaction
  - Mobile-specific spacing and typography
  - Fixed progress tracking with persistent storage
  - Enhanced form elements for touch input

- **Performance Improvements**:
  - Optimized resource loading for mobile networks
  - Reduced animation complexity for better battery life
  - Responsive image loading based on device capabilities
  - Improved scrolling performance on low-end devices

- **Mobile Automation**:
  - Added `Apply-MobileOptimizations.ps1` script for applying mobile optimizations to all course pages
  - Standardized mobile styling across the platform
  - Automatic mobile detection and optimization
  - Cross-browser compatibility fixes

## Project Structure

- **Course Pages**: Organized by subject and level
  - English (A1 to C2)
  - German (A1 to C2)
  - Arabic (A1 to C2)
  - Mathematics (Basic to Advanced)
  - Science (Elementary to Advanced)
  
- **Authentication**: User management system with login and registration
- **Mobile Components**: Specialized UI components for mobile devices

## Technologies Used

- HTML5
- CSS3 (Tailwind CSS)
- JavaScript
- LocalStorage for state management

## Getting Started

1. Clone the repository
2. Open `index.html` in your browser
3. Register a new account or use the demo credentials

## License

This project is licensed under the MIT License.

## Cross-Browser Testing

The platform has been tested on:

- **Mobile Browsers**: 
  - Safari (iOS 16+)
  - Chrome for Android (latest)
  - Samsung Internet (latest)
  - Firefox for Mobile (latest)

- **Desktop Browsers**:
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest)
  - Edge (latest)
