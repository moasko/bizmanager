# devSongue suite - Modernized Version

This is a modernized version of the multi-company management suite, upgraded with Next.js, Prisma, PostgreSQL, and React Query while preserving the original UI and functionality.

## Features

- **Multi-company Management**: Manage multiple businesses from a single interface
- **Comprehensive Modules**: Clients, Employees, Products, Suppliers, Sales, Expenses, Reports, and Settings
- **Admin Panel**: Administrative tasks and overview
- **Role-based Access**: Admin and Manager roles with appropriate permissions
- **Real-time Dashboard**: Financial overview with charts and statistics

## Technology Stack

- **Frontend**: Next.js 16 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query for server state management
- **Database**: Prisma ORM with SQLite (can be configured for PostgreSQL)
- **Authentication**: Custom JWT-based authentication
- **Charts**: Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd nextjs-version
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database (using SQLite for local development)
DATABASE_URL="file:./dev.db"

# Authentication
AUTH_SECRET="your-super-secret-auth-key-change-this-in-production"

# Gemini API (if needed)
GEMINI_API_KEY="your-gemini-api-key"
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
├── actions/             # Server actions
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and libraries
├── types.ts             # TypeScript types
└── constants.ts         # Application constants
```

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run start` - Starts the production server
- `npm run seed` - Seeds the database with initial data

## Key Improvements

1. **Modern Framework**: Migrated from Vite to Next.js for better performance and SEO
2. **Database Integration**: Replaced in-memory data with Prisma ORM and SQLite/PostgreSQL
3. **Server State Management**: Implemented React Query for efficient data fetching and caching
4. **Server Actions**: Used Next.js server actions for data mutations
5. **Authentication**: Enhanced authentication system with JWT tokens
6. **Type Safety**: Full TypeScript support throughout the application

## Testing

The application has been tested to ensure all functionality works as expected without regression from the original version.

## Deployment

The application can be deployed to any platform that supports Next.js, such as Vercel, Netlify, or a custom Node.js server.

### Manual VPS Deployment

For manual deployment on a VPS, follow the detailed instructions in [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

### Automated Deployment Scripts

- For Linux servers: [deploy.sh](deploy.sh)
- For Windows servers: [deploy.bat](deploy.bat)

### Environment Variables for Production

Refer to [.env.production](.env.production) for the required environment variables in production.

### Process Management

The application uses PM2 for process management in production. The configuration is defined in [ecosystem.config.js](ecosystem.config.js).

### CI/CD Pipeline

This project includes a GitHub Actions workflow for CI/CD:

- **Continuous Integration**: Runs on every push and pull request to `main` and `develop` branches
- **Continuous Deployment**: Automatically deploys to a VPS when changes are pushed to `main`
- **Docker Build**: Builds and pushes Docker images to DockerHub

The workflow is defined in [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml).

### Docker Deployment

The application can be containerized using the provided [Dockerfile](Dockerfile) and [docker-compose.yml](docker-compose.yml):

```bash
# Build and run with Docker
make docker-build
make docker-run

# Or use docker-compose
make docker-dev
```

### Makefile Commands

For easier development and deployment, a [Makefile](Makefile) is provided with common commands.

### Universal Deployment System

This project includes a universal deployment system that can automatically deploy any Next.js application to a VPS:

- Located in [universal-deploy/](universal-deploy/) directory
- Supports customizable configurations
- Automatically generates PM2, Nginx, and deployment scripts
- Includes CLI tool for easy usage
- Cross-platform support (Linux/MacOS/Windows)

To use the universal deployment system:

```bash
# Initialize a new configuration
npm run universal:init myapp

# Generate deployment files
npm run universal:generate myapp.config.json

# Deploy the application
npm run universal:deploy myapp.config.json
```

See [universal-deploy/README.md](universal-deploy/README.md) for detailed usage instructions.

## License

This project is licensed under the MIT License.