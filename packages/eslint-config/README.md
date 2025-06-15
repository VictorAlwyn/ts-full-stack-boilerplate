# @repo/eslint-config

Shared ESLint configurations for maintaining consistent code quality and formatting across all applications in the monorepo.

## 📦 Installation

This package is automatically installed as part of the monorepo workspace. To use it in your applications:

```json
{
  "devDependencies": {
    "@repo/eslint-config": "workspace:*"
  }
}
```

## 🚀 Usage

### Base Configuration

For basic JavaScript/TypeScript projects:

```json
// .eslintrc.json
{
  "extends": ["@repo/eslint-config/base"]
}
```

### Next.js Configuration

For Next.js applications:

```json
// .eslintrc.json
{
  "extends": ["@repo/eslint-config/next-js"]
}
```

### React Internal Components

For internal React component libraries:

```json
// .eslintrc.json
{
  "extends": ["@repo/eslint-config/react-internal"]
}
```

## 📁 Available Configurations

### `@repo/eslint-config/base`
- Core ESLint rules for JavaScript and TypeScript
- Prettier integration for consistent formatting
- TypeScript-specific rules and parsers
- Import/export rules for module management
- Security and best practice rules

### `@repo/eslint-config/next-js`
- All base rules included
- Next.js specific rules and optimizations
- React hooks rules
- Performance and accessibility rules
- Server/client component rules for App Router

### `@repo/eslint-config/react-internal`
- Base configuration for React components
- Component-specific linting rules
- Props and state management rules
- Accessibility (a11y) rules
- Performance optimization rules

## 🔧 Features

### Included Plugins
- `@eslint/js` - Core ESLint rules
- `@next/eslint-plugin-next` - Next.js specific rules
- `eslint-config-prettier` - Prettier integration
- `eslint-plugin-react` - React component rules
- `eslint-plugin-react-hooks` - React hooks rules
- `eslint-plugin-turbo` - Turborepo specific rules
- `typescript-eslint` - TypeScript rules and parser

### Rule Categories
- **Code Quality**: Prevents common bugs and anti-patterns
- **Consistency**: Enforces consistent code style
- **Performance**: Identifies performance issues
- **Accessibility**: Ensures accessible React components
- **Security**: Prevents security vulnerabilities
- **Best Practices**: Enforces modern JavaScript/TypeScript patterns

## 🛠️ Development

### Linting Configuration Files
```bash
npm run lint
```

### Auto-fixing Issues
```bash
npm run lint:fix
```

### Cleaning Package
```bash
npm run clean
```

## 📝 Customization

### Extending Configurations

You can extend these configurations with project-specific rules:

```json
{
  "extends": ["@repo/eslint-config/next-js"],
  "rules": {
    // Your custom rules here
    "no-console": "warn",
    "prefer-const": "error"
  },
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/*.test.tsx"],
      "rules": {
        // Test-specific rules
        "no-magic-numbers": "off"
      }
    }
  ]
}
```

### IDE Integration

#### VS Code
Add to your `.vscode/settings.json`:

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

#### JetBrains IDEs
Enable ESLint in Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint

## 📚 Rule Explanations

### Key Rules Included

- **`@typescript-eslint/no-unused-vars`**: Prevents unused variables
- **`react-hooks/rules-of-hooks`**: Enforces Rules of Hooks
- **`@next/next/no-img-element`**: Prevents usage of `<img>` in favor of Next.js Image
- **`prettier/prettier`**: Enforces Prettier formatting
- **`import/order`**: Consistent import ordering
- **`no-console`**: Warns about console statements in production code

### Severity Levels
- **Error** 🔴: Breaks the build, must be fixed
- **Warning** 🟡: Should be addressed but doesn't break builds
- **Off** ⚪: Rule is disabled

## 🔗 Dependencies

### Production Dependencies
- Essential ESLint plugins and configurations
- TypeScript ESLint integration
- React and Next.js specific rules
- Prettier integration

### Peer Dependencies
- `eslint` ^9.0.0 (required by consuming projects)

## 🐛 Troubleshooting

### Common Issues

1. **Parser errors**: Ensure TypeScript is properly configured
2. **Rule conflicts**: Check for conflicting ESLint configurations
3. **Performance issues**: Consider using `.eslintignore` for large files
4. **IDE not recognizing rules**: Verify ESLint extension is installed and enabled

### Performance Tips

Create `.eslintignore` file:
```
node_modules/
.next/
dist/
build/
coverage/
.turbo/
```

### Debug Configuration

To see which configuration files are being used:
```bash
npx eslint --debug src/
```

## 📊 Metrics

This configuration helps maintain:
- Consistent code style across teams
- Reduced bug introduction
- Better performance patterns
- Improved accessibility compliance
- Enhanced security practices

## 🔄 Updates

This package is regularly updated to include:
- Latest ESLint rule recommendations
- New Next.js and React best practices
- Security vulnerability fixes
- Performance optimizations

## 🤝 Contributing

When contributing to this configuration:
1. Test changes across different project types
2. Document new rules and their purpose
3. Consider backward compatibility
4. Update this README with any new features
