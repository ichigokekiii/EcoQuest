# Eco Quest

Eco Quest is a mobile-first gamified environmental cleanup platform where users complete real-world cleanup routes, collect trash, submit photo proof, earn points, complete missions, and redeem rewards.

The project includes:

```txt
React Native + Expo mobile app
Vite React desktop admin panel
Express.js + Node.js backend
Firebase Authentication
Cloud Firestore
Firebase Cloud Storage
Firebase Admin SDK
```

---

## Project Overview

Eco Quest turns environmental cleanup into a real-world mission game.

Users can browse cleanup routes, start a route session, collect trash, submit trash photo proof, complete missions, earn points, and redeem rewards from the in-app store.

Admins can manage users, routes, missions, trash submissions, rewards, redemptions, analytics, and reports through a desktop admin dashboard.

---

## Core Idea

The main user flow is:

```txt
User logs in
→ views cleanup routes
→ selects a route
→ starts a route session
→ collects trash
→ submits trash photo proof
→ reaches the minimum trash requirement
→ completes the route
→ earns points
→ redeems rewards
```

Each route has a minimum trash requirement.

Example:

```txt
Minimum required trash: 10
Visual maximum goal: 20
Actual maximum: unlimited
```

The user must reach the minimum requirement before finishing the route, but they can continue collecting more trash for bonus points.

---

## Tech Stack

## Mobile App

```txt
React Native
Expo
Expo Router
Firebase Authentication
Firebase Storage
Express API
Expo ImagePicker or Expo Camera
Expo Location
Expo SecureStore
react-native-maps
```

## Desktop Admin Panel

```txt
Vite React
React Router
Tailwind CSS
Firebase Authentication
Express API
Recharts
Axios or fetch
```

## Backend

```txt
Express.js
Node.js
Firebase Admin SDK
Cloud Firestore
Firebase Cloud Storage
Firebase token verification middleware
Multer if needed
```

## Firebase Services

```txt
Firebase Authentication
Cloud Firestore
Firebase Cloud Storage
Firebase Admin SDK
```

---

## Project Structure

Recommended structure:

```txt
eco-quest/
│
├── mobile/
├── admin/
├── backend/
├── docs/
├── README.md
└── .gitignore
```

Folder purpose:

```txt
mobile/   → React Native + Expo mobile app
admin/    → Vite React desktop admin dashboard
backend/  → Shared Express.js backend API
docs/     → Local project documentation and AI context files
```

---

## Documentation Structure

The main project documentation files are stored locally in `docs/`.

```txt
docs/
├── context.md
├── architecture.md
├── agents.md
├── skills.md
├── progress.md
└── references/
    ├── roadmap.md
    ├── api-plan.md
    ├── database.md
    ├── ui-ux.md
    ├── setup.md
    └── flowcharts.md
```

Important:

```txt
The docs folder is ignored by Git.
These files are for local planning, AI coding context, and development guidance.
```

The active docs are:

```txt
docs/context.md
docs/architecture.md
docs/agents.md
docs/skills.md
docs/progress.md
```

Reference docs are stored in:

```txt
docs/references/
```

Reference docs should only be used when deeper task-specific detail is needed.

---

## Main Features

## Mobile User Features

```txt
User registration and login
User profile
Route discovery
Route details
Start route session
Active route tracking
Trash photo submission
Mission progress
Route completion
Points earning
Rewards store
Reward redemption
Leaderboard
Activity history
Notifications
```

## Admin Features

```txt
Admin login
Admin dashboard
User management
Route management
Mission management
Trash submission monitoring
Reward management
Redemption management
Trash category management
Analytics
Reports
CSV export
```

---

## MVP Scope

The MVP should focus on:

```txt
Authentication
User profile
Admin login
Route CRUD
Route discovery
Route details
Route sessions
Trash photo submission
Auto-approve trash proof
Mission progress
Route completion
Points calculation
Rewards
Reward redemption
Admin dashboard
Basic analytics
CSV reports
```

