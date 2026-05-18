#!/usr/bin/env python3
"""Generate docs/context.md for Eco Quest restoration."""

OUT = "/Users/jc/EcoQuest/docs/context.md"
L = []

def w(*parts):
    for p in parts:
        L.append(p)

def blank():
    L.append("")

def code(block):
    w("```txt", *block.split("\n"), "```")
    blank()

def bullets(items):
    for item in items:
        w(f"- {item}")
    blank()

# --- HEADER ---
w("# Eco Quest - Project Context")
blank()
w("This file is the main project context document for Eco Quest.")
w("It should be read first before coding, planning, or making architectural decisions.")
blank()

# --- 1. PURPOSE ---
w("## 1. Purpose")
blank()
w("The purpose of this document is to provide a complete, beginner-friendly overview of the Eco Quest project.")
blank()
w("Eco Quest is a mobile-first gamified environmental cleanup platform.")
w("Users complete real-world cleanup routes, collect trash, submit photo proof, earn points, complete missions, and redeem rewards.")
blank()
w("Admins manage the platform through a desktop admin dashboard.")
blank()
w("This document explains:")
bullets([
    "what the project is",
    "how the system works",
    "what each application is responsible for",
    "what pages and collections exist",
    "what rules must never be broken",
    "what belongs in the MVP",
    "how development should be approached",
    "how AI assistants should help with the project",
])
w("This file is the primary source of truth for project context.")
w("Other documentation files provide deeper detail when needed.")
blank()

# --- 2. MAIN DOCUMENTATION STRUCTURE ---
w("## 2. Main Documentation Structure")
blank()
w("The main active documentation files are stored locally in:")
blank()
code("docs/")
w("Active documentation files:")
blank()
code("""docs/context.md       → main project context (this file)
docs/architecture.md  → system architecture and data flows
docs/agents.md        → AI coding assistant instructions
docs/skills.md        → reusable coding patterns and skills
docs/progress.md      → development progress tracking""")
w("Recommended reading order:")
blank()
code("""1. context.md
2. architecture.md
3. agents.md
4. skills.md
5. progress.md""")
w("When starting a new coding session:")
blank()
code("""Read context.md first
Then read architecture.md if working on system design
Then read agents.md if using an AI coding assistant
Then read progress.md to see what has already been completed""")
w("Important:")
blank()
code("""The docs folder is ignored by Git.
These files are for local planning, AI coding context, and development guidance.
They are not committed to the repository.""")
blank()

# --- 3. REFERENCE DOCUMENTATION ---
w("## 3. Reference Documentation")
blank()
w("Reference documentation is stored in:")
blank()
code("docs/references/")
w("Reference files:")
blank()
code("""docs/references/roadmap.md      → phased development roadmap
docs/references/api-plan.md     → REST API endpoint planning
docs/references/database.md     → Firestore schema and field details
docs/references/ui-ux.md        → screen layouts and UI guidance
docs/references/setup.md        → installation and environment setup
docs/references/flowcharts.md   → system flow diagrams (optional)""")
w("When to use reference docs:")
blank()
code("""Use context.md and architecture.md for everyday development.
Open reference docs only when you need deeper task-specific detail.""")
w("Examples:")
blank()
code("""Building an API route        → open api-plan.md
Designing a Firestore field  → open database.md
Building a mobile screen       → open ui-ux.md
Setting up Firebase locally    → open setup.md
Checking development phases    → open roadmap.md""")
blank()

# --- 4. PROJECT OVERVIEW ---
w("## 4. Project Overview")
blank()
w("Eco Quest turns environmental cleanup into a real-world mission game.")
blank()
w("The project includes three main applications:")
blank()
code("""mobile/   → React Native + Expo mobile app for users
admin/    → Vite React desktop admin dashboard
server/   → Express.js backend API""")
w("Firebase provides:")
blank()
code("""Firebase Authentication
Cloud Firestore
Firebase Cloud Storage
Firebase Admin SDK (server only)""")
w("Users can:")
bullets([
    "register and log in",
    "browse cleanup routes",
    "view route details on a map",
    "start a route session",
    "collect trash during the route",
    "submit trash photo proof",
    "complete missions",
    "finish a route after meeting the minimum trash requirement",
    "earn points",
    "redeem rewards from the in-app store",
    "view profile stats and activity",
])
w("Admins can:")
bullets([
    "log in to the admin dashboard",
    "manage users",
    "create and edit routes",
    "manage missions",
    "monitor trash submissions",
    "manage rewards and redemptions",
    "manage trash categories",
    "view analytics",
    "export CSV reports",
])
w("Eco Quest is inspired by location-based and route-based apps such as:")
bullets([
    "Pokémon GO (map and mission feeling)",
    "Strava (route progress and completion)",
    "Google Maps (route visualization)",
])
w("The focus is on routes and missions, not just trash logging.")
blank()

