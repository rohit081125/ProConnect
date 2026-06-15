# Skill-Connect — Architecture Overview

This document summarizes the current application architecture and recommended improvements to make the project structure and delivery more professional.

## Current structure
- backend/: Java Spring Boot backend (Maven)
- frontend/: Vite + React frontend (components in `frontend/src/components`, pages in `frontend/src/pages`)
- shared/: shared schema and types
- script/, server/: auxiliary server and scripts

## Frontend
- UI built with Tailwind CSS and a design system in `frontend/src/components/ui`.
- Theme uses CSS variables in `frontend/src/index.css` and `ThemeProvider` in `frontend/src/components/theme-provider.js`.
- Pages live in `frontend/src/pages` and route via the app's router.

## Backend
- Standard Spring Boot app with `pom.xml`, `mvnw`, and Dockerfile in `backend/`.

## Changes applied
- Added an explicit "Admin Login" button in the top navigation (`frontend/src/components/navbar.jsx`) for quick admin access.
- Updated the global CSS variables (`frontend/src/index.css`) to a more professional indigo/teal palette for light and dark modes.
- Small navbar style polish to improve header presence.

## Recommended next steps
- Admin authentication flow: add a dedicated `/admin-login` page and secure `/admin` behind server-side auth or JWT checks.
- Fonts: import a professional font (Inter/Inter var or System UI stack) and ensure accessibility contrast meets WCAG.
- Theming: extract token definitions into a single JSON or JS theme file so tokens can be shared between design system and Tailwind config.
- CI/CD: add GitHub Actions to build/test frontend and backend, run security scans, and build Docker images on merge.
- Design tokens + component library: centralize `ui/` components into a small design system package for reuse and consistency.
- Accessibility: run axe or similar audits and address keyboard and screen-reader flows (nav, forms, modals).
- Documentation: create a CONTRIBUTING.md and a simple run/launch README for local dev.

## Where to look
- Navbar: `frontend/src/components/navbar.jsx`
- Theme tokens: `frontend/src/index.css`
- Admin portal: `frontend/src/pages/admin.jsx`

If you want, I can:
- Create an `/admin-login` page and wire a simple auth form.
- Import a professional webfont and adjust heading sizes.
- Add a CI workflow to build and lint frontend and backend.

Tell me which next step you'd like me to take.
