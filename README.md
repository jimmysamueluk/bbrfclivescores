# Bannockburn RFC Live Scores - Next.js 15

Modern rugby live scores application built with Next.js 15, showcasing modern web development patterns.

## 🚀 Features

- **Next.js 15** with App Router
- **Real-time updates** via Socket.IO
- **Modern UI** with Tailwind CSS & Framer Motion animations
- **Type-safe** with TypeScript
- **State management** with Zustand
- **Server & client caching** with React Query
- **Responsive design** - mobile-first approach
- **Burgundy & Gold** Bannockburn RFC branding

## 🛠️ Tech Stack

- **Framework:** Next.js 15
- **UI:** Tailwind CSS + Custom Components
- **Animations:** Framer Motion
- **State:** Zustand
- **Data Fetching:** React Query
- **Real-time:** Socket.IO Client
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will run on http://localhost:3002

## 🔗 Backend Connection

This app connects to the existing Express backend:
- API: http://localhost:3001/api
- Socket.IO: http://localhost:3001

Make sure the backend is running before starting this app.

## 🎨 Modern Features Showcase

### 1. Gradient Branding
- Burgundy (#800020) to Gold (#B8860B) gradients
- Modern card designs with hover effects
- Smooth transitions

### 2. Real-time Updates
- Socket.IO integration for live score updates
- Automatic score animations on change
- Pulsing "LIVE" badge

### 3. Responsive Design
- Mobile-first approach
- Touch-friendly buttons (48px+ height)
- Responsive grid layouts

### 4. Performance
- Server Components where possible
- React Query caching
- Optimized re-renders
- Code splitting

## 📱 Demo Accounts

- **Coach:** `coach@bannockburnrugby.co.uk` / `coach123`
- **Player:** `jamie.smith@example.com` / `player123`

## 🎯 Key Differences from React Version

| Feature | React App | Next.js App |
|---------|-----------|-------------|
| Framework | React 18 + React Router | Next.js 15 App Router |
| UI Library | Material-UI | Tailwind CSS + Custom |
| State | Context API | Zustand + React Query |
| Styling | CSS-in-JS | Tailwind Utility Classes |
| Animations | None | Framer Motion |
| Bundle Size | Larger | Smaller |
| Performance | Good | Excellent |
| SEO | Limited | Built-in |

## 📂 Project Structure

```
rugby-app-nextjs/
├── app/                    # Next.js App Router
│   ├── auth/login/         # Login page
│   ├── protected/          # Protected routes
│   │   └── live-scores/    # Main live scores page
│   ├── layout.tsx          # Root layout
│   └── providers.tsx       # React Query provider
├── components/
│   ├── ui/                 # Reusable UI components
│   └── live-scores/        # Live scores components
├── lib/
│   ├── api/                # API clients
│   ├── stores/             # Zustand stores
│   ├── socket/             # Socket.IO client
│   └── utils.ts            # Utilities
└── types/                  # TypeScript types
```

## 🚧 Future Enhancements

Phase 2 features (not yet implemented):
- Match management page for coaches
- Photo/video upload system
- Live commentary
- PWA features (offline mode, push notifications)
- Gesture controls (swipe, pull-to-refresh)
- Haptic feedback

## 🔥 Running Both Apps

**React App (port 3000):**
```bash
cd rugby-app/frontend
npm run dev
```

**Next.js App (port 3002):**
```bash
cd rugby-app-nextjs
npm run dev
```

**Backend (port 3001):**
```bash
cd rugby-app/backend
npm run dev
```

Then visit:
- React version: http://localhost:3000
- Next.js version: http://localhost:3002
- Compare and choose!

## 📝 Notes

This is an MVP showcasing modern Next.js patterns. It demonstrates:
- Clean architecture
- Modern UI/UX design
- Real-time functionality
- Type safety
- Performance optimizations

Built in ~3 hours to showcase Next.js 15 capabilities vs the React version.