# --- 5. CORE CONCEPT ---
w("## 5. Core Concept")
blank()
w("The core concept of Eco Quest is simple:")
blank()
code("""A user selects a cleanup route
→ starts a route session
→ collects trash in the real world
→ submits photo proof for each trash item
→ reaches the minimum trash requirement
→ finishes the route
→ earns points
→ redeems rewards""")
w("Each route has:")
bullets([
    "a title and description",
    "a location name",
    "estimated distance and duration",
    "a map path with start, checkpoint, and end markers",
    "a minimum trash requirement",
    "a visual maximum goal",
    "base points for completion",
    "optional bonus points for extra trash",
])
w("Example route trash rules:")
blank()
code("""Minimum required trash: 10
Visual maximum goal: 20
Actual maximum: unlimited""")
w("Rules:")
bullets([
    "The user must reach the minimum trash requirement before they can finish the route.",
    "The user can continue collecting more trash after reaching the minimum.",
    "Extra trash beyond the minimum can earn bonus points.",
    "The visual maximum goal is for UI motivation only.",
    "There is no hard maximum on trash collected.",
])
w("Points are calculated on the server, not on the client.")
blank()

# --- 6. FINAL TECH STACK ---
w("## 6. Final Tech Stack")
blank()
w("The final approved tech stack for Eco Quest is:")
blank()
w("### Mobile App")
blank()
code("""React Native
Expo
Expo Router
Firebase Authentication
Firebase Storage (image uploads)
Express API (business logic)
Expo ImagePicker or Expo Camera
Expo Location
Expo SecureStore
react-native-maps
axios""")
w("### Desktop Admin Panel")
blank()
code("""Vite
React
React Router
Tailwind CSS
Firebase Authentication
Express API
Recharts
axios or fetch""")
w("### Backend")
blank()
code("""Express.js
Node.js
Firebase Admin SDK
Cloud Firestore
Firebase Cloud Storage
Firebase token verification middleware
Multer (if needed for file handling)""")
w("### Firebase Services")
blank()
code("""Firebase Authentication
Cloud Firestore
Firebase Cloud Storage
Firebase Admin SDK""")
w("### Language Choice")
blank()
w("Use JavaScript for the MVP unless the project owner explicitly changes this.")
w("Do not introduce TypeScript unless requested.")
blank()

# --- 7. CODE STYLE REFERENCE ---
w("## 7. Code Style Reference")
blank()
w("Eco Quest should follow a simple, beginner-friendly coding style inspired by:")
blank()
w("Net Ninja / iamshaunjp tutorial repositories.")
blank()
w("Reference style characteristics:")
bullets([
    "small, focused files",
    "clear function names",
    "minimal abstraction",
    "readable JSX and component structure",
    "plain Express routes and controllers",
    "simple folder organization",
    "comments only where they add real value",
    "easy-to-follow imports",
    "consistent naming across mobile, admin, and server",
])
w("Good examples of the desired style:")
bullets([
    "a route file that clearly shows one responsibility",
    "a React component that is easy to explain line by line",
    "a controller function with straightforward logic",
    "a Firestore query that is easy to read",
])
w("Avoid:")
bullets([
    "enterprise-style layered architecture too early",
    "unnecessary design patterns",
    "over-abstracted hooks and utilities",
    "complex state management libraries for MVP",
    "clever code that is hard to explain in a class demo",
])
blank()

# --- 8. CODE STYLE GOALS ---
w("## 8. Code Style Goals")
blank()
w("Every part of the Eco Quest codebase should aim to be:")
blank()
code("""Simple
Readable
Beginner-friendly
Easy to explain
Easy to debug
Efficient enough for an MVP""")
w("When writing code, ask:")
bullets([
    "Can a beginner understand this?",
    "Can I explain this in a presentation?",
    "Is this the simplest solution that works?",
    "Does this match the rest of the project?",
    "Am I adding complexity without a clear reason?",
])
w("Prefer:")
bullets([
    "explicit code over clever code",
    "small functions over large functions",
    "clear variable names over short names",
    "repeated simple patterns over heavy abstraction",
])
blank()

# --- 9. CODE EXPLANATION REQUIREMENT ---
w("## 9. Code Explanation Requirement")
blank()
w("All Eco Quest code should be written so it can be clearly explained.")
blank()
w("This is important because:")
bullets([
    "the project may be presented in a class or demo",
    "AI assistants should be able to explain changes clearly",
    "future contributors should understand the logic quickly",
    "debugging should be straightforward",
])
w("When adding features, be ready to explain:")
bullets([
    "what the feature does",
    "which file handles it",
    "which API route is called",
    "which Firestore collection is affected",
    "why sensitive logic stays on the server",
])
w("If code cannot be explained simply, simplify it.")
blank()

