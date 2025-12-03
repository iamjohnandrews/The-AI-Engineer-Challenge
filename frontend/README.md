# Frontend - AI Mental Coach

A modern Next.js frontend application for the AI Mental Coach chat interface. This application provides a beautiful, responsive chat UI that connects to the FastAPI backend.

## Features

- 🎨 Modern, clean UI with Tailwind CSS
- 💬 Real-time chat interface with message history
- 🌙 Dark mode support (follows system preferences)
- 📱 Fully responsive design
- ⚡ Fast and optimized with Next.js 14
- 🔄 Auto-scrolling chat messages
- ⌨️ Keyboard shortcuts (Enter to send, Shift+Enter for new line)

## Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- The FastAPI backend running on `http://localhost:8000` (or configure `NEXT_PUBLIC_API_URL`)

## Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure the API URL:
   - By default, the frontend connects to `http://localhost:8000`
   - To use a different backend URL, create a `.env.local` file:
     ```bash
     NEXT_PUBLIC_API_URL=http://your-backend-url:8000
     ```

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

The development server includes:
- Hot module replacement (HMR) for instant updates
- Error overlay for debugging
- Fast refresh for React components

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router directory
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles with Tailwind
├── components/            # React components
│   └── ChatInterface.tsx  # Main chat component
├── lib/                   # Utility functions
│   └── api.ts            # API client for backend communication
├── types/                 # TypeScript type definitions
│   └── chat.ts           # Chat-related types
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── next.config.js        # Next.js configuration
```

## Integration with Backend

The frontend communicates with the FastAPI backend through the `/api/chat` endpoint. Make sure:

1. The backend is running on `http://localhost:8000` (or your configured URL)
2. The backend has CORS enabled (already configured in the backend)
3. The `OPENAI_API_KEY` environment variable is set in the backend environment

## Deployment

This frontend is configured to work with Vercel. To deploy:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables if needed (`NEXT_PUBLIC_API_URL`)
4. Deploy!

The application will automatically build and deploy on Vercel.

## Troubleshooting

### Backend Connection Issues

If you see connection errors:
- Verify the backend is running: `curl http://localhost:8000/`
- Check the `NEXT_PUBLIC_API_URL` environment variable
- Ensure CORS is properly configured in the backend

### Build Errors

If you encounter build errors:
- Clear the `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

## Development Tips

- Use the browser's developer tools to inspect network requests
- Check the console for any error messages
- The chat interface auto-scrolls to show the latest messages
- Messages are stored in component state (not persisted to a database)
