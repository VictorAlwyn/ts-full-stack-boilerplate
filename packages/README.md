# 📦 Shared Packages

This directory contains shared packages used across the monorepo. Each package is designed to be reusable and provides specific functionality that can be consumed by different apps in the workspace.

## 📁 Package Structure

```
packages/
├── eslint-config/          # Shared ESLint configurations
├── trpc/                   # tRPC client and server utilities
├── typescript-config/      # Shared TypeScript configurations
└── README.md              # This file
```

## 🔧 Available Packages

### [@repo/eslint-config](./eslint-config/)
Shared ESLint configurations for maintaining consistent code quality across all applications.

**Exports:**
- `@repo/eslint-config/base` - Base ESLint rules
- `@repo/eslint-config/next-js` - Next.js specific rules
- `@repo/eslint-config/react-internal` - Internal React component rules

### [@repo/trpc](./trpc/)
Centralized tRPC client and server configurations for type-safe API communication.

**Exports:**
- `@repo/trpc/client` - tRPC client configuration
- `@repo/trpc/router` - Server-side router types
- `@repo/trpc/TrpcProvider` - React provider component

### [@repo/typescript-config](./typescript-config/)
Shared TypeScript configurations for consistent type checking across projects.

**Exports:**
- `@repo/typescript-config/base` - Base TypeScript configuration
- `@repo/typescript-config/nextjs` - Next.js optimized configuration
- `@repo/typescript-config/react-library` - React library configuration

## 🚀 Usage

These packages are consumed by applications in the monorepo using workspace references:

```json
{
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*"
  },
  "dependencies": {
    "@repo/trpc": "workspace:*"
  }
}
```

## 🧹 Maintenance

### Cleaning up packages
```bash
# Clean all package node_modules and build artifacts
npm run clean:packages

# Or clean individual packages
cd packages/eslint-config && npm run clean
cd packages/trpc && npm run clean
cd packages/typescript-config && npm run clean
```

### Adding new packages
1. Create a new directory in `/packages/`
2. Add `package.json` with proper exports and metadata
3. Follow the naming convention `@repo/package-name`
4. Add comprehensive README documentation
5. Update this main README with the new package info

## 📚 Best Practices

- Keep packages focused on a single responsibility
- Use proper semantic versioning
- Include comprehensive documentation
- Follow consistent export patterns
- Add appropriate keywords for discoverability
- Use workspace references for internal dependencies

## 🔗 References

- [Next.js Package Bundling Guide](https://nextjs.org/docs/pages/guides/package-bundling)
- [Keeping NextJS Projects Clean](https://medium.com/@tobias.hallmayer/how-to-keep-a-nextjs-project-clear-and-clean-3503700544f) 