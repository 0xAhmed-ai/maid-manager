# MaidManager

## Overview

MaidManager is a multilingual maid management mobile-first web application with role-based access control. The app enables household owners to create and assign tasks to maids, while maids can view and complete their assigned tasks. Key features include real-time task tracking, multi-language support with RTL layout for Arabic/Urdu, push notifications, and an iOS-style design system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: React Context API (AppContext) for global state including user, tasks, maids, notifications, language, and dark mode
- **Data Fetching**: TanStack React Query for server state management with custom query functions
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with iOS-style design tokens (System Blue, Green, Orange colors)
- **Internationalization**: Custom i18n implementation supporting 8 languages with RTL support for Arabic and Urdu

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **HTTP Server**: Node.js http module with Express middleware
- **Session Management**: express-session with MemoryStore for development
- **API Design**: RESTful endpoints under `/api/` prefix for auth, tasks, users, and notifications
- **Build Process**: Custom build script using esbuild for server bundling and Vite for client

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains table definitions for users, tasks, and notifications
- **Development Storage**: In-memory storage implementation (`MemStorage` class) with seeded demo data
- **Database Migrations**: Drizzle Kit for schema migrations stored in `/migrations`

### Authentication & Authorization
- **Session-based Auth**: Express sessions with configurable cookie settings
- **Role-based Access Control**: Two roles - "owner" and "maid" with different dashboard views and permissions
- **Password Storage**: Currently plain text (should be hashed in production)
- **Protected Routes**: Client-side route protection with redirect to login

### Project Structure
```
├── client/          # React frontend application
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── contexts/     # React Context providers
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities, i18n, query client
│       └── pages/        # Route page components
├── server/          # Express backend
│   ├── index.ts     # Server entry point
│   ├── routes.ts    # API route definitions
│   ├── storage.ts   # Data storage interface
│   └── vite.ts      # Vite dev server integration
├── shared/          # Shared code between client/server
│   └── schema.ts    # Drizzle schema and Zod validators
└── migrations/      # Database migrations
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Database abstraction and query building

### UI Framework
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-built component library using Radix and Tailwind
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Frontend build tool with HMR support
- **esbuild**: Fast server bundling for production
- **TypeScript**: Type safety across the stack

### Session Storage
- **memorystore**: In-memory session storage for development
- **connect-pg-simple**: PostgreSQL session store (available for production)

### Utilities
- **date-fns**: Date formatting and manipulation
- **Zod**: Schema validation for API requests
- **drizzle-zod**: Generate Zod schemas from Drizzle tables