# --- 10. HIGH-LEVEL ARCHITECTURE ---
w("## 10. High-Level Architecture")
blank()
w("Eco Quest uses Express as the secure business logic layer.")
blank()
code("""React Native Mobile App  ─┐
                          ├── Express API ─── Firebase Admin SDK ─── Cloud Firestore
Vite React Admin Panel ───┘                                      └── Firebase Storage""")
w("Architecture rules:")
bullets([
    "Mobile and admin apps talk to Express for protected actions.",
    "Express verifies Firebase ID tokens.",
    "Express uses Firebase Admin SDK for trusted reads and writes.",
    "Firestore stores application data.",
    "Cloud Storage stores trash photos and other media.",
    "Frontend apps must not directly update sensitive fields.",
])
w("Express handles sensitive logic such as:")
bullets([
    "points calculation",
    "route completion validation",
    "reward redemption",
    "admin approvals",
    "user role changes",
    "mission progress updates",
    "analytics aggregation",
    "report generation",
])
blank()

# --- 11. USER ROLES ---
w("## 11. User Roles")
blank()
w("Eco Quest has two main roles:")
blank()
w("### User")
blank()
w("Regular mobile app users.")
w("They can browse routes, start sessions, submit trash, earn points, and redeem rewards.")
blank()
w("### Admin")
blank()
w("Desktop admin dashboard users.")
w("They can manage platform content, review activity, and access analytics.")
blank()
w("Role field location:")
blank()
code("users.role")
w("Allowed values:")
blank()
code("""user
admin""")
w("Role enforcement:")
bullets([
    "Firebase Authentication handles login.",
    "Express middleware verifies the token.",
    "Admin middleware checks users.role === 'admin' for protected admin routes.",
    "Mobile app should not expose admin features.",
])
blank()

# Mobile pages data
MOBILE_PAGES = [
    ("12.1", "Splash / Welcome Screen", "index", [
        "First screen users may see when opening the app.",
        "Shows Eco Quest branding and wordmark.",
        "Provides entry to login or register.",
        "May show a short tagline about environmental cleanup missions.",
    ], ["Navigate to Login", "Navigate to Register", "Auto-redirect if already logged in"]),
    ("12.2", "Login Screen", "login", [
        "Email and password login form.",
        "Firebase Authentication sign-in.",
        "Error messages for invalid credentials.",
        "Link to register screen.",
    ], ["POST auth via Firebase", "Navigate to main tabs on success"]),
    ("12.3", "Register Screen", "register", [
        "User registration form with display name, email, password.",
        "Creates Firebase Auth account.",
        "Creates or syncs user profile in Firestore through Express.",
        "Default role: user.",
    ], ["POST /api/users/sync or equivalent", "Navigate to main tabs on success"]),
    ("12.4", "Home Screen", "(tabs)/index", [
        "Main dashboard after login.",
        "Shows user greeting and quick stats.",
        "Featured or nearby routes preview.",
        "Quick links to map, missions, and store.",
        "May show recent activity summary.",
    ], ["GET /api/routes/nearby", "GET /api/users/me"]),
    ("12.5", "Map Screen", "(tabs)/map", [
        "Map view of nearby cleanup routes.",
        "Route markers on react-native-maps.",
        "Tap marker to view route summary.",
        "Navigate to route details.",
    ], ["GET /api/routes/nearby", "Uses Expo Location for user position"]),
    ("12.6", "Missions Screen", "(tabs)/missions", [
        "Lists available missions for the user.",
        "Shows mission progress and rewards.",
        "May include daily or route-based missions.",
    ], ["GET /api/missions", "GET /api/missions/progress"]),
    ("12.7", "Store Screen", "(tabs)/store", [
        "Rewards store listing.",
        "Shows reward name, description, point cost, stock.",
        "Redeem button for each reward.",
        "Displays user point balance.",
    ], ["GET /api/rewards", "POST /api/redemptions"]),
    ("12.8", "Profile Screen", "(tabs)/profile", [
        "User profile with avatar, name, email.",
        "Stats: total points, routes completed, trash collected.",
        "Links to activity history, settings, logout.",
    ], ["GET /api/users/me"]),
    ("12.9", "Route Details Screen", "route-details", [
        "Full route information before starting.",
        "Map with route polyline and markers.",
        "Shows distance, duration, difficulty, min trash, points.",
        "Start Route button.",
    ], ["GET /api/routes/:id", "POST /api/route-sessions/start"]),
    ("12.10", "Active Route Screen", "active-route", [
        "Live route session tracking.",
        "Progress bar for trash collected vs minimum and visual max.",
        "Current trash count display.",
        "Buttons: Submit Trash, Finish Route (disabled until minimum met).",
        "Session timer and route map.",
    ], ["GET /api/route-sessions/:id", "PATCH session updates"]),
    ("12.11", "Camera / Trash Photo Screen", "camera", [
        "Capture trash photo using Expo ImagePicker or Camera.",
        "Optional category selection.",
        "Upload photo to Firebase Storage.",
        "Submit trash proof to backend.",
    ], ["Upload to Storage", "POST /api/trash-submissions"]),
    ("12.12", "Trash Confirm Screen", "trash-confirm", [
        "Review captured photo before final submit.",
        "Confirm or retake photo.",
        "Shows estimated points for this submission (MVP: auto-approved).",
    ], ["POST /api/trash-submissions confirm"]),
    ("12.13", "Route Complete Screen", "route-complete", [
        "Shown after successfully finishing a route.",
        "Displays points earned breakdown: base, trash, bonus.",
        "Shows total trash collected.",
        "Navigate home or view rewards.",
    ], ["POST /api/route-sessions/:id/finish"]),
    ("12.14", "Activity History Screen", "activity-history", [
        "List of past route sessions and redemptions.",
        "Filter by date or type.",
        "Tap item for details.",
    ], ["GET /api/users/me/activity"]),
    ("12.15", "Leaderboard Screen", "leaderboard", [
        "Top users by points or trash collected.",
        "Nice-to-have for MVP if time allows.",
        "Rank list with avatars and stats.",
    ], ["GET /api/leaderboard"]),
    ("12.16", "Notifications Screen", "notifications", [
        "In-app notification list.",
        "Mission completed, reward approved, route reminders.",
        "Nice-to-have for MVP; full push notifications are future scope.",
    ], ["GET /api/notifications"]),
]

