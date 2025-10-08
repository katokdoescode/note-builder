# Coding Style Standards

## TypeScript Style

### Formatting
- Use 2 spaces for indentation (not tabs)
- Maximum line length: 100 characters
- Use semicolons at the end of statements
- Single quotes for strings (except to avoid escaping)
- Trailing commas in multi-line objects/arrays

```typescript
// ✅ Correct
const settings: PluginSettings = {
  apiKey: '',
  enabled: true,
  interval: 60,
};

const message = 'Hello, world!';
const withApostrophe = "It's a nice day";

// ❌ Wrong
const settings: PluginSettings = {
  apiKey: "",
  enabled: true,
  interval: 60
}

const message = "Hello, world!"
```

### Code Organization
- One class per file (except for closely related helper classes)
- Group related functions together
- Declare variables close to where they're used
- Keep files under 300 lines when possible

### Import Order
```typescript
// 1. Obsidian imports
import { Plugin, Notice, TFile, MarkdownView } from 'obsidian';

// 2. Node.js imports (if isDesktopOnly: true)
import { readFileSync } from 'fs';
import { join } from 'path';

// 3. External dependencies
import axios from 'axios';

// 4. Local type imports
import type { PluginSettings, UserData } from './types';

// 5. Local module imports
import { MySettingTab } from './settings';
import { DataService } from './services/DataService';
```

### Class Member Order
```typescript
class MyPlugin extends Plugin {
  // 1. Public properties
  settings: PluginSettings;

  // 2. Private properties
  private dataService: DataService;
  private cache: Map;

  // 3. Lifecycle methods
  async onload() { }
  async onunload() { }

  // 4. Public methods (alphabetically)
  async loadNote(id: string) { }
  async saveNote(content: string) { }

  // 5. Private methods (alphabetically)
  private async initializeServices() { }
  private async validateData(data: any) { }

  // 6. Event handlers (prefixed with 'on' or 'handle')
  private handleFileOpen(file: TFile) { }
  private onSettingChange(value: string) { }
}
```

### Function Style
- Use async/await instead of promises
- Use arrow functions for callbacks
- Keep functions focused (single responsibility)
- Prefer explicit return types

```typescript
// ✅ Correct
async function processFile(file: TFile): Promise {
  const content = await this.app.vault.read(file);
  await this.saveData(content);
}

this.registerEvent(
  this.app.workspace.on('file-open', (file) => {
    this.handleFileOpen(file);
  })
);

// ❌ Wrong
function processFile(file) {
  return this.app.vault.read(file).then(content => {
    return this.saveData(content);
  });
}
```

### Whitespace
- One blank line between methods
- Two blank lines between classes
- No trailing whitespace
- Blank line at end of file

### Braces
- Use K&R style (opening brace on same line)
- Always use braces, even for single-line blocks

```typescript
// ✅ Correct
if (condition) {
  doSomething();
}

// ❌ Wrong
if (condition)
{
  doSomething();
}

if (condition) doSomething();
```
