# ResuScan AI — Decision Log

> Concise record of all architectural, UX, and infrastructure decisions made during development and optimization.

---

## 1. Dual-Stack IPv6 (`::`) Network Binding in Vite
- **Decision:** Configured `server: { host: '::', port: 5173, strictPort: true }` with `Cache-Control: no-store` in `vite.config.js`.
- **Why:** On modern Windows systems with IPv6 loopback (`::1`), Chromium browsers (such as Brave) resolve `localhost` to `::1`. Binding only to IPv4 `0.0.0.0` caused connection refusals and blank screens when users accessed `localhost:5173`. Binding to `::` enables dual-stack support, responding immediately to `localhost`, `127.0.0.1`, and `[::1]`.

---

## 2. Gemini API Integration with Automatic Fallback
- **Decision:** Added Google Gemini REST client (`_call_gemini`) utilizing the user-configured `GEMINI_API_KEY` from environment variables targeting `gemini-1.5-flash` and `gemini-2.0-flash`.
- **Why:** To support Google Gemini while preventing outages when the specific key faces quota limits or project suspension (HTTP 403), requests automatically fall back to Groq (`qwen/qwen3.8-27b`, `openai/gpt-oss-20b`) and local heuristic processing.

---

## 3. Sliding-Window Rate Limiting Middleware
- **Decision:** Implemented an in-memory sliding-window rate limiter in FastAPI (`backend/main.py`) capping AI-heavy endpoints (`/scan`, `/improve-resume`) to 15 req/min per IP and other endpoints to 40 req/min per IP.
- **Why:** Prevents rogue loops, script spams, and rapid token exhaustion, returning standard HTTP 429 with `Retry-After` headers and structured error JSON.

---

## 4. Universal Cookie Support & Preference Persistence
- **Decision:**
  - Backend: Middleware automatically sets a persistent `resuscan_session_id` cookie on incoming sessions.
  - Frontend: Built `cookieUtils.js` (`getCookie`, `setCookie`, `deleteCookie`) to synchronize user theme preference (`resuscan_theme`) and consent states (`resuscan_cookie_consent`) across browser sessions.
- **Why:** Complies with modern cookie transparency guidelines and guarantees user preferences persist even if `localStorage` is cleared or sandboxed.

---

## 5. Custom Error Entries & Dedicated Error Pages
- **Decision:**
  - Frontend: Created `ErrorPage.jsx` with status code badges, SVG illustrations, "Try Again", "Clear Cache & Reload", and expandable diagnostic technical logs.
  - React ErrorBoundary: Upgraded `ErrorBoundary.jsx` to catch component crashes and display the custom error view instead of unhandled blank screens.
  - 404 Routing: Added fallback in `App.jsx` for missing routes/tabs.
  - Backend: Added custom FastAPI exception handlers for `StarletteHTTPException`, `RequestValidationError` (422), and unhandled server errors (500).
- **Why:** Ensures users always receive clear recovery actions and never encounter raw white screens or unformatted browser error dumps.

---

## 6. Groq Model Priority Changed
- **Decision:** Changed `MODEL_PRIORITY` to `["qwen/qwen3.8-27b", "openai/gpt-oss-20b", "openai/gpt-oss-120b"]`.
- **Why:** `openai/gpt-oss-120b` was previously first but occasionally produced zero-length `content` (returning text inside `reasoning` token payloads). `qwen/qwen3.8-27b` is deployed on Groq and consistently yields rich JSON/text in standard message `content`. Prioritizing it ensures instant, reliable responses without wasting retry roundtrips.

---

## 7. Empty Content Resilience in Groq Calling
- **Decision:** Updated `_call_groq` to retrieve `msg.get("content") or ""` and explicitly treat empty responses as failures that fall through to the next model.
- **Why:** Some reasoning-specialized LLMs return empty strings in `content`. Previously, this returned an empty response to the caller, failing silently. Now, empty content immediately triggers fallback to the next candidate model.

---

## 8. Removal of UI Gradients and AI Slop
- **Decision:** Removed aggressive multi-color gradient heroes (`bg-gradient-to-br from-primary-600 via-primary-500 to-violet-500`), blur circles, and icon gradient backgrounds in favor of solid, clean indigo styling (`bg-indigo-600`) and structured slate backgrounds.
- **Why:** The user specifically requested removing tacky AI slop and distracting gradients. Flat, high-contrast, clean UI gives the platform an executive, professional SaaS look and feel.

---