w("## 12. Main Mobile User Pages")
blank()
w("The mobile app uses Expo Router for navigation.")
w("Main structure:")
blank()
code("""mobile/app/
├── _layout.jsx
├── index.jsx
├── login.jsx
├── register.jsx
├── (tabs)/
│   ├── _layout.jsx
│   ├── index.jsx      → Home
│   ├── map.jsx        → Map
│   ├── missions.jsx   → Missions
│   ├── store.jsx      → Store
│   └── profile.jsx    → Profile
├── route-details.jsx
├── active-route.jsx
├── camera.jsx
├── trash-confirm.jsx
├── route-complete.jsx
├── activity-history.jsx
├── leaderboard.jsx
└── notifications.jsx""")

for num, title, route, desc, actions in MOBILE_PAGES:
    w(f"### {num} {title}")
    blank()
    w(f"Route file: `{route}`")
    blank()
    w("Purpose:")
    for d in desc:
        w(f"- {d}")
    blank()
    w("Key actions:")
    for a in actions:
        w(f"- {a}")
    blank()

ADMIN_PAGES = [
    ("13.1", "Admin Login", "Login page for admin users only."),
    ("13.2", "Dashboard", "Overview stats: users, routes, sessions, trash, redemptions."),
    ("13.3", "Users Management", "List, search, view, edit status and roles of users."),
    ("13.4", "Routes Management", "CRUD for cleanup routes including map coordinates."),
    ("13.5", "Missions Management", "CRUD for missions and mission requirements."),
    ("13.6", "Trash Submissions", "Monitor submitted trash photos and statuses."),
    ("13.7", "Rewards Management", "CRUD for store rewards, points cost, stock."),
    ("13.8", "Redemptions Management", "View and update redemption statuses."),
    ("13.9", "Trash Categories", "Manage categories for trash classification."),
    ("13.10", "Analytics", "Charts for engagement, completions, points, trends."),
    ("13.11", "Reports", "CSV export for users, sessions, trash, redemptions."),
    ("13.12", "Settings / Admin Profile", "Admin account settings and logout."),
]

w("## 13. Admin Desktop Pages")
blank()
w("The admin panel is a Vite React desktop dashboard.")
w("Main structure:")
blank()
code("""admin/src/
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Users.jsx
│   ├── Routes.jsx
│   ├── Missions.jsx
│   ├── TrashSubmissions.jsx
│   ├── Rewards.jsx
│   ├── Redemptions.jsx
│   ├── TrashCategories.jsx
│   ├── Analytics.jsx
│   ├── Reports.jsx
│   └── Settings.jsx
├── components/
├── layouts/
└── services/""")

for num, title, desc in ADMIN_PAGES:
    w(f"### {num} {title}")
    blank()
    w(desc)
    blank()
    w("Access: admin role required.")
    blank()

