# Privacy and Security Standards

## Obsidian Developer Policies Compliance
All plugins MUST comply with Obsidian's developer policies to be accepted into the community plugins directory.

## Data Collection Policies

### ❌ PROHIBITED: Client-Side Telemetry
Plugins MUST NOT submit user data to third-party telemetry services from within Obsidian:

```typescript
// ❌ NEVER DO THIS - Prohibited by Obsidian
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'your-dsn-here',
});

// ❌ NEVER DO THIS - Prohibited
import mixpanel from 'mixpanel-browser';
mixpanel.track('User Action');

// ❌ NEVER DO THIS - Prohibited
import Analytics from 'analytics';
const analytics = Analytics({ /* ... */ });
```

**Why**: Client-side telemetry libraries can easily collect user data unrelated to your plugin, including:
- Vault names and structure
- File names and paths
- User notes content
- Other installed plugins
- System information

### ✅ ALLOWED: Server-Side Telemetry (with disclosure)
If your plugin needs to collect analytics, it must:
1. Only send data from a backend server (not from Obsidian client)
2. Include a link to a privacy policy in README and manifest
3. Clearly explain what data is collected
4. Make telemetry opt-in when possible

```typescript
// ✅ Allowed - server-side only, with disclosure
async function syncData(data: UserData): Promise {
  // Send data to YOUR backend server
  // which then logs to YOUR analytics
  await fetch('https://yourserver.com/api/sync', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

**Required Disclosure in README:**
```markdown
## Privacy Policy

This plugin sends the following data to our servers:
- Sync status and timestamps
- Error logs (no file content)
- Feature usage statistics

View our full privacy policy: https://yoursite.com/privacy

To disable telemetry: [instructions]
```

## Network Usage Disclosure

### Clearly Explain All Network Requests
Any plugin that makes network requests MUST clearly document:
1. What external services it connects to
2. What data is sent
3. Why the connection is needed
4. How users can disable it (if optional)

```markdown
## Network Usage

This plugin connects to:
- **GitHub API** (api.github.com)
  - Purpose: Sync notes with GitHub repository
  - Data sent: Note content, file names, timestamps
  - Disable: Turn off sync in settings

- **OpenAI API** (api.openai.com)
  - Purpose: AI-powered note suggestions
  - Data sent: Selected text only (user-triggered)
  - Disable: Don't use AI features
