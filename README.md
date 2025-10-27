# Slack Clone

A modern Slack-inspired chat application showcasing **Partial Prerendering (PPR)** with **Cache Components** and real-time message simulation. Built with Next.js 16, React 19, and TanStack Query.

## Features

### Real-time Experience
- **Live message injection** - Messages appear every 5-15 seconds across all channels with realistic users and content
- **Progress indicator** - Visual countdown showing when the next message will arrive
- **Recent messages feed** - Live sidebar showing latest activity across all channels
- **Channel activity indicators** - Green dots show channels with new unread messages
- **Smart channel ordering** - Channels automatically reorder by latest activity

### Modern Architecture
- **Partial Prerendering (PPR)** - Static content loads instantly, dynamic content streams in
- **Cache Components** - Server Components with `"use cache"` for optimal performance
- **Hybrid data architecture** - Server Components seed data, TanStack Query manages client state
- **Suspense boundaries** - Granular loading states with skeleton components
- **Real-time state management** - Global message injection works across navigation

### User Experience  
- **Optimistic updates** - Instant UI feedback when sending messages
- **Responsive design** - Clean, modern UI that works on all devices
- **Smart loading states** - Progressive enhancement with proper glimmers
- **Instant feedback** - Unread indicators dismiss immediately on click

## Tech Stack

- **Next.js 16** - React framework with PPR and Cache Components
- **React 19** - UI library with enhanced Suspense and concurrent features
- **TanStack Query** - Powerful data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd slack-clone
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
app/
├── api/                 # API routes
│   ├── channels/        # Channel-related endpoints
│   └── messages/        # Message-related endpoints
├── channel/             # Channel pages and layout
│   ├── [channelId]/     # Dynamic channel routes
│   └── layout.js        # Shared layout with sidebar
├── components.js        # React components
├── lib.js              # Client-side utilities and mock data
├── server-lib.js       # Server-side utilities and data
├── providers.js        # React Query provider setup
└── globals.css         # Global styles
```

## Available Channels

The app includes 5 pre-configured channels:
- `#general` (Public) - Welcome and general discussions
- `#random` (Public) - Random conversations
- `🔒 dev-team` (Private) - Development team discussions
- `#design` (Public) - Design-related topics
- `🔒 marketing` (Private) - Marketing team discussions

## Development

- The app uses mock data for demonstration purposes
- Messages are stored in memory and reset on server restart
- All channels and initial messages are defined in `server-lib.js`
- Client-side state management uses React Query for caching

## Performance Features

- **Suspense boundaries** - Granular loading states
- **Code splitting** - Automatic route-based splitting
- **Image optimization** - Next.js built-in image optimization
- **Font optimization** - Automatic font loading with `next/font`
- **Prefetching controls** - Runtime toggle for link prefetching

## License

This project is open source and available under the [MIT License](LICENSE).