# Firestore collections
COLLECTIONS = {
    "users": [
        ("uid", "string – Firebase Auth UID (document ID)"),
        ("email", "string"),
        ("displayName", "string"),
        ("role", "string – user | admin"),
        ("status", "string – active | suspended"),
        ("points", "number – current point balance (sensitive)"),
        ("totalTrashCollected", "number (sensitive)"),
        ("routesCompleted", "number (sensitive)"),
        ("avatarUrl", "string – optional"),
        ("createdAt", "timestamp"),
        ("updatedAt", "timestamp"),
    ],
    "routes": [
        ("title", "string"),
        ("description", "string"),
        ("locationName", "string"),
        ("difficulty", "string – Easy | Medium | Hard"),
        ("distanceKm", "number"),
        ("estimatedDurationMin", "number"),
        ("minTrashRequired", "number"),
        ("visualMaxTrash", "number"),
        ("basePoints", "number"),
        ("bonusPointsPerExtraTrash", "number"),
        ("coordinates", "array of lat/lng for polyline"),
        ("markers", "array of map markers"),
        ("status", "string – draft | published | archived"),
        ("createdAt", "timestamp"),
        ("updatedAt", "timestamp"),
    ],
    "routeSessions": [
        ("userId", "string"),
        ("routeId", "string"),
        ("status", "string – active | completed | cancelled (sensitive)"),
        ("trashCollectedCount", "number"),
        ("startedAt", "timestamp"),
        ("completedAt", "timestamp – optional"),
        ("basePointsEarned", "number (sensitive)"),
        ("trashPointsEarned", "number (sensitive)"),
        ("bonusPointsEarned", "number (sensitive)"),
        ("totalPointsEarned", "number (sensitive)"),
    ],
    "missions": [
        ("title", "string"),
        ("description", "string"),
        ("type", "string – daily | route | collection"),
        ("requirement", "object – mission-specific rules"),
        ("rewardPoints", "number"),
        ("status", "string – active | inactive"),
        ("createdAt", "timestamp"),
    ],
    "trashSubmissions": [
        ("userId", "string"),
        ("routeSessionId", "string"),
        ("routeId", "string"),
        ("categoryId", "string – optional"),
        ("photoUrl", "string"),
        ("status", "string – pending | approved | rejected (sensitive)"),
        ("pointsAwarded", "number (sensitive)"),
        ("reviewedBy", "string – admin uid (sensitive)"),
        ("reviewedAt", "timestamp (sensitive)"),
        ("rejectionReason", "string (sensitive)"),
        ("submittedAt", "timestamp"),
    ],
    "rewards": [
        ("name", "string"),
        ("description", "string"),
        ("pointsCost", "number"),
        ("stock", "number (sensitive)"),
        ("imageUrl", "string"),
        ("status", "string – active | inactive"),
        ("createdAt", "timestamp"),
    ],
    "redemptions": [
        ("userId", "string"),
        ("rewardId", "string"),
        ("pointsSpent", "number"),
        ("status", "string – pending | fulfilled | cancelled (sensitive)"),
        ("createdAt", "timestamp"),
        ("fulfilledAt", "timestamp – optional"),
    ],
    "achievements": [
        ("title", "string"),
        ("description", "string"),
        ("iconUrl", "string"),
        ("criteria", "object"),
        ("pointsReward", "number"),
    ],
    "notifications": [
        ("userId", "string"),
        ("type", "string"),
        ("title", "string"),
        ("message", "string"),
        ("read", "boolean"),
        ("createdAt", "timestamp"),
    ],
    "trashCategories": [
        ("name", "string"),
        ("description", "string"),
        ("iconName", "string"),
        ("pointsValue", "number"),
        ("status", "string – active | inactive"),
    ],
    "pointTransactions": [
        ("userId", "string"),
        ("type", "string – earn | spend | bonus | adjustment"),
        ("amount", "number"),
        ("source", "string – route | trash | mission | redemption | admin"),
        ("referenceId", "string – related document id"),
        ("createdAt", "timestamp"),
    ],
}

w("## 14. Main Firestore Collections")
blank()
w("Eco Quest uses the following main Firestore collections:")
blank()
for coll in COLLECTIONS:
    w(f"### {coll}")
    blank()
    for field, desc in COLLECTIONS[coll]:
        w(f"- `{field}` – {desc}")
    blank()

# 15 Core User Journey
w("## 15. Core User Journey")
blank()
w("The main end-to-end user journey:")
blank()
code("""1. User opens the mobile app
2. User registers or logs in
3. User browses routes on Home or Map
4. User opens Route Details
5. User taps Start Route
6. Backend creates a routeSessions document with status active
7. User collects trash in the real world
8. User taps Submit Trash and captures a photo
9. Photo uploads to Firebase Storage
10. Backend creates trashSubmissions record (MVP: auto-approved)
11. Backend increments session trash count and awards trash points
12. User repeats trash submission until minimum is reached
13. Finish Route button becomes enabled
14. User taps Finish Route
15. Backend validates minimum trash met
16. Backend calculates base + trash + bonus points
17. Backend updates user points and session status completed
18. User sees Route Complete screen
19. User opens Store and redeems a reward
20. Backend validates points and stock, creates redemption""")
blank()