```

### No Hidden Network Requests
```typescript
// ✅ Correct - documented and user-initiated
async function exportToService(): Promise {
  if (!this.settings.enableExport) {
    return;
  }

  // User explicitly enabled this feature
  await fetch('https://api.example.com/export', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ❌ Wrong - hidden automatic network requests
async function onload(): Promise {
  // Silently sends data on load - NOT ALLOWED
  await fetch('https://track.example.com/init', {
    method: 'POST',
    body: JSON.stringify({ plugin: 'my-plugin' }),
  });
}
```

## File Access Outside Vault

### Clearly Explain Why External Access Is Needed
If your plugin accesses files outside the Obsidian vault:
1. Must be marked as `"isDesktopOnly": true`
2. Must clearly document WHY external access is needed
3. Must get user permission if accessing sensitive locations
4. Should provide settings to configure paths

```typescript
// Example: Plugin that syncs with external folder
async function syncExternalFolder(): Promise {
  if (!this.settings.externalFolderPath) {
    new Notice('Please configure external folder path in settings');
    return;
  }

  // Clearly document this requires file system access
  const files = readFileSync(this.settings.externalFolderPath);
  // ...
}
```

**Required Disclosure:**
```markdown
## File System Access

This plugin accesses files outside your vault for:
- Syncing with external backup folder
- Importing from file system locations

The plugin requires these permissions:
- Read access to configured folders
- Write access for sync operations

Configure folder paths in Settings → Plugin Name
```

## Code Transparency

### ❌ PROHIBITED: Code Obfuscation
Plugins MUST NOT obfuscate code to hide its purpose:

```typescript
// ❌ NEVER DO THIS
const _0x1234 = ['data', 'send'];
function _0xabcd() { /* obfuscated code */ }

// ❌ NEVER DO THIS
eval(atob('Y29uc29sZS5sb2coInRlc3QiKQ=='));

// ❌ NEVER DO THIS - Hidden code in unusual characters
const data = 'hidden\u200Bcode\u200Chere';
```

### ✅ REQUIRED: Clear, Readable Code
All plugin code must be:
- Readable and understandable
- Properly formatted
- Not minified in source repository
- Use standard JavaScript/TypeScript patterns

```typescript
// ✅ Correct - clear and readable
async function saveData(file: TFile, content: string): Promise {
  try {
    await this.app.vault.modify(file, content);
    new Notice('Data saved successfully');
  } catch (error) {
    console.error('Failed to save:', error);
    new Notice('Failed to save data');
  }
}
```

## Security Best Practices

### Input Sanitization
Always sanitize user input:

```typescript
function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')
    .trim();
}
```

### Secure API Key Storage
```typescript
// ✅ Correct - stored in plugin settings (local to vault)
interface PluginSettings {
  apiKey: string;
}

// User must enter API key in settings
// Never bundle API keys in code

// ❌ NEVER DO THIS
const API_KEY = 'sk-1234567890abcdef'; // Hardcoded API key
```

### HTTPS Only
```typescript
// ✅ Correct - HTTPS only
const response = await fetch('https://api.example.com/data');

// ❌ Wrong - insecure HTTP
const response = await fetch('http://api.example.com/data');
```

### Validate External Data
```typescript
async function fetchExternalData(url: string): Promise {
  // Validate URL
  if (!url.startsWith('https://')) {
    throw new Error('Only HTTPS URLs allowed');
  }

  const response = await fetch(url);
  const data = await response.json();

  // Validate response structure
  if (!isValidData(data)) {
    throw new Error('Invalid data format');
  }

  return data;
}
```

## User Privacy Protection

### Minimal Data Collection
Only collect data that is absolutely necessary:

```typescript
// ✅ Correct - minimal data
interface SyncData {
  fileHash: string;      // Hash instead of content
  timestamp: number;     // When synced
  syncStatus: string;    // Success/fail
}

// ❌ Wrong - excessive data
interface SyncData {
  fileName: string;      // Reveals file names
  fileContent: string;   // Full content not needed
  filePath: string;      // Reveals vault structure
  userName: string;      // Not necessary
  systemInfo: string;    // Privacy concern
}
```

### Local Storage First
Prefer local storage over cloud storage:

```typescript
// ✅ Preferred - local storage
async function saveData(data: any): Promise {
  await this.saveData(data); // Saves to .obsidian/plugins/
}

// Only use cloud if explicitly needed and disclosed
```

### Encryption for Sensitive Data
```typescript
// If storing sensitive data, use encryption
import { createCipheriv, createDecipheriv } from 'crypto';

function encryptApiKey(key: string, password: string): string {
  // Encrypt sensitive data before storing
  // ...
}
```

## Compliance Checklist

Before submitting plugin, verify:
- [ ] No client-side telemetry libraries (Sentry, Mixpanel, etc.)
- [ ] All network usage documented in README
- [ ] Privacy policy link if collecting any data
- [ ] No code obfuscation
- [ ] No hardcoded API keys or secrets
- [ ] File system access explained (if applicable)
- [ ] HTTPS only for network requests
- [ ] Input validation and sanitization
- [ ] Minimal data collection
- [ ] User consent for optional features

## Reporting Security Issues
If you discover a security vulnerability in an Obsidian plugin:
1. Do NOT report publicly
2. Contact plugin author privately
3. Contact Obsidian team if author unresponsive
4. Give reasonable time for fix before disclosure
```

---

### developer-policies/code-transparency.md

```markdown
# Code Transparency Standards

## Open Source Requirement
All Obsidian community plugins must be open source and hosted on GitHub.

## Repository Requirements

### Public Repository
- Repository must be public on GitHub
- All source code must be visible
- Build process must be transparent
- No private dependencies

### Repository Structure
```
my-obsidian-plugin/
├── .github/
│   └── workflows/
│       └── release.yml        # Automated release workflow
├── src/
│   ├── main.ts                # Source code
│   └── ...
├── .gitignore
├── .eslintrc.json
├── esbuild.config.mjs         # Build configuration
├── manifest.json              # Plugin manifest
├── package.json               # Dependencies
├── README.md                  # Documentation
├── LICENSE                    # Open source license
└── versions.json              # Version compatibility
```

## Build Transparency

### Build Process Must Be Reproducible
```json
// package.json - clear build scripts
{
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "node esbuild.config.mjs production",
    "version": "node version-bump.mjs"
  }
}
```

### Build Configuration Must Be Visible
```javascript
// esbuild.config.mjs - transparent build process
import esbuild from 'esbuild';

