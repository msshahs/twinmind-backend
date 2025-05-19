# 🧠 TwinMind – Backend API Server

This is the backend for the [TwinMind](https://twinmind-frontend.onrender.com/) AI-powered meeting assistant platform.

> Built as part of a full-stack interview assignment – [See Assignment PDF](./Interview%20Assignment%20v2%20-%20TwinMind%20(1).pdf)

---

## ⚙️ Tech Stack

- **Node.js + Express** – RESTful API server
- **MongoDB + Mongoose** – Meeting and user data storage
- **Firebase Admin SDK** – User verification via Google Sign-In
- **OpenAI API** – Whisper transcription + GPT-based Q&A & summary
- **Multer + ffmpeg** – Audio chunk handling & conversion
- **Google Calendar API** – Event creation support
- **Render** – Deployment platform (backend + frontend)

---

## ✅ Core Functionalities

- 🔐 **Firebase Token Verification**
  - `/api/auth/verify-token` verifies Google tokens
- 📁 **Meeting CRUD APIs**
  - Create, update, fetch, and delete meetings
- 🎙 **Audio Upload + Whisper Transcription**
  - `/api/transcript/upload` accepts 30-sec chunks and transcribes them
- 💬 **AI-Powered Chat**
  - `/api/transcript/chat-with-transcript/stream` streams GPT responses to user queries
- ❓ **Auto-Generated Questions**
  - `/api/meetings/:id/auto-questions` uses transcript to generate top 3 insightful questions
- 🧠 **Smart Meeting Summary**
  - `/api/summary/generate-summary` produces structured summary in topics, actions, and notes
- 📅 **Google Calendar Event Creation**
  - Easily add meeting summary to user’s calendar (handled via frontend)

---

## 🗃 Project Structure

🔜 TODO / Upcoming Features
🧭 Route-level validation and rate limiting

📄 Auto-generate transcripts in PDF format

📤 Email summaries to attendees

🔒 Role-based access for multi-user support

📆 Google Calendar event sync and update/delete
