# Validation Standards

## Input Validation Principles
- Validate all external input (user, file, network)
- Fail fast with clear error messages
- Use type guards for runtime validation
- Never trust data from external sources

## User Input Validation

### Text Input
```typescript
function validateFileName(name: string): boolean {
  if (!name || name.trim() === '') {
    new Notice('File name cannot be empty');
    return false;
  }

  if (name.length > 255) {
    new Notice('File name too long (max 255 characters)');
    return false;
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (invalidChars.test(name)) {
    new Notice('File name contains invalid characters');
    return false;
  }

  return true;
}

// Usage in input modal
class FileNameModal extends Modal {
  onOpen() {
    const { contentEl } = this;

    const input = contentEl.createEl('input', {
      type: 'text',
      placeholder: 'Enter file name...',
    });

    contentEl.createEl('button', {
      text: 'Create',
    }).addEventListener('click', () => {
      const name = input.value;

      if (validateFileName(name)) {
        this.createFile(name);
        this.close();
      }
    });
  }
}
```

### Numeric Input
```typescript
function validateInterval(value: number): boolean {
  if (!Number.isFinite(value)) {
    new Notice('Invalid number');
    return false;
  }

  if (value < 10 || value > 3600) {
    new Notice('Interval must be between 10 and 3600 seconds');
    return false;
  }

  return true;
}

// Setting with validation
new Setting(containerEl)
  .setName('Refresh Interval')
  .addSlider(slider => slider
    .setLimits(10, 3600, 10)
    .setValue(this.plugin.settings.refreshInterval)
    .onChange(async (value) => {
      if (validateInterval(value)) {
        this.plugin.settings.refreshInterval = value;
        await this.plugin.saveSettings();
      }
    }));
```

### URL Validation
```typescript
function validateUrl(url: string): boolean {
  if (!url || url.trim() === '') {
    new Notice('URL cannot be empty');
    return false;
  }

  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      new Notice('URL must use HTTP or HTTPS');
      return false;
    }

    return true;
  } catch (error) {
    new Notice('Invalid URL format');
    return false;
  }
}

// Example usage
async function fetchData(url: string): Promise {
  if (!validateUrl(url)) {
    throw new Error('Invalid URL');
  }

  const response = await fetch(url);
  return response.json();
}
```

## File Validation

### File Existence and Type
```typescript
function validateFile(file: TFile | null): file is TFile {
  if (!file) {
    new Notice('No file selected');
    return false;
  }

  if (file.extension !== 'md') {
    new Notice('Only markdown files are supported');
    return false;
  }

  return true;
}

// Usage with type guard
async function processFile(file: TFile | null): Promise {
  if (!validateFile(file)) {
    return; // TypeScript knows file is null or wrong type
  }

  // TypeScript knows file is TFile and extension is 'md'
  const content = await this.app.vault.read(file);
  // ...
}
```

### File Size Limits
```typescript
function validateFileSize(file: TFile, maxSizeMB = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.stat.size > maxBytes) {
    new Notice(`File too large (max ${maxSizeMB}MB)`);
    return false;
  }

  return true;
}
```

### File Content Validation
```typescript
async function validateMarkdownContent(file: TFile): Promise {
  try {
    const content = await this.app.vault.read(file);

    if (content.length === 0) {
      new Notice('File is empty');
      return false;
    }

    if (content.length > 1_000_000) {
      new Notice('File content too large');
      return false;
    }

    return true;
  } catch (error) {
    new Notice('Failed to read file');
    return false;
  }
}
```

## Settings Validation

### Load Settings with Validation
```typescript
async function loadSettings(): Promise {
  const loaded = await this.loadData();

  // Merge with defaults
  this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded);

  // Validate and fix settings
  this.validateSettings();
}

function validateSettings(): void {
  // Validate refresh interval
  if (this.settings.refreshInterval < 10) {
    console.warn('Refresh interval too low, using minimum');
    this.settings.refreshInterval = 10;
  }

  if (this.settings.refreshInterval > 3600) {
    console.warn('Refresh interval too high, using maximum');
    this.settings.refreshInterval = 3600;
  }

  // Validate API key format
  if (this.settings.apiKey &&
      !/^[a-zA-Z0-9_-]{20,}$/.test(this.settings.apiKey)) {
    console.warn('Invalid API key format, clearing');
    this.settings.apiKey = '';
    this.settings.enabled = false;
  }

  // Validate folder path
  if (this.settings.folderPath) {
    const folder = this.app.vault.getAbstractFileByPath(
      this.settings.folderPath
    );

    if (!folder || !(folder instanceof TFolder)) {
      console.warn('Invalid folder path, using default');
      this.settings.folderPath = '';
    }
  }
}
```

## API Response Validation