const production = process.argv[2] === 'production';

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian', 'electron', '@codemirror/*'],
  format: 'cjs',
  target: 'es2018',
  logLevel: 'info',
  sourcemap: production ? false : 'inline',
  treeShaking: true,
  outfile: 'main.js',
  // NO obfuscation, NO minification of source
}).catch(() => process.exit(1));
```

### ❌ Prohibited Build Practices
```javascript
// ❌ NEVER DO THIS - Code obfuscation
import obfuscator from 'javascript-obfuscator';

esbuild.build({
  plugins: [
    {
      name: 'obfuscate',
      setup(build) {
        build.onEnd(() => {
          // Obfuscating code is PROHIBITED
          const obfuscated = obfuscator.obfuscate(code);
        });
      },
    },
  ],
});

// ❌ NEVER DO THIS - Hiding build steps
esbuild.build({
  plugins: [secretPlugin()], // Mystery plugin
});
```

## Source Code Standards

### Clear, Readable Code
```typescript
// ✅ Correct - clear variable and function names
async function processUserNote(file: TFile): Promise {
  const content = await this.app.vault.read(file);
  const metadata = this.extractMetadata(content);
  return { content, metadata, file };
}

// ❌ Wrong - obfuscated or unclear names
async function _p(f: any): Promise {
  const c = await this.app.vault.read(f);
  const m = this._e(c);
  return { c, m, f };
}
```

### No Hidden Functionality
```typescript
// ✅ Correct - all functionality is visible
export default class MyPlugin extends Plugin {
  async onload() {
    // All initialization is clear
    await this.loadSettings();
    this.addCommand({ /* ... */ });
    this.registerEvent(/* ... */);
  }
}

// ❌ Wrong - hidden initialization
export default class MyPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this._init(); // What does this do? Hidden functionality
  }

  private _init() {
    // Secret code that's not obvious
    eval(/* hidden behavior */);
  }
}
```

## Dependency Transparency

### Document All Dependencies
```json
// package.json - all dependencies visible
{
  "dependencies": {
    "axios": "^1.6.0",
    "marked": "^11.0.0"
  },
  "devDependencies": {
    "obsidian": "latest",
    "typescript": "5.2.2",
    "esbuild": "0.19.8"
  }
}
```

### No Hidden Dependencies
```typescript
// ✅ Correct - dependencies in package.json and bundled
import axios from 'axios';
import { marked } from 'marked';

// ❌ Wrong - loading external scripts at runtime
async function onload() {
  // Loading unknown code from internet - PROHIBITED
  const script = document.createElement('script');
  script.src = 'https://unknown-cdn.com/library.js';
  document.body.appendChild(script);
}
```

### Audit Dependencies
```bash
# Check for vulnerabilities
npm audit

# Review dependencies
npm list

