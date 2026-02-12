# ProConnect - Skill Economy Platform

## Overview
ProConnect is a frontend-only React SPA for a skill economy network. Users can post work, apply for projects, hire talent, and build reputation through a trust-based system. Single role system - everyone can both post and apply.

## Tech Stack
- React + TypeScript
- Tailwind CSS with Shadcn UI components
- Zustand for state management
- Wouter for client-side routing
- Vite + Express (backend serves SPA only)
- Dummy JSON data (no database, no API, frontend simulation)

## Project Architecture
```
client/src/
  App.tsx              - Main app with routing (wouter) and providers
  components/
    theme-provider.tsx  - Light/dark mode toggle
    navbar.tsx          - Top navigation with logo, notifications, username
    bottom-nav.tsx      - Mobile bottom navigation (Home, Messages, Post, Applications, Profile)
    work-card.tsx       - Reusable work post card component
    ui/                 - Shadcn UI components
  pages/
    landing.tsx         - Public landing page with hero, features, CTAs
    about.tsx           - About page with vision, mission, team
    signup.tsx          - Signup form (name, email, password)
    setup-profile.tsx   - Profile setup after signup (bio, skills, location)
    login.tsx           - Login form with demo account hints
    home.tsx            - Main feed with search, filters, sort, apply dialog
    messages.tsx        - Chat interface (threads + chat window)
    add-work.tsx        - Post new work form
    my-applications.tsx - Sent/received applications, accept/reject, mark done, report
    profile.tsx         - User profile with edit, skills, portfolio, reviews
  lib/
    store.ts            - Zustand global store (auth, work, applications, messages, etc.)
    types.ts            - TypeScript interfaces
    dummy-data.ts       - Seed data (users, work posts, applications, messages, reviews)
    queryClient.ts      - TanStack Query setup (minimal usage)
    utils.ts            - Utility functions
  hooks/
    use-toast.ts        - Toast notifications
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
