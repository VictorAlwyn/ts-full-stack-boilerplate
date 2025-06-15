# @repo/trpc

Cross-platform tRPC client logic for Next.js and React Native applications.

## Overview

This package provides shared tRPC client logic that works seamlessly across different platforms:
- **Next.js** (web applications)
- **React Native Expo** (mobile applications)
- **Node.js** (client-side applications)

## Key Features

- ✅ **Cross-Platform Storage**: Configurable storage adapters for different environments
- ✅ **Authentication Utilities**: Token and user management with async/sync APIs
- ✅ **Type Safety**: Full TypeScript support when connected to your tRPC backend
- ✅ **No UI Dependencies**: Pure logic without platform-specific UI components

## Installation

```bash
# Install the package
pnpm add @repo/trpc

# Install peer dependencies
pnpm add @trpc/client @trpc/react-query @trpc/server @tanstack/react-query react zod
```

## Usage

### Basic Setup

```typescript
import { trpc, createTrpcClient, authUtils } from '@repo/trpc';

// Create tRPC client (connect to your backend tRPC router)
const client = createTrpcClient('http://localhost:3000/api/trpc');
```

### Cross-Platform Storage

#### For Next.js (Browser)
```typescript
import { setStorageAdapter, browserStorageAdapter } from '@repo/trpc';

// Use browser localStorage (default)
setStorageAdapter(browserStorageAdapter);
```

#### For React Native
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setStorageAdapter, type StorageAdapter } from '@repo/trpc';

// Create React Native storage adapter
const reactNativeStorageAdapter: StorageAdapter = {
  async getItem(key: string) {
    return await AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
  },
};

// Configure for React Native
setStorageAdapter(reactNativeStorageAdapter);
```

### Authentication

```typescript
import { authUtils, tokenStorage, userStorage } from '@repo/trpc';

// Login (async)
await authUtils.login('jwt-token', { id: '1', name: 'John', role: 'user' });

// Check authentication status
const isAuth = await authUtils.isAuthenticated();
const currentUser = await authUtils.getCurrentUser();

// For synchronous usage (backward compatibility)
authUtils.loginSync('jwt-token', user);
const isAuthSync = authUtils.isAuthenticatedSync();
```

### Role-Based Access

```typescript
import { authUtils } from '@repo/trpc';

// Check user roles
const isAdmin = await authUtils.isAdmin();
const isUserOrAdmin = await authUtils.isUserOrAdmin();
const hasRole = await authUtils.hasRole('moderator');
```

### Connecting to Your Backend Router

This package provides the client logic only. You need to:

1. **Define your tRPC router in your backend** (e.g., NestJS, Express, Next.js API routes)
2. **Import the router type** for full type safety:

```typescript
// Import your actual backend router type
import type { AppRouter } from '../../../apps/backend/src/trpc/router';

// Type the trpc client
export const trpc = createTRPCReact<AppRouter>();
```

## API Reference

### Storage Adapter Interface

```typescript
interface StorageAdapter {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}
```

### Authentication Utils

- `authUtils.login(token, user)` - Store authentication data
- `authUtils.logout()` - Clear authentication data
- `authUtils.isAuthenticated()` - Check if user is authenticated
- `authUtils.getCurrentUser()` - Get current user data
- `authUtils.hasRole(role)` - Check if user has specific role
- `authUtils.isAdmin()` - Check if user is admin
- `authUtils.isUserOrAdmin()` - Check if user has user or admin role

All methods have both async and sync versions (append `Sync` for synchronous).

### Token & User Storage

- `tokenStorage.getToken()` / `tokenStorage.getTokenSync()`
- `tokenStorage.setToken(token)` / `tokenStorage.setTokenSync(token)`
- `tokenStorage.removeToken()` / `tokenStorage.removeTokenSync()`
- `userStorage.getUser()` / `userStorage.getUserSync()`
- `userStorage.setUser(user)` / `userStorage.setUserSync(user)`
- `userStorage.removeUser()` / `userStorage.removeUserSync()`

## Platform Examples

### Next.js App Router

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, createTrpcClient } from '@repo/trpc';

const queryClient = new QueryClient();
const trpcClient = createTrpcClient('/api/trpc');

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### React Native Expo

```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, createTrpcClient, setStorageAdapter } from '@repo/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure storage for React Native
setStorageAdapter({
  async getItem(key) { return await AsyncStorage.getItem(key); },
  async setItem(key, value) { await AsyncStorage.setItem(key, value); },
  async removeItem(key) { await AsyncStorage.removeItem(key); },
});

const queryClient = new QueryClient();
const trpcClient = createTrpcClient('https://your-api.com/api/trpc');

export default function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {/* Your app components */}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

## Development

```bash
# Type checking
pnpm type-check

# Clean build artifacts
pnpm clean
```

## License

MIT 