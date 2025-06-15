// Re-export cross-platform tRPC client logic (placeholder)
export { queryClient } from "./trpc";

// Re-export cross-platform authentication utilities
export {
  tokenStorage,
  userStorage,
  authUtils,
  setStorageAdapter,
  browserStorageAdapter,
  type StorageAdapter,
} from "./utils/auth";
