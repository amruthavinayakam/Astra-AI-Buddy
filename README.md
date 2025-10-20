<<<<<<< HEAD
# Astra-AI-Buddy
=======
# Astra – Gamified AI Buddy

A full-stack app where Astra monitors habits, plans quests with Gemini, updates XP/levels, and chats via Firebase.

## Tech
- React 18 + Vite + Tailwind + Framer Motion + Lottie
- Firebase (Auth, Firestore, Cloud Functions, FCM, Hosting)
- Gemini 2.0 Flash via `google-generativeai`

## Setup
1. Copy `.env.example` to `.env` and fill Vite Firebase vars.
2. Install frontend deps:
```bash
npm i
npm run dev
```
3. Messaging: ensure `public/firebase-messaging-sw.js` is deployed and app asks for notification permission.

## Firebase Backend
- Deploy Python HTTP function `agent_loop` on Cloud Run/Functions Framework.
- Set env vars: `GEMINI_API_KEY`, optionally `GEMINI_MODEL`.
- Scheduler: trigger `agent_loop` every 3 hours via HTTP.

## Collections
- `users/{uid}`: { displayName, xp, level, streak, mood, lastActive }
- `habits`: { userId, text, doneToday, createdAt }
- `messages`: { userId, sender: 'user'|'astra', text, timestamp }
- `quests`: { userId, text, status, createdAt }
- `users/{uid}/memory_short/*` and `users/{uid}/memory_long/summary`

## Dev Notes
- Replace placeholder Lottie in `Astra.jsx`.
- Subscribe client to topic `/topics/{uid}` for FCM if using.
- Optional: add Redis for long-term memory.

>>>>>>> a1cd727 (feat: scaffold Astra app, Firebase, agent function)
