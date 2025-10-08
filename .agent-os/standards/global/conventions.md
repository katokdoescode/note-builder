# Naming and Code Conventions

## Naming Conventions

### Files and Folders
- **Kebab-case** for files and folders: `file-helper.ts`, `data-service.ts`
- **PascalCase** for class files: `TaskManager.ts`, `MyModal.ts`
- Entry point always named: `main.ts`

```
src/
├── main.ts
├── settings.ts
├── MyCustomModal.ts
├── commands/
│   ├── create-task.ts
│   └── delete-task.ts
└── utils/
    ├── file-helper.ts
    └── date-utils.ts
```

### Variables and Functions
- **camelCase** for variables, functions, and methods
- Descriptive names that indicate purpose
- Avoid abbreviations unless widely understood
- Boolean variables prefixed with `is`, `has`, `should`, `can`

```typescript
// ✅ Correct
const activeFile = this.app.workspace.getActiveFile();
const isEnabled = this.settings.enableFeature;
const hasPermission = checkUserPermission();
const shouldUpdate = data.version > currentVersion;
const canSave = validateData(content);

async function saveUserData(data: UserData): Promise<void> {
  // ...
}

function getUserById(id: string): User | null {
  // ...
}

// ❌ Wrong
const file = this.app.workspace.getActiveFile();
const enabled = this.settings.enableFeature;
const perm = checkUserPermission();

async function save(d: any) {
  // ...
}

function getUsr(i: string) {
  // ...
}
```

### Classes and Interfaces
- **PascalCase** for classes, interfaces, and types
- Interfaces don't require `I` prefix (TypeScript convention)
- Descriptive class names ending with their type

```typescript
// ✅ Correct
class TaskManager { }
class DataService { }
class MyCustomModal extends Modal { }

interface PluginSettings { }
interface UserData { }
interface ApiResponse { }

type FileType = 'markdown' | 'pdf' | 'image';
type ProcessingStatus = 'pending' | 'complete' | 'error';

// ❌ Wrong
class taskmanager { }
class DS { }

interface IPluginSettings { }
interface iUserData { }
```

### Constants
- **UPPER_SNAKE_CASE** for true constants (primitive values that never change)
- **camelCase** for configuration objects

```typescript
// ✅ Correct
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;
const API_BASE_URL = 'https://api.example.com';

const defaultSettings: PluginSettings = {
  apiKey: '',
  enabled: true,
  refreshInterval: 60,
};

// ❌ Wrong
const max_retry_attempts = 3;
const DefaultTimeout = 5000;

const DEFAULT_SETTINGS = {
  apiKey: '',
};
```

### Event Handlers
Prefix with `on` or `handle`:

```typescript
// ✅ Correct
onFileOpen(file: TFile): void { }
handleClick(evt: MouseEvent): void { }
onSettingChange(value: string): void { }

// ❌ Wrong
fileOpen(file: TFile): void { }
click(evt: MouseEvent): void { }
settingChange(value: string): void { }
```

### Private Members
Prefix with underscore (optional but recommended for clarity):

```typescript
class MyPlugin extends Plugin {
  // Public
  settings: PluginSettings;

  // Private - with underscore
  private _cache: Map;
  private _dataService: DataService;

  private _initializeServices(): void { }
}
```

## Plugin ID Convention
Plugin IDs in manifest.json:
- **kebab-case**
- Descriptive and unique
- Prefix with category if applicable

```json
{
  "id": "task-tracker",
  "id": "obsidian-git-sync",
  "id": "calendar-widget"
}
```

## Command ID Convention
Command IDs should be namespaced:

```typescript
this.addCommand({
  id: 'my-plugin:create-task',
  name: 'Create new task',
  callback: () => { }
});

this.addCommand({
  id: 'my-plugin:export-data',
  name: 'Export data to JSON',
  callback: () => { }
});
```

## CSS Class Naming
Use BEM-like convention with plugin prefix:

```css
.my-plugin-container { }
.my-plugin-header { }
.my-plugin-button { }
.my-plugin-button--primary { }
.my-plugin-button--disabled { }
.my-plugin-list__item { }
```

## Version Numbering
Follow semantic versioning (SemVer):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

```json
{
  "version": "1.0.0",  // Initial release
  "version": "1.1.0",  // New feature added
  "version": "1.1.1",  // Bug fix
  "version": "2.0.0"   // Breaking change
}
```

## Git Commit Messages
Follow conventional commits:

```
feat: add task export functionality
fix: resolve file reading error
docs: update README with new settings
refactor: reorganize service layer
style: format code with prettier
test: add unit tests for DataService
chore: update dependencies
```

## Folder Organization Best Practices

### Small Plugins (< 5 files)
```
src/
├── main.ts
├── settings.ts
└── types.ts
```

### Medium Plugins (5-15 files)
```
src/
├── main.ts
├── settings.ts
├── modals/
│   ├── InputModal.ts
│   └── ConfirmModal.ts
├── commands/
│   └── index.ts
└── utils/
    └── helpers.ts
```

### Large Plugins (> 15 files)
```
src/
├── main.ts
├── settings.ts
├── types/
│   ├── index.ts
│   └── api.ts
├── commands/
│   ├── create.ts
│   ├── edit.ts
│   └── delete.ts
├── modals/
│   ├── InputModal.ts
│   ├── ConfirmModal.ts
│   └── SettingsModal.ts
├── services/
│   ├── ApiService.ts
│   ├── DataService.ts
│   └── CacheService.ts
├── utils/
│   ├── file-utils.ts
│   ├── date-utils.ts
│   └── validation.ts
└── views/
    └── CustomView.tsz
```