## 9. Pruning Dead Multi-Candidate Code in Scanner
- **Decision:** Removed the `rankedResults`, `selectedCandidate`, and `mode` states from `ScanSession.jsx`.
- **Why:** The backend `/scan` API processes single resume documents at a time. The multi-candidate ranking UI was unreachable dead code that cluttered the bundle and confused state management.

---

## 10. Normalized CSS Tokens to Standard Tailwind
- **Decision:** Replaced arbitrary CSS variables (`var(--primary)`, `var(--text-muted)`, `var(--secondary)`) across `JobMatching.jsx` and other pages with standard Tailwind classes (`text-indigo-600`, `text-slate-500`, `bg-indigo-50`, `border-slate-200`).
- **Why:** Custom CSS variables caused theme mismatches and broken styling across light/dark transitions. Tailwind classes ensure predictable rendering and maintainability.

---

## 11. Dynamic API Base for Universal Deployability
- **Decision:** Standardized on `API_BASE` in `frontend/src/config.js` reading `import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'`.
- **Why:** When deployed to production (e.g. Vercel, Railway, Render), setting `VITE_API_BASE` allows the frontend to communicate with the remote backend without needing hardcoded hostnames.

---

## 12. Integrated Interview Preparation with Real AI and Quizzes
- **Decision:** Replaced static placeholders in `InterviewPrep.jsx` with an end-to-end question bank generator and interactive mock test system using Groq/local fallback.
- **Why:** Users preparing for interviews need real questions tailored to technical domains (DSA, System Design, Frontend, Backend) and HR/Behavioral questions, complete with timed MCQ mock tests and answer explanations.

---

## 13. Non-Blocking Supabase Profile Fetching
- **Decision:** Added a 1.2s timeout race condition to `UserContext.jsx` profile retrieval and guarded `profile.full_name` checks across `Sidebar` and `DashboardHub`.
- **Why:** When Supabase endpoints are unreachable (`ERR_NAME_NOT_RESOLVED`), requests previously blocked component state. The timeout guarantees instantaneous fallback to cached profiles without halting render cycles.

---

## 14. Elimination of Framer Motion Opacity Lag & White-Screen Triggers
- **Decision:** Removed `AnimatePresence mode="wait"` and nested `motion.div initial={{ opacity: 0 }}` wrappers from `App.jsx`, `InterviewPrep.jsx`, `JobMatching.jsx`, `DraftsHub.jsx`, `ProfileBuilder.jsx`, and legal pages.
- **Why:** In modern Chromium and Brave browsers, `AnimatePresence mode="wait"` and `initial={{ opacity: 0 }}` can drop animation frames during route transitions or reduced motion states, freezing content at 0 opacity (blank white screen). Direct React DOM rendering makes page switching 100% instantaneous, deterministic, and rock-solid.

---

## 15. Removal of Unreferenced Dead Files
- **Decision:** Permanently deleted `CandidateCard.jsx`, `DetailedReport.jsx`, and empty `App.css`.
- **Why:** These files were legacy artifacts from multi-candidate bulk ranking and unused stylesheets. Removing them declutters the source tree, reduces build overhead, and guarantees only active, functional code is maintained.

---

## 16. Comprehensive AI Endpoint Rate Limiting
- **Decision:** Added `/interview-questions`, `/mock-test`, and `/job-suggestions` to the strict `AI_MAX_REQUESTS_PER_MINUTE = 15` rule in `backend/main.py`.
- **Why:** Extends automated sliding-window rate limiting and quota protection to all AI-driven endpoints, shielding the Gemini and Groq API keys against token exhaustion from rapid clicks or loops.

---

## 17. Backend Cloud Deployment Fixes & Universal Root Entrypoints
- **Decision:**
  - Fixed `ModuleNotFoundError: No module named 'routers'` by dynamically injecting the backend directory into `sys.path` in `backend/main.py` and creating a root `main.py` proxy.
  - Provided universal root deployment definitions: root `Dockerfile`, `Procfile`, `render.yaml`, `railway.json`, `runtime.txt`, and `requirements.txt`.
  - Upgraded frontend `config.js` to dynamically detect deployment environments and support custom `resuscan_api_base` overrides without requiring frontend rebuilds.
- **Why:** Most cloud hosting providers (Render, Railway, Heroku, Koyeb, Docker) build from the repository root rather than subdirectories. Without root entrypoints and `sys.path` injection, deployed containers crash immediately on launch with module import errors. These additions make the backend universally deployable to any cloud platform with zero manual configuration.