### Type Guards
```typescript
interface ApiResponse {
  status: 'success' | 'error';
  data?: any;
  error?: string;
}

function isValidApiResponse(obj: any): obj is ApiResponse {
  return (
    obj &&
    typeof obj === 'object' &&
    'status' in obj &&
    (obj.status === 'success' || obj.status === 'error')
  );
}

async function fetchFromApi(url: string): Promise {
  const response = await fetch(url);
  const data = await response.json();

  if (!isValidApiResponse(data)) {
    throw new Error('Invalid API response format');
  }

  return data;
}
```

### Schema Validation
```typescript
interface UserData {
  id: string;
  name: string;
  email: string;
  age?: number;
}

function validateUserData(data: any): data is UserData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (typeof data.id !== 'string' || data.id.trim() === '') {
    return false;
  }

  if (typeof data.name !== 'string' || data.name.trim() === '') {
    return false;
  }

  if (typeof data.email !== 'string' || !data.email.includes('@')) {
    return false;
  }

  if (data.age !== undefined &&
      (typeof data.age !== 'number' || data.age < 0)) {
    return false;
  }

  return true;
}

// Usage
async function loadUserData(id: string): Promise {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  if (!validateUserData(data)) {
    throw new Error('Invalid user data received');
  }

  return data;
}
```

## Network Request Validation

### Request Validation
```typescript
interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers?: Record;
  body?: any;
}

function validateRequest(options: RequestOptions): boolean {
  // Validate URL
  if (!validateUrl(options.url)) {
    return false;
  }

  // Validate method
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  if (!validMethods.includes(options.method)) {
    console.error('Invalid HTTP method:', options.method);
    return false;
  }

  // Validate body for non-GET requests
  if (options.method !== 'GET' && !options.body) {
    console.warn('POST/PUT/DELETE without body');
  }

  return true;
}
```

### Response Validation
```typescript
async function fetchWithValidation(url: string): Promise {
  // Validate request
  if (!validateUrl(url)) {
    throw new Error('Invalid URL');
  }

  // Make request
  const response = await fetch(url);

  // Validate response status
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Validate content type
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Response is not JSON');
  }

  // Parse and return
  return await response.json();
}
```

## Data Sanitization

### HTML Sanitization
```typescript
function sanitizeHtml(html: string): string {
  // Create temporary element
  const temp = document.createElement('div');
  temp.textContent = html; // This escapes HTML
  return temp.innerHTML;
}

// For displaying user content
contentEl.createEl('div', {
  text: sanitizeHtml(userInput),
});
```

### Path Sanitization
```typescript
function sanitizePath(path: string): string {
  // Remove leading/trailing slashes
  path = path.trim().replace(/^\/+|\/+$/g, '');

  // Remove double slashes
  path = path.replace(/\/+/g, '/');

  // Remove parent directory references
  path = path.replace(/\.\./g, '');

  return path;
}
```

## Batch Validation

### Array Validation
```typescript
function validateFileList(files: any[]): files is TFile[] {
  if (!Array.isArray(files)) {
    new Notice('Invalid file list');
    return false;
  }

  if (files.length === 0) {
    new Notice('No files selected');
    return false;
  }

  if (files.length > 100) {
    new Notice('Too many files selected (max 100)');
    return false;
  }

  // Check all items are TFile instances
  const allValid = files.every(f => f instanceof TFile);
  if (!allValid) {
    new Notice('Invalid file in selection');
    return false;
  }

  return true;
}
```

## Validation Utilities

### Reusable Validators
```typescript
const Validators = {
  isNonEmptyString(value: any): value is string {
    return typeof value === 'string' && value.trim() !== '';
  },

  isPositiveNumber(value: any): value is number {
    return typeof value === 'number' &&
           Number.isFinite(value) &&
           value > 0;
  },

  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  },

  hasRequiredKeys(
    obj: any,
    keys: (keyof T)[]
  ): obj is T {
    return keys.every(key => key in obj);
  },
};

// Usage
if (Validators.isNonEmptyString(input)) {
  // TypeScript knows input is string
  processInput(input);
}

if (Validators.isPositiveNumber(value)) {
  // TypeScript knows value is number > 0
  calculateResult(value);
}
```

## Error Messages for Validation Failures
```typescript
const ValidationMessages = {
  EMPTY_INPUT: 'Input cannot be empty',
  INVALID_FORMAT: 'Invalid format',
  OUT_OF_RANGE: (min: number, max: number) =>
    `Value must be between ${min} and ${max}`,
  FILE_TOO_LARGE: (max: number) =>
    `File too large (max ${max}MB)`,
  INVALID_URL: 'Invalid URL format',
  NETWORK_ERROR: 'Network request failed',
};

// Usage
function validateInterval(value: number): boolean {
  if (!Validators.isPositiveNumber(value)) {
    new Notice(ValidationMessages.INVALID_FORMAT);
    return false;
  }

  if (!Validators.isInRange(value, 10, 3600)) {
    new Notice(ValidationMessages.OUT_OF_RANGE(10, 3600));
    return false;
  }

  return true;
}
```
