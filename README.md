# LiveChat — Real-time Messaging App

A production-ready real-time chat application built as part of the **Tars Full Stack Engineer Internship Challenge 2026**.

Built by **Rushil Gosain** — Final Year B.Tech CSE, GGSIPU Delhi.

---

## Video Walkthrough

> Click the badge below to watch the full project explanation on Loom

[![LiveChat Video Walkthrough](https://img.shields.io/badge/Watch%20on%20Loom-Click%20Here-brightgreen?style=for-the-badge&logo=loom)](https://www.loom.com/share/c5e3dbf869074a08ade24f63fd0d3725)

In the video I cover:
- A brief introduction about myself
- Live demo of the app (real-time messaging between two accounts)
- Code walkthrough of `convex/messages.ts` and `ChatWindow.tsx`
- A live code change reflected instantly in the browser

---

## Live Demo

[![Vercel](https://img.shields.io/badge/Live%20App-Vercel-black?style=for-the-badge&logo=vercel)](https://livechat-app-nine.vercel.app
)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Backend & Database | Convex |
| Authentication | Clerk |
| Styling | Tailwind CSS + ShadcnUI |
| Deployment | Vercel |

---

## Features

### Core (Required)
- **Authentication** — Sign up and log in via email or social login using Clerk. User profiles are stored in Convex and discoverable by other users.
- **User Search** — Browse all registered users with a live search bar that filters by name as you type. Clicking a user opens or creates a conversation instantly.
- **Direct Messages** — Private one-on-one conversations with real-time message delivery powered by Convex subscriptions.
- **Group Chats** — Create group conversations by selecting multiple members and giving the group a name.
- **Smart Timestamps** — Today's messages show time only (2:34 PM), older messages show date and time (Feb 15, 2:34 PM), and messages from a different year include the year.
- **Empty States** — Helpful messages when there are no conversations, no messages, or no search results. No blank screens.
- **Responsive Layout** — Desktop shows sidebar and chat side by side. Mobile shows the conversation list by default, tapping a conversation opens full-screen chat with a back button.

### Bonus (Optional — Implemented)
- **Online / Offline Status** — Green indicator next to users who currently have the app open. Updates in real time.
- **Typing Indicator** — Shows "Alex is typing..." with animated dots. Disappears after 2 seconds of inactivity or when the message is sent.
- **Unread Message Count** — Badge on each conversation showing unread count. Clears when the conversation is opened.
- **Auto Scroll + New Messages Button** — Automatically scrolls to the latest message. If the user has scrolled up, shows a "New messages" button instead of force scrolling.
- **Soft Delete** — Users can delete their own messages. Shows "This message was deleted" in italics. Record is kept in Convex, not removed.
- **Emoji Reactions** — React to any message with 👍 ❤️ 😂 😮 😢. Clicking the same reaction again removes it. Counts shown below each message.
- **Skeleton Loaders** — Skeleton placeholders while data is loading.
- **Dark / Light Mode** — Full theme support with a toggle in the sidebar.

---

## Project Structure

```
app/
  layout.tsx                        # Root layout with providers
  page.tsx                          # Redirects to /chat or /sign-in
  globals.css                       # Global styles and CSS variables
  sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in page
  sign-up/[[...sign-up]]/page.tsx   # Clerk sign-up page
  chat/page.tsx                     # Main chat shell (responsive layout)

components/chat/
  Sidebar.tsx                       # Conversation list, search, user info
  ChatWindow.tsx                    # Message list, input, reactions, typing
  WelcomeScreen.tsx                 # Empty state when no conversation selected

convex/
  schema.ts                         # Database schema
  users.ts                          # User queries and mutations
  conversations.ts                  # DM and group conversation logic
  messages.ts                       # Send, delete, react to messages
  typing.ts                         # Typing indicator logic
  readReceipts.ts                   # Unread count tracking
  auth.config.ts                    # Clerk JWT configuration

providers/
  ConvexClientProvider.tsx          # Convex + Clerk + Theme providers
  ThemeProvider.tsx                 # next-themes wrapper

lib/
  utils.ts                          # cn() utility
  formatTime.ts                     # Smart timestamp formatting

middleware.ts                       # Clerk auth middleware
tailwind.config.ts                  # Tailwind configuration
```

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/RushilGosain/livechat-app.git
cd livechat-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Clerk

1. Create an app at [clerk.com](https://clerk.com)
2. Go to **JWT Templates** and create a new template named `convex`
3. Make sure the template includes `"aud": "convex"` in the claims
4. Copy your publishable key and secret key

### 4. Set up Convex

```bash
npx convex dev
```

In the Convex dashboard, add this environment variable:
```
CLERK_JWT_ISSUER_DOMAIN = https://your-clerk-issuer.clerk.accounts.dev
```

### 5. Create `.env.local`

```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat
```

### 6. Run the app

```bash
# Terminal 1
npx convex dev

# Terminal 2
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## About Me

I'm Rushil Gosain, a final year B.Tech Computer Science student at GGSIPU, Delhi, graduating in 2026.

Most of what I know I've learned by building things. Before this I built an Expert Booking Platform (live MERN stack app on Netlify) and NeuroTrack, an AI-powered mental health platform using Python, Flask, and the OpenAI API. I also completed a React + TypeScript portfolio with a working AI chat assistant as part of a company internship assignment.

Outside of coding I love hanging out with friends and playing football.

- **Email:** rushilgosain10@gmail.com
- **GitHub:** [github.com/RushilGosain](https://github.com/RushilGosain)
- **Phone:** +91 8860816875

---

## Acknowledgements

- [Convex](https://convex.dev) for making real-time so simple
- [Clerk](https://clerk.com) for seamless authentication
- [ShadcnUI](https://ui.shadcn.com) for the component library
- [Vercel](https://vercel.com) for free hosting
