# replit.md

## Overview

InsightBoard is a privacy-first data analytics and visualization platform that allows users to import datasets (CSV, JSON, TSV) and create interactive dashboards while maintaining complete data sovereignty. Built with a modern full-stack architecture using React, Express.js, and TypeScript, the application emphasizes minimal authentication requirements - users only need a username and password, with a one-time recovery key for password resets. The platform focuses on keeping user data encrypted, private, and fully under user control, distinguishing itself from cloud-based analytics platforms that monetize user data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built as a single-page application using React 18 with TypeScript, utilizing Vite as the build tool and development server. The UI is constructed with shadcn/ui components built on Radix UI primitives and styled with Tailwind CSS using a CSS variables-based theming system supporting light and dark modes. State management is handled through TanStack Query for server state and React Context for client state like authentication and theming. The application uses Wouter for client-side routing with protected routes that redirect unauthenticated users to the auth page.

### Backend Architecture
The server is implemented using Express.js with TypeScript, following a RESTful API design pattern. Authentication is handled through Passport.js with local strategy, using session-based authentication with secure password hashing via Node.js crypto scrypt function. The server includes middleware for request logging, JSON parsing, and error handling. File uploads are processed using Multer with memory storage, supporting CSV, TSV, and JSON formats with automatic parsing via PapaParse library.

### Data Storage Solutions
The application uses a dual-storage approach depending on deployment environment. In development and simple deployments, it utilizes an in-memory storage system with Map-based data structures for users, datasets, and dashboards. For production deployments, it's configured to use PostgreSQL with Drizzle ORM for database operations and schema management. The database schema includes users table with username/password/recovery key, datasets table storing parsed data as JSON with metadata, and dashboards table containing layout configurations and widget definitions.

### Authentication and Authorization
The authentication system implements MinimalAuth principles, requiring only username and password for registration without email or phone verification. Password security is ensured through scrypt-based hashing with random salt generation. Each user receives a cryptographically secure recovery key during registration for password resets. Session management uses express-session with configurable storage backends (memory store for development, PostgreSQL session store for production). The system includes user session serialization/deserialization and route-level authentication guards.

## External Dependencies

### Database and ORM
- **PostgreSQL**: Primary database for production deployments, configured through Neon Database serverless connection
- **Drizzle ORM**: Type-safe database toolkit for schema definition and query building
- **connect-pg-simple**: PostgreSQL session store adapter for express-session

### File Processing and Parsing
- **Multer**: Middleware for handling multipart/form-data file uploads with memory storage
- **PapaParse**: CSV/TSV parsing library with automatic type detection and error handling
- **react-dropzone**: File drag-and-drop interface for the frontend upload experience

### UI Framework and Styling  
- **Radix UI**: Headless component library providing accessible primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom design system integration
- **shadcn/ui**: Pre-built component library combining Radix UI with Tailwind styling
- **Lucide React**: Icon library providing consistent iconography throughout the application

### Data Visualization and Charts
- **Recharts**: Composable charting library built on React and D3 for dashboard widgets
- **jsPDF**: Client-side PDF generation for dashboard exports
- **html2canvas**: HTML to canvas conversion for screenshot-based exports

### Development and Build Tools
- **Vite**: Fast build tool and development server with TypeScript support
- **Replit Integration**: Development environment plugins for cartographer and dev banner
- **ESBuild**: JavaScript bundler for production server builds