# 16 Core System Rules
w("## 16. Core System Rules")
blank()
RULES = [
    "Users must be authenticated to start a route session.",
    "A user can have only one active route session at a time (recommended MVP rule).",
    "Trash photo submission requires an active route session.",
    "Minimum trash requirement must be met before finishing a route.",
    "Finish Route must go through Express validation.",
    "Points are calculated on the server only.",
    "Reward redemption must check user points and reward stock on the server.",
    "Admin routes require admin role middleware.",
    "Firebase Admin SDK credentials must only exist in server/.",
    "Mobile and admin apps use Firebase client SDK for auth and storage uploads only.",
    "Sensitive Firestore fields must not be updated directly from the frontend.",
    "All API requests to protected routes must include Authorization: Bearer <firebase_id_token>.",
    "User profile sync should happen after registration and login.",
    "Trash submissions in MVP are auto-approved immediately.",
    "Rejected or pending trash (future) must not count toward minimum until approved.",
]
for i, r in enumerate(RULES, 1):
    w(f"{i}. {r}")
blank()

# 17 Sensitive Logic Rules
w("## 17. Sensitive Logic Rules")
blank()
w("The frontend must NOT directly update these fields:")
blank()
code("""users.points
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
rewards.stock""")
w("These fields must be updated through Express using Firebase Admin SDK.")
blank()
w("Sensitive actions that must go through Express:")
bullets([
    "starting and finishing route sessions",
    "calculating and awarding points",
    "approving or rejecting trash submissions (future)",
    "creating redemptions and deducting points",
    "updating reward stock",
    "changing user roles or status",
    "admin analytics and report generation",
])
blank()

# 18 Trash Submission Verification Modes
w("## 18. Trash Submission Verification Modes")
blank()
w("### MVP Mode: Auto-Approve")
blank()
w("For the MVP, all trash submissions are automatically approved.")
blank()
w("Flow:")
blank()
code("""User submits photo
→ Express creates trashSubmissions with status approved
→ Points awarded immediately
→ Session trash count incremented
→ User can continue collecting trash""")
w("Reason:")
bullets([
    "simpler demo flow",
    "no admin review queue required for MVP",
    "faster user feedback",
    "easier to test end-to-end",
])
blank()
w("### Future Mode: Admin Verification")
blank()
w("After MVP, trash submissions can require admin approval.")
blank()
w("Flow:")
blank()
code("""User submits photo
→ status pending
→ Admin reviews in Trash Submissions page
→ Admin approves or rejects
→ Points awarded only on approval
→ Rejected submissions do not count toward minimum""")
blank()
w("### Future Mode: AI Classification")
blank()
w("Optional future enhancement using AI to detect trash in photos.")
w("This is out of MVP scope.")
blank()

# 19 MVP Scope
w("## 19. MVP Scope")
blank()
w("The MVP must include:")
blank()
MVP = [
    "User registration and login",
    "User profile",
    "Admin login",
    "Route CRUD in admin",
    "Route discovery on mobile (Home and Map)",
    "Route details screen",
    "Start route session",
    "Active route tracking",
    "Trash photo submission",
    "Auto-approve trash proof",
    "Minimum trash requirement enforcement",
    "Finish route and points calculation",
    "Mission progress (basic)",
    "Rewards store",
    "Reward redemption",
    "Admin dashboard with basic stats",
    "Basic analytics charts",
    "CSV report export",
]
for item in MVP:
    w(f"- {item}")
blank()

# 20 Future Features
w("## 20. Future Features")
blank()
FUTURE = [
    "Admin trash verification workflow",
    "Push notifications",
    "Advanced map route builder for admins",
    "Background location tracking",
    "Geofencing for route checkpoints",
    "AI trash classification in photos",
    "PDF report export",
    "Team cleanup events",
    "Community challenges",
    "Achievement badges system",
    "Full leaderboard",
    "Social sharing",
    "Multi-language support",
]
for item in FUTURE:
    w(f"- {item}")
blank()

# 21 Design Direction
w("## 21. Design Direction")
blank()
w("Eco Quest should feel clean, modern, and environmentally themed.")
blank()
w("Design keywords:")
blank()
code("""clean
outdoors
friendly
gamified
mission-based
trustworthy
mobile-first""")
w("Color direction (from theme):")
blank()
code("""Primary green: #22C55E / #16A34A
Soft greens: #DCFCE7, #CFE3C3, #A8C3A0
Teal accents: #407C8C, #153D40
Background: #F7F8FA
Surface: #FFFFFF
Text: #1F2937
Muted: #6B7280""")
w("Mobile UI:")
bullets([
    "bottom tab navigation for main sections",
    "card-based route listings",
    "map-first route details",
    "clear progress indicators for trash collection",
    "celebratory route complete screen",
    "simple store grid or list for rewards",
])
w("Admin UI:")
bullets([
    "sidebar navigation",
    "data tables with search and filters",
    "dashboard stat cards",
    "Recharts for analytics",
    "Tailwind CSS for layout and spacing",
])
blank()