# Keep dependencies updated
npm update
```

## Version Control

### Meaningful Commit Messages
```bash
# ✅ Good commit messages
git commit -m "feat: add task export to CSV"
git commit -m "fix: resolve file reading error on Windows"
git commit -m "docs: update README with new settings"

# ❌ Bad commit messages
git commit -m "update"
git commit -m "fix stuff"
git commit -m "wip"
```

### No Sensitive Data in History
```bash
# Check before committing
git status
git diff

# Never commit:
# - API keys
# - Passwords
# - Private keys
# - User data
# - Debug logs with sensitive info
```

### Use .gitignore
```
# .gitignore
node_modules/
*.log
.DS_Store
.env
*.key
secrets/
```

## Release Process Transparency

### GitHub Releases
Every version must have a GitHub release with:
1. Version tag (e.g., `1.0.0` without `v` prefix)
2. Release notes
3. Built files (`main.js`, `manifest.json`, `styles.css`)

### Release Notes
```markdown
# Release 1.2.0

## Features
- Added task export to CSV
- New keyboard shortcut for quick capture

## Bug Fixes
- Fixed file reading error on Windows
- Resolved memory leak in background sync

## Changes
- Updated minimum Obsidian version to 1.4.0
- Improved error messages

## Breaking Changes
None
```

### Automated Release Workflow
```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - '*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            main.js
            manifest.json
            styles.css
```

## Code Review Process

### Self-Review Checklist
Before submitting, review your code for:
- [ ] Clear, descriptive names
- [ ] No obfuscation
- [ ] No hidden functionality
- [ ] All network requests documented
- [ ] No hardcoded secrets
- [ ] No client-side telemetry
- [ ] Dependencies are necessary and safe
- [ ] Build process is transparent
- [ ] README is comprehensive

### Make Code Review-Friendly
```typescript
// ✅ Good - easy to review
class DataService {
  /**
   * Fetches data from the configured API endpoint.
   * Requires API key to be set in settings.
   */
  async fetchData(): Promise {
    if (!this.settings.apiKey) {
      throw new Error('API key not configured');
    }

    const response = await fetch(this.settings.apiUrl, {
      headers: {
        'Authorization': `Bearer ${this.settings.apiKey}`,
      },
    });

    return response.json();
  }
}

// ❌ Bad - hard to review
class DS {
  async fd(): Promise {
    if (!this.s.k) throw new Error('E1');
    const r = await fetch(this.s.u, {
      headers: { 'Authorization': `Bearer ${this.s.k}` },
    });
    return r.json();
  }
}
```

## Documentation Requirements

### README.md Must Include
1. Plugin description
2. Features list
3. Installation instructions
4. Usage guide with examples
5. Settings explanation
6. Network usage (if applicable)
7. Privacy policy link (if collecting data)
8. License
9. Support/contact information

### Code Comments
```typescript
// Document complex logic
// Document WHY, not WHAT
// Keep comments updated with code

// ✅ Good comment
// We poll every 5 seconds because Obsidian doesn't
// expose a file-watch event for external changes.
// See: https://github.com/obsidianmd/obsidian-api/issues/123
this.registerInterval(setInterval(() => {
  this.checkForChanges();
}, 5000));

// ❌ Bad comment (states the obvious)
// Set interval to 5000
this.registerInterval(setInterval(() => {
  this.checkForChanges();
}, 5000));
```

## License Requirements
Must include an open source license:
- MIT (recommended)
- Apache 2.0
- GPL v3
- Other OSI-approved licenses

```
# LICENSE

MIT License

Copyright (c) 2024 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[Full MIT license text]

# Plugin Submission Requirements

## Pre-Submission Checklist

