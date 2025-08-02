# Slack Clone

A modern Slack-inspired chat application built with Next.js 15, React, and Tailwind CSS.

## Features

- **Real-time messaging** - Send and receive messages in different channels
- **Channel navigation** - Browse between multiple channels (general, random, dev-team, design, marketing)
- **Responsive design** - Clean, modern UI that works on all devices
- **Server-side rendering** - Fast initial page loads with Next.js App Router
- **Mock data** - Includes sample channels and messages for demonstration
- **Optimistic updates** - Instant UI feedback when sending messages
- **Loading states** - Skeleton components for better UX
- **Prefetch controls** - Runtime toggle for link prefetching

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 18** - UI library with Suspense and modern features
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching (experimental Next.js integration)

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