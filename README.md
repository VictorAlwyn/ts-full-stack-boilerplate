# TS Full Stack

A modern full-stack application built with Turborepo, featuring a Next.js web app, NestJS backend, and Expo mobile app with shared tRPC API layer.

## 🚀 Tech Stack

### Core Technologies
- **Monorepo**: [Turborepo](https://turborepo.com/) v2.5.4
- **Package Manager**: [pnpm](https://pnpm.io/) v10.11.0
- **Language**: [TypeScript](https://www.typescriptlang.org/) v5.8.2
- **API Layer**: [tRPC](https://trpc.io/) v11.4.0
- **Node.js**: >=18.0.0

### Frontend (Web)
- **Framework**: [Next.js](https://nextjs.org/) v15.3.0
- **React**: v19.1.0
- **Styling**: [TailwindCSS](https://tailwindcss.com/) v4.1.10
- **State Management**: [TanStack Query](https://tanstack.com/query) v5.80.7
- **Development Server**: Turbopack (Next.js built-in)

### Backend (API)
- **Framework**: [NestJS](https://nestjs.com/) v11.0.1
- **API Protocol**: [tRPC](https://trpc.io/) with nestjs-trpc v1.6.1
- **Validation**: [Zod](https://zod.dev/) v3.25.63
- **Testing**: [Jest](https://jestjs.io/) v29.7.0
- **Build Tool**: [SWC](https://swc.rs/) v1.10.7

### Mobile (React Native)
- **Framework**: [Expo](https://expo.dev/) v53.0.11
- **React Native**: v0.79.3
- **Navigation**: [React Navigation](https://reactnavigation.org/) v7.1.6
- **State Management**: [TanStack Query](https://tanstack.com/query) v5.80.7

### Shared Packages
- **@repo/trpc**: Shared tRPC router and client configuration
- **@repo/eslint-config**: Shared ESLint configuration
- **@repo/typescript-config**: Shared TypeScript configuration

## 📁 Project Structure

```
turbo-full-stack/
├── apps/
│   ├── web/          # Next.js web application (Port: 3001)
│   ├── backend/      # NestJS API server (Port: 3000)
│   └── mobile/       # Expo React Native app
├── packages/
│   ├── trpc/         # Shared tRPC configuration
│   ├── eslint-config/ # Shared ESLint rules
│   └── typescript-config/ # Shared TypeScript config
├── package.json      # Root package configuration
├── turbo.json        # Turborepo configuration
└── pnpm-workspace.yaml # pnpm workspace configuration
```

## 🛠️ Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js**: v22.14.0 or higher
- **pnpm**: v10.11.0 (install with `npm install -g pnpm`)

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd turbo-full-stack
pnpm install
```

### 2. Rename Package Scope (Optional)

By default, shared packages use the `@repo/` scope. You can rename them to match your project:

```bash
# Rename @repo/ to @ts-full-stack/ (or your preferred name)
find . -name "package.json" -not -path "./node_modules/*" -exec sed -i '' 's/@repo\//@ts-full-stack\//g' {} +

# Update import statements in TypeScript files
find . -name "*.ts" -o -name "*.tsx" -not -path "./node_modules/*" -exec sed -i '' 's/@repo\//@ts-full-stack\//g' {} +

# For Linux users, use this instead (without the '' after -i):
# find . -name "package.json" -not -path "./node_modules/*" -exec sed -i 's/@repo\//@ts-full-stack\//g' {} +
# find . -name "*.ts" -o -name "*.tsx" -not -path "./node_modules/*" -exec sed -i 's/@repo\//@ts-full-stack\//g' {} +
```

After renaming, reinstall dependencies:
```bash
pnpm install
```

### 3. Development Mode

Start all applications in development mode:

```bash
pnpm dev
```

This will concurrently start:
- **Web app**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Mobile app**: Expo development server

### 4. Individual App Development

#### Web Application
```bash
# Start only the web app
cd apps/web
pnpm dev
```
Access at: http://localhost:3001

#### Backend API
```bash
# Start only the backend
cd apps/backend
pnpm dev
```
API available at: http://localhost:3000

#### Mobile Application
```bash
# Start only the mobile app
cd apps/mobile
pnpm dev
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` to run in web browser
- Scan QR code with Expo Go app on your device

## 🏗️ Build Commands

### Build All Applications
```bash
pnpm build
```

### Build Individual Apps
```bash
# Build web app
cd apps/web && pnpm build

# Build backend
cd apps/backend && pnpm build

# Build mobile app for production
cd apps/mobile && pnpm build
```

## 🧪 Testing and Linting

### Run Linting
```bash
pnpm lint
```

### Format Code
```bash
pnpm format
```

### Type Checking
```bash
pnpm check-types
```

### Run Tests (Backend)
```bash
cd apps/backend
pnpm test           # Run all tests
pnpm test:watch     # Run tests in watch mode
pnpm test:cov       # Run tests with coverage
pnpm test:e2e       # Run end-to-end tests
```

## 🔧 Configuration

### Environment Variables
Create `.env` files in each app directory as needed:

- `apps/web/.env.local` - Web app environment variables
- `apps/backend/.env` - Backend environment variables
- `apps/mobile/.env` - Mobile app environment variables

### Turborepo Configuration
The `turbo.json` file configures the build pipeline:
- **build**: Builds all apps with dependency awareness
- **dev**: Starts development servers (no caching)
- **lint**: Runs linting across all packages
- **check-types**: Type checking across all packages

## 📱 Mobile Development

### Prerequisites for Mobile
- **iOS**: Xcode and iOS Simulator
- **Android**: Android Studio and Android SDK
- **Physical Device**: Expo Go app installed

### Mobile Commands
```bash
cd apps/mobile

# Start development server
pnpm dev

# Run on specific platforms
pnpm ios      # iOS simulator
pnpm android  # Android emulator
pnpm web      # Web browser
```

## 🔗 API Integration

The project uses tRPC for type-safe API communication:

1. **Backend**: Defines tRPC routers in NestJS
2. **Shared Package**: `@repo/trpc` contains shared types and client configuration
3. **Frontend**: Web and mobile apps consume the API using tRPC clients

## 📦 Package Management

This project uses pnpm workspaces with the following structure:
- **Root**: Contains shared dependencies and scripts
- **Apps**: Individual applications with their own dependencies
- **Packages**: Shared packages used across apps

## 🚢 Deployment

### Web App (Next.js)
- Can be deployed to Vercel, Netlify, or any Node.js hosting platform
- Run `pnpm build` in `apps/web` to create production build

### Backend (NestJS)
- Can be deployed to any Node.js hosting platform
- Run `pnpm build` in `apps/backend` to create production build
- Start with `pnpm start:prod`

### Mobile App (Expo)
- Use `expo build` for production builds
- Submit to app stores using `expo submit`

## 🔍 Useful Commands

```bash
# Install dependencies
pnpm install

# Clean all node_modules and reinstall
pnpm clean && pnpm install

# Run specific app
pnpm --filter web dev
pnpm --filter backend dev
pnpm --filter mobile dev

# Build specific app
pnpm --filter web build
pnpm --filter backend build
```

## 📚 Learn More

- [Turborepo Documentation](https://turborepo.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Expo Documentation](https://docs.expo.dev/)
- [tRPC Documentation](https://trpc.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