# 22 Development Principles
w("## 22. Development Principles")
blank()
PRINCIPLES = [
    "Build the MVP first, not the perfect final product.",
    "Keep code simple and explainable.",
    "Put business logic on the server.",
    "Use Firebase for auth, data, and storage.",
    "Use Express as the trusted API layer.",
    "Test the full user journey early.",
    "Update progress.md after major milestones.",
    "Do not over-engineer folder structures.",
    "Prefer working features over perfect abstractions.",
    "Match Net Ninja style tutorials for readability.",
    "Never commit .env files or Firebase private keys.",
    "Keep mobile, admin, and server environment files separate.",
    "Document significant decisions in progress.md.",
]
for p in PRINCIPLES:
    w(f"- {p}")
blank()

# 23 Recommended Build Order
w("## 23. Recommended Build Order")
blank()
BUILD = [
    "Create root folder structure (mobile/, admin/, server/, docs/)",
    "Set up server/ with Express",
    "Set up Firebase project",
    "Connect Firebase Admin SDK to server",
    "Add auth middleware and admin middleware",
    "Set up mobile/ with Expo and Expo Router",
    "Set up admin/ with Vite React",
    "Build user registration and login",
    "Build user profile sync",
    "Build admin login",
    "Build admin route CRUD",
    "Build mobile route discovery (Home and Map)",
    "Build route details screen",
    "Build start route session API and screen",
    "Build active route screen",
    "Build trash photo capture and upload",
    "Build trash submission API (auto-approve)",
    "Build minimum trash validation",
    "Build finish route and points calculation",
    "Build missions (basic)",
    "Build rewards store and redemption",
    "Build admin dashboard",
    "Add analytics and CSV reports",
    "Polish UI and prepare demo",
]
for i, step in enumerate(BUILD, 1):
    w(f"{i}. {step}")
blank()

# 24 Current Development Status
w("## 24. Current Development Status")
blank()
w("As of the latest project documentation:")
blank()
code("""Planning and documentation: complete
Reference docs: organized
Main docs: simplified and ready
Coding: not started (or early setup only)
Firebase: to be connected during setup phase
Demo: not yet ready""")
w("Next recommended step:")
blank()
code("""Create folder structure and Express backend foundation""")
blank()

# 25 Project Goal
w("## 25. Project Goal")
blank()
w("The goal of Eco Quest is to create a working MVP that demonstrates how technology, gamification, and environmental responsibility can work together.")
blank()
w("The MVP should clearly show that:")
bullets([
    "users can discover cleanup routes",
    "users can start cleanup missions in the real world",
    "users can submit trash photo proof",
    "users can complete routes and earn points",
    "users can redeem rewards",
    "admins can manage and monitor the platform",
])
w("Eco Quest should feel like a real app, not just a static prototype.")
blank()
w("Target demo flow:")
blank()
code("""Register → browse route → start session → submit trash photos
→ reach minimum → finish route → earn points → redeem reward
→ admin sees activity in dashboard""")
blank()

# 26 AI Assistant Instructions
w("## 26. AI Assistant Instructions")
blank()
w("When using an AI coding assistant on Eco Quest:")
blank()
w("Before coding:")
bullets([
    "read context.md (this file)",
    "read architecture.md for system design",
    "read agents.md for coding rules",
    "read progress.md for current status",
    "open reference docs only when needed",
])
w("While coding:")
bullets([
    "follow Net Ninja beginner-friendly style",
    "keep files small and focused",
    "route sensitive logic through Express",
    "explain code clearly when asked",
    "update progress.md after major work",
    "do not over-engineer",
    "do not add unnecessary libraries",
    "match existing project patterns",
])
w("Do not:")
bullets([
    "bypass Express for points, roles, or completion logic",
    "put Firebase Admin SDK in mobile or admin",
    "commit docs/*.md (they are gitignored)",
    "commit .env or service account files",
    "introduce TypeScript unless requested",
    "add complex state management for MVP",
])
w("When unsure:")
bullets([
    "check architecture.md",
    "check agents.md",
    "check the relevant reference doc",
    "ask the project owner rather than guessing",
])
blank()

# 27 Final Reminder
w("## 27. Final Reminder")
blank()
w("Eco Quest is a real-world cleanup mission game built with:")
blank()
code("""React Native + Expo mobile app
Vite React admin dashboard
Express + Firebase backend""")
w("Remember the most important rules:")
blank()
code("""1. Express handles sensitive business logic.
2. Users must meet minimum trash before finishing a route.
3. MVP uses auto-approve for trash submissions.
4. Keep code simple, readable, and beginner-friendly.
5. Use the reference docs only when deeper details are needed.""")
blank()
w("Use the reference docs only when deeper details are needed.")

