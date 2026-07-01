# SHL Intelligence Console - Frontend

This is a production-quality frontend built for the SHL Conversational Assessment Recommender API.

## Tech Stack
- **React 18 + TypeScript** (Scaffolded with Vite)
- **Vanilla CSS + CSS Modules** (No utility frameworks to maintain total control of visual identity)
- **Zero global state managers** (Redux/Zustand aren't necessary; state belongs cleanly to the conversation custom hook).

## Component Architecture & State Flow

The application is structured into a strict two-zone layout reflecting its B2B utility:

1. **`useChat` (The State Machine):**
   - Located in `src/hooks/useChat.ts`. This custom hook is the brain of the frontend.
   - It maintains the `messages` array, the persistent `shortlist` of recommendations, and boolean flags (`isLoading`, `isEnded`).
   - It enforces the API contract: `recommendations` are only updated when the API yields a non-null shortlist (it persists previous state during Clarify/Refuse turns).
   - It strictly enforces the 8-turn cap locally to prevent useless API calls.

2. **`App.tsx` (The Shell):**
   - Connects to `useChat` and orchestrates the layout.
   - Handles the cold-start/connection status via the top-left `healthBadge` which polls `/health` on mount.
   - Manages the conditional rendering of the `ShortlistPanel` (which only docks when `recommendations` exist).

3. **`ConversationZone.tsx` (The Human Layer):**
   - Responsible for rendering the chat timeline.
   - Handles empty states (a specific "landing moment" instead of a blank screen) and disabled input states during loading.
   - Uses structural skeleton lines (animation pulse) for the loading state to keep the UI calm.

4. **`ShortlistPanel.tsx` (The Intelligence Layer):**
   - A persistent, docked panel displaying the current recommendations.
   - Features a strict monospaced typography (`JetBrains Mono`) to visually contrast the structured metadata (Test Codes, Duration) against the humanist conversational typography (`Inter`).
   - Each card displays a deliberate "Verified" seal linking directly to the real SHL catalog.

## How to run locally
```bash
npm install
npm run dev
```
*(Ensure the FastAPI backend is running on port 8000)*
