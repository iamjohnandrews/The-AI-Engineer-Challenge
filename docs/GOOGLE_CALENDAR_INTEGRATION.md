# Google Calendar Integration Plan

This document outlines the steps to connect the AI Mental Coach app with Google Calendar, enabling features like scheduling coaching sessions, setting reminders, and tracking mental wellness activities.

---

## Overview

**Goal:** Allow users to:
- Schedule coaching sessions directly from the chat
- Set reminders for mental wellness activities
- View upcoming events related to their coaching journey
- Have the AI coach reference their schedule for context-aware responses

---

## Phase 1: Google Cloud Setup

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "AI-Mental-Coach")
3. Note the **Project ID** for later use

### 1.2 Enable Google Calendar API

1. Navigate to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click **Enable**

### 1.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type (or Internal if using Google Workspace)
3. Fill in required fields:
   - App name: "AI Mental Coach"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/calendar.readonly` (read events)
   - `https://www.googleapis.com/auth/calendar.events` (create/edit events)
5. Add test users (your email) while in development

### 1.4 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-vercel-url.vercel.app/api/auth/callback/google`
5. Save the **Client ID** and **Client Secret**

---

## Phase 2: Authentication Setup

### 2.1 Install Dependencies

```bash
cd frontend
npm install next-auth @auth/core googleapis
```

### 2.2 Environment Variables

Add to `frontend/.env.local` (local) and Vercel dashboard (production):

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret-here
```

Generate `NEXTAUTH_SECRET` with:
```bash
openssl rand -base64 32
```

### 2.3 NextAuth.js Configuration

Create `frontend/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token and refresh_token
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      // Send access token to client for API calls
      session.accessToken = token.accessToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
```

---

## Phase 3: Google Calendar API Integration

### 3.1 Create Calendar Service

Create `frontend/lib/google-calendar.ts`:

```typescript
import { google } from 'googleapis';

export function getCalendarClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function listUpcomingEvents(accessToken: string, maxResults = 10) {
  const calendar = getCalendarClient(accessToken);
  
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });
  
  return response.data.items || [];
}

export async function createEvent(
  accessToken: string,
  summary: string,
  description: string,
  startTime: Date,
  endTime: Date
) {
  const calendar = getCalendarClient(accessToken);
  
  const event = {
    summary,
    description,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 60 },
      ],
    },
  };
  
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });
  
  return response.data;
}
```

### 3.2 Create Calendar API Routes

Create `frontend/app/api/calendar/events/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { listUpcomingEvents, createEvent } from '../../../../lib/google-calendar';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  try {
    const events = await listUpcomingEvents(session.accessToken as string);
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { summary, description, startTime, endTime } = body;
    
    const event = await createEvent(
      session.accessToken as string,
      summary,
      description,
      new Date(startTime),
      new Date(endTime)
    );
    
    return NextResponse.json({ event });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
```

---

## Phase 4: UI Integration

### 4.1 Add Sign-In Button

Update `frontend/components/ChatInterface.tsx` to include Google sign-in:

```typescript
import { useSession, signIn, signOut } from 'next-auth/react';

// Inside component:
const { data: session } = useSession();

// In JSX:
{session ? (
  <button onClick={() => signOut()}>
    Connected as {session.user?.email}
  </button>
) : (
  <button onClick={() => signIn('google')}>
    Connect Google Calendar
  </button>
)}
```

### 4.2 Wrap App with SessionProvider

Update `frontend/app/layout.tsx`:

```typescript
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## Phase 5: AI Integration

### 5.1 Enhance Chat with Calendar Context

Modify the chat API to include calendar context:

```typescript
// In /api/chat/route.ts
// Fetch user's upcoming events and include in system prompt

const systemPrompt = `You are a supportive mental coach. 
${calendarContext ? `The user has these upcoming events: ${calendarContext}` : ''}
When the user wants to schedule something, extract the event details and respond with a JSON block like:
\`\`\`json
{"action": "create_event", "summary": "...", "date": "...", "time": "..."}
\`\`\`
`;
```

### 5.2 Parse AI Responses for Calendar Actions

```typescript
function parseCalendarAction(response: string) {
  const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      return null;
    }
  }
  return null;
}
```

---

## Phase 6: Security Considerations

### 6.1 Token Storage
- Access tokens are stored in the session JWT
- Refresh tokens should be stored securely (consider encrypted database)
- Never expose tokens to the client-side

### 6.2 Scope Limitation
- Request only necessary scopes
- Use `calendar.events` only if creating events is needed
- Consider `calendar.readonly` for view-only access

### 6.3 User Consent
- Clearly explain why calendar access is needed
- Allow users to disconnect at any time
- Handle revoked permissions gracefully

---

## Implementation Checklist

- [ ] **Phase 1:** Google Cloud Setup
  - [ ] Create Google Cloud project
  - [ ] Enable Calendar API
  - [ ] Configure OAuth consent screen
  - [ ] Create OAuth credentials

- [ ] **Phase 2:** Authentication
  - [ ] Install NextAuth.js
  - [ ] Configure environment variables
  - [ ] Set up Google provider
  - [ ] Test login flow locally

- [ ] **Phase 3:** Calendar API
  - [ ] Create calendar service library
  - [ ] Implement list events endpoint
  - [ ] Implement create event endpoint
  - [ ] Test API routes

- [ ] **Phase 4:** UI Integration
  - [ ] Add sign-in/sign-out buttons
  - [ ] Display calendar connection status
  - [ ] Show upcoming events in UI

- [ ] **Phase 5:** AI Integration
  - [ ] Include calendar context in prompts
  - [ ] Parse AI responses for calendar actions
  - [ ] Auto-create events from chat

- [ ] **Phase 6:** Production Deployment
  - [ ] Add production redirect URI to Google Console
  - [ ] Set environment variables in Vercel
  - [ ] Submit OAuth consent for verification (if public)

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1 | 1-2 hours | Google account |
| Phase 2 | 2-3 hours | Phase 1 |
| Phase 3 | 3-4 hours | Phase 2 |
| Phase 4 | 2-3 hours | Phase 3 |
| Phase 5 | 4-6 hours | Phase 4 |
| Phase 6 | 1-2 hours | All phases |

**Total: 13-20 hours**

---

## Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)
