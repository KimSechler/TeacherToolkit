# TeacherTools - Educational Web Application

## Overview

TeacherTools is a full-stack web application designed for teachers to manage attendance, create educational games, and access AI-powered assistance. The application features a modern, responsive design with a modular architecture that supports future expansion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

### UI Component System
- **Design System**: shadcn/ui components based on Radix UI
- **Theme**: "new-york" style with neutral color palette
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Icons**: Lucide React icons throughout the application

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect integration
- **Session Storage**: PostgreSQL-backed session store with 1-week TTL
- **User Management**: Automatic user creation/updates on authentication
- **Security**: HTTP-only cookies with secure flags in production

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Comprehensive schema covering users, classes, students, questions, games, and attendance
- **Migrations**: Managed through Drizzle Kit
- **Connection**: Neon serverless connection with WebSocket support

### AI Integration
- **Provider**: OpenAI GPT-4o for text generation
- **Features**: Question generation, game theme creation, image analysis
- **Usage**: Content creation assistance for teachers
- **API**: RESTful endpoints for AI-powered features

### Core Features
1. **Attendance Tracker**: Visual attendance with Question of the Day functionality
2. **Game Creator**: Template-based educational game creation with themes
3. **Question Bank**: Organized question storage and management
4. **Class Management**: Student roster and class organization
5. **Reports**: Analytics and data export capabilities

## Data Flow

### Authentication Flow
1. User accesses protected route
2. Middleware checks session cookie
3. If invalid, redirects to Replit Auth
4. On success, creates/updates user record
5. Establishes authenticated session

### API Request Flow
1. Frontend makes authenticated API request
2. Express middleware validates session
3. Route handler processes request with database operations
4. Response returned with appropriate status codes
5. Frontend updates UI via React Query

### Database Operations
1. All database operations go through Drizzle ORM
2. Schema validation using Zod schemas
3. Type-safe queries with TypeScript
4. Connection pooling via Neon serverless

## External Dependencies

### Required Services
- **Neon Database**: PostgreSQL hosting (configured via DATABASE_URL)
- **OpenAI API**: AI content generation (configured via OPENAI_API_KEY)
- **Replit Auth**: Authentication service (configured via REPL_ID and related env vars)

### Key NPM Packages
- **Frontend**: React, React Query, Wouter, Tailwind CSS, shadcn/ui
- **Backend**: Express, Drizzle ORM, Neon Database client, OpenAI SDK
- **Development**: Vite, TypeScript, PostCSS, Tailwind CSS
- **File Handling**: Multer for file uploads

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server with HMR
- **API Server**: Express server with TypeScript compilation via tsx
- **Database**: Direct connection to Neon database
- **Assets**: Served through Vite with hot reloading

### Production Build
- **Frontend**: Vite build with optimized bundles
- **Backend**: ESBuild compilation to single bundle
- **Static Assets**: Served from dist/public directory
- **Database**: Same Neon connection with production credentials

### Environment Configuration
- **Required Variables**: DATABASE_URL, OPENAI_API_KEY, SESSION_SECRET, REPL_ID
- **Optional Variables**: REPLIT_DOMAINS, ISSUER_URL for auth customization
- **Build Process**: Automated via package.json scripts

### File Structure
- **Client**: React application in `/client` directory
- **Server**: Express API in `/server` directory
- **Shared**: Common types and schemas in `/shared` directory
- **Build Output**: Compiled assets in `/dist` directory

The application is designed to be easily deployable on Replit with minimal configuration, taking advantage of Replit's integrated database and authentication services.