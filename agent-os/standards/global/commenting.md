# Commenting Standards

## General Principles
- Write self-documenting code first; comments second
- Explain WHY, not WHAT (code shows what)
- Keep comments up-to-date with code changes
- Remove commented-out code before committing

## File Headers
Include file header for complex modules:

```typescript
/**
 * DataService handles all data persistence operations.
 *
 * This service manages:
 * - Loading and saving plugin data
 * - Caching frequently accessed data
 * - Syncing with external services
 */
export class DataService {
  // ...
}
```

## Function Documentation
Use JSDoc for public methods and complex private methods:

```typescript
/**
 * Processes a markdown file and extracts metadata.
 *
 * @param file - The file to process
 * @param options - Processing options
 * @returns Extracted metadata object
 * @throws Error if file cannot be read
 */
async function processFile(
  file: TFile,
  options: ProcessOptions
): Promise {
  // Implementation
}
```

## Inline Comments

### When to Comment
- Complex algorithms or business logic
- Non-obvious workarounds or hacks
- TODO/FIXME items with context
- Important constraints or limitations

```typescript
// ✅ Good comments

// WORKAROUND: Obsidian API doesn't expose this event,
// so we poll every 5 seconds instead
this.registerInterval(setInterval(() => {
  this.checkForChanges();
}, 5000));

// Cache results to avoid expensive recalculation.
// Note: Cache is cleared when settings change.
if (this.cache.has(key)) {
  return this.cache.get(key);
}

// TODO(username): Implement retry logic for failed requests
// See issue #123 for requirements

// ❌ Bad comments (obvious or redundant)

// Set the name variable
const name = 'John';

// Loop through files
for (const file of files) {
  // Process file
  processFile(file);
}
```

### Comment Style
- Use `//` for single-line comments
- Use `/* */` for multi-line comments
- Place comments above the code they describe
- Use proper capitalization and punctuation

```typescript
// ✅ Correct
// This is a single-line comment.
const value = 42;

/*
 * This is a multi-line comment that explains
 * a complex piece of logic in detail.
 */
const result = complexCalculation();

// ❌ Wrong
const value = 42; // this is bad
const result = complexCalculation(); /* inline multi-line is awkward */
```

## API Documentation
Document all public APIs with TSDoc:

```typescript
/**
 * Main plugin class for Task Tracker.
 *
 * @example
 * ```typescript
 * const plugin = new TaskTrackerPlugin(app, manifest);
 * await plugin.onload();
 * ```
 */
export default class TaskTrackerPlugin extends Plugin {
  /**
   * Plugin settings.
   *
   * @see {@link TaskTrackerSettings} for configuration options
   */
  settings: TaskTrackerSettings;

  /**
   * Initializes the plugin.
   *
   * Called automatically by Obsidian when the plugin is loaded.
   *
   * @remarks
   * This method registers all commands, views, and event handlers.
   */
  async onload(): Promise {
    // Implementation
  }
}
```

## Special Comment Tags
Use consistent tags for special comments:

```typescript
// TODO: Description of what needs to be done
// FIXME: Description of what's broken
// HACK: Description of why this hack is needed
// NOTE: Important information
// OPTIMIZE: Performance improvement opportunity
// SECURITY: Security-related concern
```

## README Documentation
Every plugin must have a comprehensive README.md:

```markdown
# Plugin Name

Brief description of what the plugin does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

### From Obsidian Community Plugins
1. Open Settings → Community Plugins
2. Search for "Plugin Name"
3. Click Install

### Manual Installation
1. Download latest release
2. Extract to `.obsidian/plugins/plugin-name/`
3. Reload Obsidian

## Usage

### Basic Usage
Explain how to use the plugin.

### Advanced Features
Document advanced features with examples.

## Settings

- **Setting 1**: Description
- **Setting 2**: Description

## Development

### Building
\`\`\`bash
npm install
npm run dev
\`\`\`

### Contributing
See CONTRIBUTING.md

## Support

- [Report Issues](https://github.com/user/repo/issues)
- [Discord Community](https://discord.gg/invite)

## License

MIT License - see LICENSE
