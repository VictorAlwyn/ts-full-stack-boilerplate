// Abstract storage interface for cross-platform compatibility
export interface StorageAdapter {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

// Default browser storage adapter
export const browserStorageAdapter: StorageAdapter = {
  getItem: (key: string) => {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(key);
    }
  },
};

// Storage adapter that can be configured per platform
let currentStorageAdapter: StorageAdapter = browserStorageAdapter;

export const setStorageAdapter = (adapter: StorageAdapter) => {
  currentStorageAdapter = adapter;
};

// Token storage utilities - Cross-platform
export const tokenStorage = {
  getToken: async (): Promise<string | null> => {
    const result = currentStorageAdapter.getItem("auth_token");
    return result instanceof Promise ? await result : result;
  },
  setToken: async (token: string): Promise<void> => {
    const result = currentStorageAdapter.setItem("auth_token", token);
    if (result instanceof Promise) await result;
  },
  removeToken: async (): Promise<void> => {
    const result = currentStorageAdapter.removeItem("auth_token");
    if (result instanceof Promise) await result;
  },
  // Synchronous versions for backward compatibility
  getTokenSync: (): string | null => {
    const result = currentStorageAdapter.getItem("auth_token");
    return result instanceof Promise ? null : result;
  },
  setTokenSync: (token: string): void => {
    const result = currentStorageAdapter.setItem("auth_token", token);
    if (!(result instanceof Promise)) return;
  },
  removeTokenSync: (): void => {
    const result = currentStorageAdapter.removeItem("auth_token");
    if (!(result instanceof Promise)) return;
  },
};

// User storage utilities
export const userStorage = {
  getUser: async (): Promise<any> => {
    const result = currentStorageAdapter.getItem("auth_user");
    const userStr = result instanceof Promise ? await result : result;
    return userStr ? JSON.parse(userStr) : null;
  },
  setUser: async (user: any): Promise<void> => {
    const result = currentStorageAdapter.setItem(
      "auth_user",
      JSON.stringify(user)
    );
    if (result instanceof Promise) await result;
  },
  removeUser: async (): Promise<void> => {
    const result = currentStorageAdapter.removeItem("auth_user");
    if (result instanceof Promise) await result;
  },
  // Synchronous versions for backward compatibility
  getUserSync: (): any => {
    const result = currentStorageAdapter.getItem("auth_user");
    const userStr = result instanceof Promise ? null : result;
    return userStr ? JSON.parse(userStr) : null;
  },
  setUserSync: (user: any): void => {
    const result = currentStorageAdapter.setItem(
      "auth_user",
      JSON.stringify(user)
    );
    if (!(result instanceof Promise)) return;
  },
  removeUserSync: (): void => {
    const result = currentStorageAdapter.removeItem("auth_user");
    if (!(result instanceof Promise)) return;
  },
};

// Auth utilities - Cross-platform
export const authUtils = {
  login: async (token: string, user: any): Promise<void> => {
    await tokenStorage.setToken(token);
    await userStorage.setUser(user);
  },
  logout: async (): Promise<void> => {
    await tokenStorage.removeToken();
    await userStorage.removeUser();
  },
  isAuthenticated: async (): Promise<boolean> => {
    const token = await tokenStorage.getToken();
    return !!token;
  },
  getCurrentUser: async (): Promise<any> => {
    return await userStorage.getUser();
  },
  hasRole: async (role: string): Promise<boolean> => {
    const user = await userStorage.getUser();
    return user?.role === role;
  },
  isAdmin: async (): Promise<boolean> => {
    const user = await userStorage.getUser();
    return user?.role === "admin";
  },
  isUserOrAdmin: async (): Promise<boolean> => {
    const user = await userStorage.getUser();
    return user?.role === "user" || user?.role === "admin";
  },
  // Synchronous versions for backward compatibility
  loginSync: (token: string, user: any): void => {
    tokenStorage.setTokenSync(token);
    userStorage.setUserSync(user);
  },
  logoutSync: (): void => {
    tokenStorage.removeTokenSync();
    userStorage.removeUserSync();
  },
  isAuthenticatedSync: (): boolean => {
    return !!tokenStorage.getTokenSync();
  },
  getCurrentUserSync: (): any => {
    return userStorage.getUserSync();
  },
  hasRoleSync: (role: string): boolean => {
    const user = userStorage.getUserSync();
    return user?.role === role;
  },
  isAdminSync: (): boolean => {
    const user = userStorage.getUserSync();
    return user?.role === "admin";
  },
  isUserOrAdminSync: (): boolean => {
    const user = userStorage.getUserSync();
    return user?.role === "user" || user?.role === "admin";
  },
};
