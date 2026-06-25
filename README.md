---
title: ProConnect Backend
emoji: 🚀
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
---

# ProConnect — The Skill Economy Platform

ProConnect is a secure, direct skill economy platform designed to connect talent and opportunity through trust, verified capability, and seamless collaboration. It eliminates intermediaries, enabling professionals to offer services, bid on projects, and build global careers entirely on documented achievements.

---

## 🚀 Key Features

### 1. Project Marketplace & Lifecycle
- **Discover Projects**: Premium project feed cards with line-clamping and detailed project info drawers.
- **Direct Application**: Apply to active projects, submit bids in Indian Rupees (`₹`), and track application statuses.
- **Workflow Pipeline**: Projects move from `active` to `accepted` and `completed` states. Pending bids for the same project expire automatically upon assignment.
- **Activity Synced Profiles**: User profile details query active database states for projects posted and applications submitted in real time.

### 2. Multi-Factor Authentication (MFA) & Signup Verification
- **Email OTP Verification**: Dynamic random 6-digit verification code generated and verified in-place on the signup form.
- **Phone OTP Verification**: Direct SMS verification code integration via Twilio REST API integration.
- **Stateless HMAC Authentication**: Token-based security using custom signed HMAC-SHA256 filters, preventing security overrides and permission blocks.

### 3. Trust & Safety Console (Admin Operations)
- **Warning System**: Send formal warnings to users. Warnings display an acknowledgement popup on login with persistent seen flags.
- **Temporary Suspensions**: Suspend users for 1 day, 1 week, or 1 month. Suspended users see ticking real-time countdown timers and are automatically reactivated.
- **Permanent Bans**: Ban bad actors completely. Deactivated users are restricted and redirected to appeal consoles.
- **Unban/Unsuspend Tools**: Dynamic restore action buttons inside the Admin console to reactivate profiles.
- **Operational Logs**: Support appeal chat threads and user reports automatically logged for administrative action.

### 4. Real-Time Chat & Support Console
- **Pinned Support Admin**: Pinned Support Admin ("Rohit Dongare (Admin)") at the top of every user's chat listing.
- **Direct Messaging**: Direct warning/action explanations sent to chat threads automatically.
- **Unread Message Highlights**: Bold styling, static red dots, and unread counts in navbar and sidebar.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Wouter, Zustand
- **Backend**: Java Spring Boot, Spring Security (Stateless Token Authentication), Spring Data MongoDB
- **Database**: MongoDB (Atlas Cloud)
- **Integrations**: Twilio SMS REST API, Cloudinary (File Uploads), Gmail SMTP (Email OTPs)

---

## ⚡ How to Setup and Run

### 1. Prerequisites
- **Java JDK 17** or higher
- **Node.js** (v18+)
- **Maven** (built-in wrapper `mvnw` included)
- **MongoDB Database** (local or cloud instance)

### 2. Spring Boot Backend Setup
Configure your MongoDB database URI, Cloudinary, and Gmail SMTP parameters in `backend/src/main/resources/application.properties`.
Then build and run:
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
The server will run on `http://localhost:8080`.

### 3. Frontend & Dev Proxy Setup
From the project root, install dependencies and run the local development server:
```bash
npm install
npm run dev
```
The Vite development proxy runs on `http://localhost:5000` (which serves the frontend assets and automatically routes `/api` calls to the Spring Boot server).

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
