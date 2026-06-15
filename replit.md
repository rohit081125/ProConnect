# ProConnect - Skill Economy Platform

## Overview
ProConnect is a full-stack React and Spring Boot skill economy platform. Users can post work, apply for projects, hire talent, message collaborators, report issues, and build reputation through reviews.

## Tech Stack
- React + TypeScript
- Tailwind CSS with Shadcn UI components
- Zustand for state management
- Wouter for client-side routing
- Vite frontend with an Express/Vite development shell
- Java Spring Boot backend with MongoDB APIs

## Project Architecture
```
frontend/src/
  App.jsx              - Main app with routing (wouter) and providers
  components/
    theme-provider.js   - Light/dark mode toggle
    navbar.jsx          - Top navigation with logo, notifications, username
    bottom-nav.js       - Mobile bottom navigation (Home, Messages, Post, Applications, Profile)
    work-card.jsx       - Reusable work post card component
    ui/                 - Shadcn UI components
  pages/
    landing.js          - Public landing page with hero, features, CTAs
    signup.jsx          - Signup form
    login.jsx           - Login form
    home.jsx            - Main feed with search, filters, sort, apply dialog
    messages.jsx        - Chat interface
    add-work.jsx        - Post new work form
    my-applications.jsx - Sent/received applications, completion, reports, reviews
    profile.jsx         - User profile with edit, skills, portfolio, reviews
    public-profile.jsx  - Public user profiles
    admin.jsx           - Admin portal for users, reports, and moderation
  lib/
    store.js            - Zustand global store
    api.js              - Backend API helpers
    dummy-data.js       - Local fallback/demo data
    queryClient.js      - TanStack Query setup
    utils.js            - Utility functions
  hooks/
    use-toast.js        - Toast notifications
```

## User Preferences
- Mobile-first, app-style UI
- Blue (#3B82F6 primary) + Teal (#14B8A6 accent) color scheme
- Light and dark mode support
- Inter font family

## Recent Changes
- 2026-02-12: Initial MVP build
  - All 10 pages implemented
  - Zustand store with complete CRUD operations
  - Form validation using react-hook-form + zod
  - Theme system with light/dark mode
  - Responsive bottom navigation
  - Notification system
  - Report system for work completion
