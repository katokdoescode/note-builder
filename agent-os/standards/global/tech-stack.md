# Technology Stack Standards

## Core Technologies

### TypeScript
- **Version**: Latest stable (5.x+)
- **Target**: ES2018 or later
- **Module**: ESNext
- **Strict mode**: Enabled

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "ESNext",
    "lib": ["ES2018", "DOM"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "outDir": ".",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "inlineSourceMap": false,
    "inlineSources": false
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Node.js
- **Version**: 16.x or later for development
- **Package Manager**: npm (recommended) or yarn

### Build Tools

#### esbuild (Recommended)
Fast bundler with excellent TypeScript support:

```json
{
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "node esbuild.config.mjs production"
  }
}
```

```javascript
// esbuild.config.mjs
import esbuild from 'esbuild';
import process from 'process';

const production = process.argv[2] === 'production';

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian', 'electron', '@codemirror/*'],
  format: 'cjs',
  watch: !production,
  target: 'es2018',
  logLevel: 'info',
  sourcemap: production ? false : 'inline',
  treeShaking: true,
  outfile: 'main.js',
}).catch(() => process.exit(1));
```

#### Alternative: Rollup
```json
{
  "scripts": {
    "dev": "rollup --config rollup.config.js -w",
    "build": "rollup --config rollup.config.js"
  }
}
```

## Obsidian API
- **Package**: `obsidian` (latest)
- **Type Definitions**: Built-in TypeScript definitions
- **API Documentation**: https://docs.obsidian.md/

```typescript
import {
  App,
  Plugin,
  PluginManifest,
  TFile,
  Notice,
  Modal,
  Setting,
  PluginSettingTab,
  MarkdownView,
  WorkspaceLeaf,
} from 'obsidian';
```

## Allowed Dependencies

### Minimal Dependencies
Obsidian plugins should minimize external dependencies:
- All dependencies must be bundled in `main.js`
- Avoid large libraries when possible
- Use tree-shaking to reduce bundle size
- Prefer native JavaScript/TypeScript solutions

### Commonly Used Libraries

#### Date/Time (if needed)
```bash
npm install moment
# or
npm install luxon
```

#### HTTP Requests
```typescript
// ✅ Preferred - use native fetch
const response = await fetch(url);

// ❌ Avoid - adds unnecessary dependencies
import axios from 'axios';
```

#### Data Manipulation
```bash
npm install lodash-es  # ES modules for tree-shaking
```

#### Markdown Processing (if needed beyond Obsidian API)
```bash
npm install marked
# or
npm install remark
```

### Prohibited Dependencies
- **Do NOT use**: Client-side telemetry/analytics libraries (Sentry, Mixpanel, etc.)
- **Do NOT use**: Obfuscation tools
- **Do NOT use**: Large UI frameworks (React, Vue, Angular) unless absolutely necessary

## Node.js APIs (Desktop Only)

### File System Access
Only for plugins with `"isDesktopOnly": true`:

```typescript
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

// Must be marked in manifest.json
{
  "isDesktopOnly": true
}
```

### Allowed Node Modules
- `fs` - File system operations
- `path` - Path manipulation
- `os` - Operating system info
- `child_process` - Spawn processes (use with caution)
- `crypto` - Cryptographic operations

### Electron APIs
Available in desktop version:

```typescript
import { shell } from 'electron';

// Open external URL
shell.openExternal('https://example.com');

// Show file in folder
shell.showItemInFolder(filePath);
```

## Development Tools

### ESLint
```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "latest",
    "@typescript-eslint/parser": "latest",
    "eslint": "latest"
  }
}
```

#### .eslintrc.json
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_"
    }]
  }
}
```

### Prettier (Optional)
```json
{
  "devDependencies": {
    "prettier": "latest"
  }
}
```

#### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

## Testing (Optional but Recommended)

### Jest
```bash
npm install --save-dev jest @types/jest ts-jest
```

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
};
```

## Package.json Structure

```json
{
  "name": "obsidian-plugin-name",
  "version": "1.0.0",
  "description": "Plugin description",
  "main": "main.js",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "node esbuild.config.mjs production",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write 'src/**/*.ts'",
    "test": "jest"
  },
  "keywords": ["obsidian", "obsidian-plugin"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "esbuild": "^0.19.0",
    "eslint": "^8.0.0",
    "obsidian": "latest",
    "tslib": "^2.6.0",
    "typescript": "^5.2.0"
  }
}
```

## Browser Compatibility
- Target modern browsers (Chrome 90+, Safari 14+, Firefox 88+)
- No IE11 support needed
- Use ES2018+ features freely
- Avoid cutting-edge features not widely supported

## Bundle Size Best Practices
- Keep total bundle size under 1MB
- Use dynamic imports for large, rarely-used features
- Tree-shake unused code
- Minify production builds
- Analyze bundle with tools like esbuild metafile

```javascript
// Dynamic import example
async function loadAdvancedFeature() {
  const module = await import('./advanced-feature');
  return module.default;
}
```

## Security Considerations
- Never bundle API keys or secrets
- Sanitize user input
- Validate data from external sources
- Use HTTPS for all network requests
- Follow Obsidian's security policies
```