### ✅ Must Have Before Submission
- [ ] Plugin is functional and tested
- [ ] GitHub repository is public
- [ ] README.md exists and is comprehensive
- [ ] manifest.json is properly configured
- [ ] versions.json is properly configured
- [ ] Initial release (1.0.0 or similar) is created
- [ ] main.js is built and included in release
- [ ] LICENSE file exists
- [ ] No code obfuscation
- [ ] No client-side telemetry
- [ ] All network usage is documented
- [ ] Code follows Obsidian developer policies

## Repository Structure

### Required Files (root level)
```
my-plugin/
├── main.js              # Built plugin code
├── manifest.json        # Plugin metadata
├── styles.css           # Optional: CSS styles
├── versions.json        # Version compatibility
├── README.md            # Documentation
└── LICENSE              # Open source license
```

### Required Files (GitHub release)
Each release must include:
1. `main.js` - Bundled plugin code
2. `manifest.json` - Plugin manifest
3. `styles.css` - If plugin uses custom styles

**Important**: Upload these files as binary attachments, NOT just in source.zip

## manifest.json Requirements

### Required Fields
```json
{
  "id": "my-unique-plugin-id",
  "name": "My Plugin Name",
  "version": "1.0.0",
  "minAppVersion": "1.0.0",
  "description": "A clear, concise description of what the plugin does.",
  "author": "Your Name",
  "authorUrl": "https://github.com/yourusername",
  "isDesktopOnly": false
}
```

### Field Guidelines

#### `id`
- Must be unique across all Obsidian plugins
- Use kebab-case (lowercase with hyphens)
- Should be descriptive
- Cannot be changed after submission
- Examples: `task-tracker`, `obsidian-git`, `calendar-widget`

```json
// ✅ Good IDs
"id": "advanced-tables"
"id": "kanban-board"
"id": "note-refactor"

// ❌ Bad IDs
"id": "plugin"         // Too generic
"id": "MyPlugin"       // Not kebab-case
"id": "plugin_name"    // Use hyphens, not underscores
```

#### `name`
- Human-readable display name
- Can contain spaces and capital letters
- Should be clear and descriptive
- Shows up in Obsidian's plugin browser

```json
// ✅ Good names
"name": "Advanced Tables"
"name": "Kanban Board"
"name": "Note Refactor"

// ❌ Bad names
"name": "AT"              // Too abbreviated
"name": "The Best Plugin" // Not descriptive
"name": "Plugin"          // Too generic
```

#### `version`
- Must use semantic versioning (MAJOR.MINOR.PATCH)
- Must match GitHub release tag exactly
- Must be incremented for each release

```json
// ✅ Correct versioning
"version": "1.0.0"   // Initial release
"version": "1.1.0"   // New feature
"version": "1.1.1"   // Bug fix
"version": "2.0.0"   // Breaking change

// ❌ Wrong versioning
"version": "v1.0.0"  // No 'v' prefix
"version": "1.0"     // Must have three parts
"version": "latest"  // Must be specific version
```

#### `minAppVersion`
- Minimum Obsidian version required
- Use actual version numbers (e.g., "1.0.0", "1.4.5")
- Test with specified version before submitting

```json
"minAppVersion": "1.4.0"  // Requires Obsidian 1.4.0+
```

#### `description`
- Clear explanation of what plugin does
- 1-2 sentences, concise
- No marketing language
- Shows in plugin browser

```json
// ✅ Good description
"description": "Manage tasks with due dates, priorities, and tags. Integrates with daily notes."

// ❌ Bad description
"description": "The best task manager you'll ever use! Amazing features!" // Too marketing-y
"description": "Plugin"  // Too vague
```

#### `author`
- Your name or username
- Will be displayed publicly

```json
"author": "John Doe"
// or
"author": "johndoe"
```

#### `authorUrl`
- Link to your website or GitHub profile
- Must be HTTPS
- Should be a permanent URL

```json
"authorUrl": "https://github.com/yourusername"
// or
"authorUrl": "https://yourwebsite.com"
```

#### `isDesktopOnly`
- Set to `true` only if plugin uses Node.js/Electron APIs
- Set to `false` if plugin works on mobile
- Most plugins should be `false`