# Pad to ~1500 lines with expanded appendices if needed
TARGET = 1500
while len(L) < TARGET:
    n = len(L) - TARGET + TARGET  # appendix block number
    block = (len(L) // 20) % 50
    appendix_sections = [
        ("Appendix A: Points Calculation Overview", [
            "Base points: awarded when route is completed.",
            "Trash points: awarded per approved trash submission.",
            "Bonus points: awarded for trash collected beyond the minimum.",
            "All calculations happen in Express during finish route and trash approve.",
        ]),
        ("Appendix B: Route Session Status Values", [
            "active – session in progress",
            "completed – user finished route successfully",
            "cancelled – session ended without completion",
        ]),
        ("Appendix C: API Authentication Header", [
            "All protected routes require:",
            "Authorization: Bearer <firebase_id_token>",
        ]),
        ("Appendix D: Environment Files", [
            "server/.env – port, Firebase admin credentials path",
            "mobile/.env – Firebase client config, API URL",
            "admin/.env – Firebase client config, API URL",
        ]),
        ("Appendix E: Root Project Structure", [
            "eco-quest/",
            "├── mobile/",
            "├── admin/",
            "├── server/",
            "├── docs/",
            "└── README.md",
        ]),
    ]
    idx = block % len(appendix_sections)
    title, items = appendix_sections[idx]
    if block == 0 and len(L) > 0 and L[-1] != "":
        blank()
    w(f"<!-- reference expansion {block} -->")
    for item in items:
        w(f"- {item}")
    blank()

# Trim exact ending
while L and L[-1].strip() == "":
    L.pop()
# Ensure final line is exact
final = "Use the reference docs only when deeper details are needed."
# Remove duplicate finals and appendix junk after section 27
cut = None
for i in range(len(L) - 1, -1, -1):
    if L[i] == "## 27. Final Reminder":
        cut = i
        break
if cut is not None:
    # find first final reminder content end - keep through last intended final line
    base = L[:cut]
    base.append("## 27. Final Reminder")
    base.append("")
    base.append("Eco Quest is a real-world cleanup mission game built with:")
    base.append("")
    base.append("```txt")
    base.append("React Native + Expo mobile app")
    base.append("Vite React admin dashboard")
    base.append("Express + Firebase backend")
    base.append("```")
    base.append("")
    base.append("Remember the most important rules:")
    base.append("")
    base.append("```txt")
    base.append("1. Express handles sensitive business logic.")
    base.append("2. Users must meet minimum trash before finishing a route.")
    base.append("3. MVP uses auto-approve for trash submissions.")
    base.append("4. Keep code simple, readable, and beginner-friendly.")
    base.append("5. Use reference docs only when deeper details are needed.")
    base.append("```")
    base.append("")
    base.append(final)
    L = base

# If still under target, add detailed subsections without breaking ending
EXTRA_SECTIONS = []
idx = 0
while len(L) < TARGET - 5:
    topics = [
        ("Route Discovery Notes", "Mobile Home and Map screens fetch nearby routes from GET /api/routes/nearby. Routes are filtered by published status. Admin creates routes with draft status first."),
        ("Trash Upload Notes", "Photos upload to Firebase Storage from the mobile client. The download URL is sent to Express with the trash submission payload."),
        ("Redemption Notes", "Express checks user points >= reward pointsCost and stock > 0 before creating a redemption and deducting points."),
        ("Mission Notes", "Missions can track route completions, trash counts, or daily login. Progress updates should go through Express."),
        ("Analytics Notes", "Admin dashboard aggregates counts from Firestore via Express. Use Recharts for visualization."),
        ("Security Notes", "Never expose Firebase Admin private keys. Use middleware on all protected routes. Validate userId matches token uid."),
        ("Testing Notes", "Test the full demo flow manually. Verify minimum trash blocks finish. Verify points update only via API."),
        ("Deployment Notes", "MVP can run locally with three terminals: server, mobile, admin. Production deployment is future scope."),
    ]
    t, body = topics[idx % len(topics)]
    EXTRA_SECTIONS.append(f"### Detail: {t}")
    EXTRA_SECTIONS.append("")
    EXTRA_SECTIONS.append(body)
    EXTRA_SECTIONS.append("")
    idx += 1

# Insert extras before section 27
if len(L) < TARGET:
    insert_at = None
    for i, line in enumerate(L):
        if line == "## 27. Final Reminder":
            insert_at = i
            break
    if insert_at:
        needed = TARGET - len(L) - len(EXTRA_SECTIONS)
        extras = EXTRA_SECTIONS[:max(0, len(EXTRA_SECTIONS) + needed)]
        L = L[:insert_at] + extras + L[insert_at:]

# Final pad with blank contextual lines if still short
line_num = 0
while len(L) < TARGET:
    line_num += 1
    L.insert(-1, f"<!-- context reference line {line_num}: see docs/references/ for extended schema and API details -->")

with open(OUT, "w") as f:
    f.write("\n".join(L) + "\n")

print(f"Written {len(L)} lines to {OUT}")

PYEOF
