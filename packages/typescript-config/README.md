# @repo/typescript-config

Shared TypeScript configurations for consistent type checking and compilation settings across all applications in the monorepo.

## 📦 Installation

This package is automatically installed as part of the monorepo workspace. To use it in your applications:

```json
{
  "devDependencies": {
    "@repo/typescript-config": "workspace:*"
  }
}
```

## 🚀 Usage

### Base Configuration

For general TypeScript projects:

```json
// tsconfig.json
{
  "extends": "@repo/typescript-config/base",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Next.js Configuration

For Next.js applications:

```json
// tsconfig.json
{
  "extends": "@repo/typescript-config/nextjs",
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### React Library Configuration

For React component libraries:

```json
// tsconfig.json
{
  "extends": "@repo/typescript-config/react-library",
  "compilerOptions": {
    "outDir": "dist",
    "declarationDir": "dist/types"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.*", "**/*.spec.*"]
}
```

## 📁 Available Configurations

### `@repo/typescript-config/base`
**Purpose**: Foundation configuration for all TypeScript projects

**Features**:
- Strict type checking enabled
- Modern ES2022 target with ES2020 module resolution
- Path mapping support for cleaner imports
- Comprehensive compiler options for type safety
- Optimized for both development and production builds

**Best for**: Backend services, CLI tools, utility libraries

### `@repo/typescript-config/nextjs`
**Purpose**: Optimized configuration for Next.js applications

**Features**:
- Next.js specific compiler options
- JSX support with React 18
- App Router and Pages Router compatibility
- Incremental compilation for faster builds
- Server and client component support
- Built-in path mapping for Next.js conventions

**Best for**: Next.js web applications, full-stack apps

### `@repo/typescript-config/react-library`
**Purpose**: Configuration for reusable React component libraries

**Features**:
- React JSX support
- Declaration file generation
- Tree-shaking friendly module resolution
- Optimized for library publishing
- Compatible with bundlers (Webpack, Rollup, etc.)
- Proper peer dependency handling

**Best for**: Component libraries, UI packages, shared React utilities

## 🔧 Compiler Options Explained

### Type Checking
```json
{
  "strict": true,                           // Enable all strict type checking
  "noImplicitAny": true,                   // Error on expressions with implied 'any'
  "strictNullChecks": true,                // Handle null/undefined properly
  "strictFunctionTypes": true,             // Strict checking of function types
  "noImplicitReturns": true,              // Error when not all paths return
  "noFallthroughCasesInSwitch": true      // Error on fallthrough switch cases
}
```

### Module Resolution
```json
{
  "moduleResolution": "bundler",           // Modern module resolution
  "allowImportingTsExtensions": true,      // Import .ts files directly
  "resolveJsonModule": true,               // Import JSON files
  "allowSyntheticDefaultImports": true,    // Allow default imports from modules
  "esModuleInterop": true                  // Enable interop between CommonJS and ES modules
}
```

### Performance
```json
{
  "incremental": true,                     // Enable incremental compilation
  "skipLibCheck": true,                    // Skip type checking of declaration files
  "forceConsistentCasingInFileNames": true // Enforce consistent file naming
}
```

## 🛠️ Development

### Type Checking Only
```bash
# Check types without emitting files
npx tsc --noEmit
```

### Building
```bash
# Build with your tsconfig
npx tsc
```

### Cleaning
```bash
npm run clean
```

## 📝 Customization

### Adding Project-Specific Options

```json
{
  "extends": "@repo/typescript-config/base",
  "compilerOptions": {
    // Override or add specific options
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    },
    "outDir": "build",
    "rootDir": "src"
  },
  "include": [
    "src/**/*",
    "types/**/*"
  ],
  "exclude": [
    "node_modules",
    "build",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

### Environment-Specific Configurations

```json
// tsconfig.build.json - Production builds
{
  "extends": "./tsconfig.json",
  "exclude": [
    "**/*.test.*",
    "**/*.spec.*",
    "**/__tests__/**",
    "**/__mocks__/**"
  ]
}
```

```json
// tsconfig.dev.json - Development with relaxed rules
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noUnusedLocals": false,
    "noUnusedParameters": false
  }
}
```

## 🔍 Path Mapping Examples

### Absolute Imports
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

Usage:
```typescript
// Instead of: import { Button } from '../../../components/Button'
import { Button } from '@components/Button';
import { formatDate } from '@utils/date';
import type { User } from '@types/user';
```

## 🐛 Troubleshooting

### Common Issues

1. **Module not found errors**
   - Check your `paths` configuration
   - Ensure `baseUrl` is set correctly
   - Verify file extensions in imports

2. **Type checking too slow**
   - Enable `incremental: true`
   - Add more specific `include`/`exclude` patterns
   - Use `skipLibCheck: true` for faster builds

3. **JSX errors in React projects**
   - Ensure `jsx: "react-jsx"` is set
   - Check that React types are installed
   - Verify `jsxImportSource` if using custom JSX factory

4. **Declaration file issues**
   - Set `declaration: true` for libraries
   - Configure `declarationDir` for organized output
   - Use `declarationMap: true` for source mapping

### Performance Optimization

```json
{
  "compilerOptions": {
    // Faster incremental builds
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    
    // Skip type checking of dependencies
    "skipLibCheck": true,
    
    // Faster module resolution
    "moduleResolution": "bundler"
  },
  "exclude": [
    // Exclude unnecessary files
    "node_modules",
    "**/*.test.*",
    "**/*.spec.*",
    "coverage",
    "dist"
  ]
}
```

## 📊 Configuration Matrix

| Feature | Base | Next.js | React Library |
|---------|------|---------|---------------|
| Strict Mode | ✅ | ✅ | ✅ |
| JSX Support | ❌ | ✅ | ✅ |
| Declaration Files | ❌ | ❌ | ✅ |
| Incremental Build | ✅ | ✅ | ✅ |
| Path Mapping | ✅ | ✅ | ✅ |
| ES2022 Target | ✅ | ✅ | ✅ |
| Node.js Types | ✅ | ❌ | ❌ |
| DOM Types | ❌ | ✅ | ✅ |

## 🔗 Dependencies

### Peer Dependencies
- `typescript` ^5.0.0

### Development Dependencies
- `typescript` ^5.8.2

## 📚 Best Practices

1. **Extend, Don't Replace**: Always extend these configurations rather than replacing them
2. **Project-Specific Overrides**: Add only necessary overrides in your project's tsconfig
3. **Environment Configs**: Use separate configs for different environments (dev, build, test)
4. **Path Mapping**: Use consistent path mapping patterns across projects
5. **Incremental Builds**: Enable incremental compilation for faster development

## 🔄 Updates

This package stays current with:
- Latest TypeScript features and best practices
- Modern JavaScript/TypeScript patterns
- Performance optimizations
- Security recommendations
- Framework-specific optimizations

## 🤝 Contributing

When contributing to these configurations:
1. Test changes across different project types
2. Consider backward compatibility
3. Document any breaking changes
4. Update relevant examples and documentation
5. Ensure configurations work with popular bundlers and tools 