```json
"isDesktopOnly": false  // Works on mobile
"isDesktopOnly": true   // Desktop only (uses fs, child_process, etc.)
```

#### `fundingUrl` (Optional)
- Link(s) for users to support development
- Single URL or multiple platforms

```json
// Single URL
"fundingUrl": "https://buymeacoffee.com/username"

// Multiple URLs
"fundingUrl": {
  "Buy Me a Coffee": "https://buymeacoffee.com/username",
  "GitHub Sponsor": "https://github.com/sponsors/username",
  "PayPal": "https://paypal.me/username"
}
```

## versions.json Requirements

Maps plugin versions to minimum Obsidian versions:

```json
{
  "1.0.0": "0.15.0",
  "1.1.0": "1.0.0",
  "1.2.0": "1.4.0"
}
```

**Purpose**: Allows older Obsidian versions to install compatible plugin versions.

**When to update**:
- When you use new Obsidian API features
- When you increase `minAppVersion` in manifest
- For every new release

## README.md Requirements

### Minimum README Structure
```markdown
# Plugin Name

Brief description of what the plugin does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

### Community Plugins
1. Open Settings in Obsidian
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Plugin Name"
4. Install and enable the plugin

### Manual Installation
1. Download the latest release
2. Extract files to `.obsidian/plugins/plugin-name/`
3. Reload Obsidian
4. Enable plugin in Settings

## Usage

Explain how to use the plugin with examples.

### Basic Usage
Step by step instructions.

### Settings
- **Setting 1**: What it does
- **Setting 2**: What it does

## Network Usage
(If applicable) This plugin connects to:
- Service name (URL)
  - Purpose: Why it connects
  - Data sent: What information is transmitted

## Privacy
(If applicable) Link to privacy policy.

## Support

Report issues: [GitHub Issues](https://github.com/user/repo/issues)

## License

[License Type] - see [LICENSE](LICENSE)
```

### Additional README Sections (Recommended)
- Screenshots or GIFs
- Roadmap
- Contributing guidelines
- Changelog
- FAQ
- Credits/Acknowledgments

## GitHub Release Requirements

### Creating a Release

1. **Tag version**: Must match `version` in manifest.json exactly
   - ✅ Correct: `1.0.0`
   - ❌ Wrong: `v1.0.0`, `1.0`, `release-1.0.0`

2. **Release title**: Can be anything, but version number recommended
   - Example: `1.0.0` or `Version 1.0.0`

3. **Release description**: Include changelog

```markdown
## Features
- Added new command for...
- Improved performance of...

## Bug Fixes
- Fixed issue with...
- Resolved crash when...

## Changes
- Updated minimum Obsidian version to 1.4.0
```

4. **Attach files**:
   - `main.js` (required)
   - `manifest.json` (required)
   - `styles.css` (if used)

### Release Workflow

```bash
# 1. Update version in manifest.json
{
  "version": "1.1.0"
}

# 2. Update versions.json
{
  "1.1.0": "1.0.0"
}

# 3. Build plugin
npm run build

# 4. Commit changes
git add manifest.json versions.json
git commit -m "chore: bump version to 1.1.0"

# 5. Create tag
git tag 1.1.0

# 6. Push
git push && git push --tags

# 7. Create GitHub release
# - Tag: 1.1.0
# - Upload: main.js, manifest.json, styles.css
```

### Automated Release

Use GitHub Actions:

```yaml
# .github/workflows/release.yml
name: Release Plugin

on:
  push:
    tags:
      - '*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            main.js
            manifest.json
            styles.css
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Submission Process

### 1. Prepare Repository
- Ensure all requirements are met
- Create initial release (1.0.0 recommended)
- Test plugin thoroughly

### 2. Submit to Community Plugins

1. Fork https://github.com/obsidianmd/obsidian-releases
2. Edit `community-plugins.json`
3. Add your plugin to the end of the list:

```json
{
  "id": "my-plugin-id",
  "name": "My Plugin Name",
  "author": "Your Name",
  "description": "Plugin description",
  "repo": "username/repository-name"
}
```

4. Create pull request
5. Fill out the submission checklist

### 3. Submission Checklist (from PR template)

When you create the PR, you'll see a checklist. Example:

```markdown
- [ ] I have tested the plugin on:
  - [ ] Windows
  - [ ] macOS
  - [ ] Linux
  - [ ] Android (if applicable)
  - [ ] iOS (if applicable)
- [ ] My GitHub release contains all required files
  - [ ] main.js
  - [ ] manifest.json
  - [ ] styles.css (if applicable)
- [ ] GitHub release name matches version in manifest.json
- [ ] The `id` in manifest.json matches the `id` in community-plugins.json
- [ ] My README.md describes the plugin's purpose and provides usage instructions
- [ ] I have read the developer policies at https://docs.obsidian.md/Developer+policies
- [ ] I have assessed my plugin's adherence to these policies
```

### 4. Review Process
- Obsidian team will review your submission
- May request changes or clarifications
- Review can take several days to weeks
- Address any feedback promptly

### 5. After Approval
- Plugin will appear in Obsidian's community plugins browser
- Announce on Discord in #updates channel
- Announce on forum in "Share & Showcase"

## Post-Submission

### Updating Your Plugin

1. Make changes
2. Update version in manifest.json
3. Update versions.json if needed
4. Build plugin
5. Create new GitHub release
6. Users will be notified of update

### Maintenance
- Respond to issues on GitHub
- Keep dependencies updated
- Test with new Obsidian releases
- Follow Obsidian API changes

### Deprecation
If you need to deprecate your plugin:
1. Update README with deprecation notice
2. Keep working for existing users
3. Recommend alternatives if available

## Common Rejection Reasons

- Code obfuscation
- Client-side telemetry
- Undocumented network usage
- Missing required files
- Version mismatch between manifest and release
- Incomplete README
- Repository not public
- Doesn't follow developer policies
- Plugin ID conflicts with existing plugin
- Not functional or severely buggy
```

---

(Continue with remaining plugin-core, api-interactions, and ui-components standards sections...)

## Usage Instructions

### Installation

1. Create the folder structure in your Agent OS installation:
```bash
mkdir -p ~/agent-os/profiles/obsidian/standards/{global,plugin-core,api-interactions,ui-components,developer-policies}
```

2. Copy each standard into its corresponding file

3. Update your Agent OS profile's workflow injection points:
```yaml
# For general plugin development
standards:
  - global/*
  - plugin-core/*
  - api-interactions/*
  - ui-components/*
  - developer-policies/*

# For UI-focused work
standards:
  - global/*
  - ui-components/*
  - plugin-core/lifecycle-hooks.md

# For data/API work
standards:
  - global/*
  - api-interactions/*
  - plugin-core/event-handling.md
```

### Key Policy Reminders

**NEVER:**
- Use client-side telemetry libraries
- Obfuscate code
- Hide network requests
- Hardcode API keys or secrets

**ALWAYS:**
- Document all network usage
- Keep code transparent and readable
- Follow semantic versioning
- Include comprehensive README
- Test on all platforms (desktop + mobile if applicable)

---

## References

- [Obsidian Developer Documentation](https://docs.obsidian.md/)
- [Obsidian API Repository](https://github.com/obsidianmd/obsidian-api)
- [Sample Plugin Template](https://github.com/obsidianmd/obsidian-sample-plugin)
- [Plugin Submission Repo](https://github.com/obsidianmd/obsidian-releases)
- [Obsidian Privacy Policy](https://obsidian.md/privacy)
- [Obsidian Security](https://obsidian.md/security)
- [Agent OS Standards Guide](https://buildermethods.com/agent-os/standards)