Future features include:

```txt
Admin trash verification
Push notifications
Advanced map route builder
Background location tracking
Geofencing
AI trash classification
PDF reports
Team cleanup events
Community challenges
```

---

## Architecture Rule

Eco Quest uses Express as the secure business logic layer.

The frontend should not directly update sensitive data.

Sensitive actions must go through Express:

```txt
Points calculation
Route completion validation
Reward redemption
Admin approvals
User role changes
Mission progress updates
Analytics
Reports
```

High-level architecture:

```txt
React Native Mobile App  ─┐
                          ├── Express API ─── Firebase Admin SDK ─── Cloud Firestore
Vite React Admin Panel ───┘                                      └── Firebase Storage
```

---

## Sensitive Fields

The frontend must not directly update:

```txt
users.points
users.role
users.status
users.totalTrashCollected
users.routesCompleted
routeSessions.status
routeSessions.totalPointsEarned
routeSessions.basePointsEarned
routeSessions.trashPointsEarned
routeSessions.bonusPointsEarned
trashSubmissions.status
trashSubmissions.reviewedBy
trashSubmissions.reviewedAt
trashSubmissions.rejectionReason
redemptions.status
rewards.stock
```

These fields should be updated through Express using Firebase Admin SDK.

---

## Development Style

Eco Quest should follow a simple, beginner-friendly coding style inspired by Net Ninja / iamshaunjp tutorial repositories.

The code should be:

```txt
Simple
Readable
Beginner-friendly
Easy to explain
Easy to debug
Efficient enough for an MVP
```

Avoid:

```txt
Over-engineering
Unnecessary abstractions
Too many libraries
Complex state management too early
Enterprise-level architecture
Hard-to-explain code
```

---

## Recommended Build Order

```txt
1. Create root folder structure
2. Set up backend/
3. Set up Firebase project
4. Connect Firebase Admin SDK
5. Set up mobile/
6. Set up admin/
7. Build authentication
8. Build admin route management
9. Build mobile route discovery
10. Build route sessions
11. Build trash photo submission
12. Build points calculation
13. Build rewards and redemption
14. Build admin dashboard
15. Add analytics and reports
16. Polish and prepare demo
```

---

## Local Development

The project will usually run three apps during development:

```txt
backend/
mobile/
admin/
```

Example terminals:

```bash
cd backend
npm run dev
```

```bash
cd mobile
npx expo start
```

```bash
cd admin
npm run dev
```

---

## Environment Variables

Use a single environment file at the repo root:

```txt
.env
```

Copy the template once:

```bash
cp .env.example .env
```

Backend, mobile, and admin load from this root `.env` (see `backend/src/config/env.js`, `admin/vite.config.js`, and `mobile/app.config.js` / `mobile/metro.config.js`).

Never commit `.env` files.

Never commit Firebase Admin SDK service account files.

Firebase Admin SDK credentials must only be used inside:

```txt
backend/
```

They must never be placed inside:

```txt
mobile/
admin/
```

---

## Git Notes

This repository ignores:

```txt
node_modules/
.env files
Firebase private keys
build output
Expo cache
docs/*.md files
docs/references/*.md files
```

The `docs/` folder contains local project context and AI planning files, so Markdown files inside `docs/` are intentionally ignored.

---

## Current Status

```txt
Shared backend structure established.
Mobile app kept in mobile/.
Desktop admin app scaffolded in admin/.
Admin-only API routes grouped under /api/admin.
```

---

## Project Goal

The goal of Eco Quest is to create a working MVP that demonstrates how technology, gamification, and environmental responsibility can work together.

The MVP should clearly show that:

```txt
Users can discover cleanup routes.
Users can start cleanup missions.
Users can submit trash photo proof.
Users can complete missions.
Users can earn points.
Users can redeem rewards.
Admins can manage and monitor the platform.
```

Eco Quest should feel like a real app, not just a static prototype.
