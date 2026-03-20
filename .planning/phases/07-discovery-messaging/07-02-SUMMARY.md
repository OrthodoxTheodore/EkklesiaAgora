---
phase: 07-discovery-messaging
plan: "02"
subsystem: messaging
tags: [messaging, firestore, real-time, ui, server-actions]
dependency_graph:
  requires: ["07-01"]
  provides: ["MSG-01", "MSG-02", "MSG-03"]
  affects: ["src/components/nav/Navbar.tsx", "src/app/(main)/profile/[handle]/page.tsx"]
tech_stack:
  added: ["Conversation type", "Message type", "onSnapshot messaging"]
  patterns: ["split-pane layout", "client-side unread filter", "server-action data layer"]
key_files:
  created:
    - src/lib/types/messages.ts
    - src/lib/firestore/messages.ts
    - src/app/actions/messages.ts
    - src/components/nav/MessagesIcon.tsx
    - src/components/messages/ConversationList.tsx
    - src/components/messages/MessageThread.tsx
    - src/components/messages/MessageComposer.tsx
    - src/app/(main)/messages/page.tsx
    - src/app/(main)/messages/MessagesPageClient.tsx
    - src/app/(main)/messages/[conversationId]/page.tsx
    - tests/lib/messages.test.ts
  modified:
    - firestore.rules
    - src/lib/types/social.ts
    - src/components/nav/Navbar.tsx
    - src/components/nav/MobileMenu.tsx
    - src/app/(main)/profile/[handle]/page.tsx
decisions:
  - "Conversations unread count filtered client-side in MessagesIcon (not via Firestore dynamic map path query) — Firestore dynamic map field paths lack standard indexes"
  - "MessagesPageClient inline in /messages/page.tsx directory — keeps split-pane state management co-located with the route"
  - "markConversationRead called on conversationId mount in MessageThread — keeps read tracking automatic without user action"
metrics:
  duration: "672s"
  completed: "2026-03-20"
  tasks_completed: 2
  files_changed: 16
---

# Phase 7 Plan 02: Direct Messaging Summary

**One-liner:** Full DM system with Firestore conversations collection, real-time onSnapshot threads, unread badge on envelope icon, seen receipts, online presence, and profile page initiation.

## What Was Built

### Task 1: Messaging Data Layer

- **`src/lib/types/messages.ts`** — `Conversation` and `Message` TypeScript interfaces with `participantUids`, `participantProfiles`, `unreadCounts`, and `seenBy` fields
- **`src/lib/types/social.ts`** — Added `lastSeen: Timestamp | null` to `UserProfile` for online presence
- **`src/lib/firestore/messages.ts`** — Server-only Firestore helpers: `getConversationId` (alphabetical sort join), `getConversationsForUser`, `getMessages`
- **`src/app/actions/messages.ts`** — Four Server Actions: `createOrGetConversation`, `sendMessage`, `markConversationRead`, `updateLastSeen`
- **`firestore.rules`** — Added conversation rules: participant-only read, Admin-SDK-only write; messages subcollection rules
- **`tests/lib/messages.test.ts`** — 3 unit tests for `getConversationId` (alphabetical sort, determinism, identical uids)

### Task 2: Messaging UI

- **`MessagesIcon`** — Client component with `Mail` lucide icon, `onSnapshot` listener on conversations collection, client-side unread count filter, gold badge with 99+ cap, 44px touch target
- **`ConversationList`** — Conversation rows with avatar, online presence green dot (5-minute threshold), display name, last message preview, relative timestamp, unread gold dot; empty state with guidance text
- **`MessageThread`** — Real-time `onSnapshot` listener on messages subcollection, chronological display, sent/received bubble styling, seen indicator on last sent message, auto-scroll with instant/smooth behavior
- **`MessageComposer`** — Form with text input and Send button, Enter key submit, loading state, fire-and-forget Server Action call
- **`/messages/page.tsx`** — Server Component: auth guard, fetch conversations and lastSeen map, handle `?to=` redirect to create/get conversation, render `MessagesPageClient`
- **`MessagesPageClient`** — Client wrapper: split-pane desktop layout (sidebar + thread), mobile list-only view, `updateLastSeen` on mount and window focus
- **`/messages/[conversationId]/page.tsx`** — Mobile full-page thread: auth guard, participant verification, fetch initial messages, header with back button and other user's name/avatar
- **Navbar integration** — `MessagesIcon` added between SearchBar and NotificationBell
- **MobileMenu integration** — Messages link added after Search, visible only to authenticated users
- **Profile page** — "Send Message" button linking to `/messages?to={uid}`, shown only when viewing another user's profile

## Verification

- `npx jest --testPathPatterns=tests/lib/messages` — 3 tests pass
- `npx next build` — TypeScript compiled successfully; prerender failures are pre-existing (Firebase env vars not available during static generation, unrelated to this plan)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `src/lib/types/messages.ts` exists
- [x] `src/lib/firestore/messages.ts` exists
- [x] `src/app/actions/messages.ts` exists
- [x] `src/components/nav/MessagesIcon.tsx` exists
- [x] `src/components/messages/ConversationList.tsx` exists
- [x] `src/components/messages/MessageThread.tsx` exists
- [x] `src/components/messages/MessageComposer.tsx` exists
- [x] `src/app/(main)/messages/page.tsx` exists
- [x] `src/app/(main)/messages/[conversationId]/page.tsx` exists
- [x] `tests/lib/messages.test.ts` — 3 tests pass
- [x] Commits c3ee21e (Task 1) and 8e55143 (Task 2) exist
