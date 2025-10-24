# Error Handling Standards

## General Principles
- Always handle errors explicitly
- Provide user-friendly error messages
- Log technical details for debugging
- Never fail silently
- Clean up resources in error cases

## Try-Catch Blocks

### Async Operations
Always wrap async operations in try-catch:

```typescript
// ✅ Correct
async function saveNote(file: TFile, content: string): Promise<void> {
  try {
    await this.app.vault.modify(file, content);
    new Notice('Note saved successfully');
  } catch (error) {
    console.error('Failed to save note:', error);
    new Notice('Failed to save note. Please try again.');
  }
}

// ❌ Wrong
async function saveNote(file: TFile, content: string): Promise<void> {
  await this.app.vault.modify(file, content);
  new Notice('Note saved successfully');
}
```

### Specific Error Handling
Handle different error types appropriately:

```typescript
async function fetchData(url: string): Promise {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      // Network error
      console.error('Network error:', error);
      new Notice('Network error. Check your connection.');
    } else if (error instanceof SyntaxError) {
      // JSON parsing error
      console.error('Invalid response format:', error);
      new Notice('Received invalid data from server.');
    } else {
      // Other errors
      console.error('Unexpected error:', error);
      new Notice('An unexpected error occurred.');
    }

    throw error; // Re-throw if caller needs to handle
  }
}
```

## User-Facing Error Messages

### Be Specific and Actionable
```typescript
// ✅ Correct - specific and actionable
try {
  await this.api.authenticate(apiKey);
} catch (error) {
  new Notice(
    'Authentication failed. Please check your API key in settings.',
    8000
  );
}

// ❌ Wrong - vague
try {
  await this.api.authenticate(apiKey);
} catch (error) {
  new Notice('Error');
}
```

### Error Message Levels
```typescript
// Success
new Notice('✓ Task created successfully');

// Warning
new Notice('⚠ File already exists. Using new name.');

// Error
new Notice('✗ Failed to save. Please try again.');

// Info
new Notice('ℹ Processing 10 files...');
```

## Validation

### Input Validation
Validate inputs before processing:

```typescript
function processFile(file: TFile | null): void {
  // Validate file exists
  if (!file) {
    new Notice('No file selected');
    return;
  }

  // Validate file type
  if (file.extension !== 'md') {
    new Notice('Only markdown files are supported');
    return;
  }

  // Validate file size
  if (file.stat.size > 100_000_000) {
    new Notice('File too large (max 100MB)');
    return;
  }

  // Process file
  doProcess(file);
}
```

### Settings Validation
```typescript
async function loadSettings(): Promise {
  const data = await this.loadData();

  // Merge with defaults
  this.settings = Object.assign({}, DEFAULT_SETTINGS, data);

  // Validate settings
  if (this.settings.refreshInterval < 10) {
    console.warn('Refresh interval too low, using minimum value');
    this.settings.refreshInterval = 10;
  }

  if (!this.settings.apiKey || this.settings.apiKey.trim() === '') {
    console.warn('No API key configured');
    this.settings.enabled = false;
  }
}
```

## Error Logging

### Console Logging Levels
```typescript
// Development debugging (verbose)
console.log('Debug: Processing file', file.path);

// Important information
console.info('Plugin initialized with', this.settings);

// Warnings (non-critical issues)
console.warn('Deprecated setting found:', oldSetting);

// Errors (critical issues)
console.error('Failed to load data:', error);

// Grouped logging
console.group('File Processing');
console.log('Reading file:', file.path);
console.log('Content length:', content.length);
console.groupEnd();
```

### Error Context
Include context in error logs:

```typescript
try {
  await processFile(file);
} catch (error) {
  console.error('File processing error:', {
    file: file.path,
    size: file.stat.size,
    error: error,
    timestamp: new Date().toISOString(),
  });

  new Notice('Failed to process file');
}
```

## Async Error Handling

### Promise.all with Error Handling
```typescript
async function processMultipleFiles(files: TFile[]): Promise {
  const results = await Promise.allSettled(
    files.map(file => processFile(file))
  );

  const errors = results.filter(r => r.status === 'rejected');
  const successes = results.filter(r => r.status === 'fulfilled');

  if (errors.length > 0) {
    console.error(`Failed to process ${errors.length} files`);
    new Notice(
      `Processed ${successes.length}/${files.length} files. ` +
      `${errors.length} failed.`
    );
  } else {
    new Notice(`✓ Successfully processed ${files.length} files`);
  }
}
```

### Retry Logic
```typescript
async function fetchWithRetry(
  url: string,
  maxRetries = 3
): Promise {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Retry ${i + 1}/${maxRetries} failed:`, error);

      if (i < maxRetries - 1) {
        // Exponential backoff
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  }

  throw new Error(
    `Failed after ${maxRetries} retries: ${lastError!.message}`
  );
}
```

## Resource Cleanup

### Finally Block
```typescript
async function processWithCleanup(file: TFile): Promise {
  let tempFile: TFile | null = null;

  try {
    // Create temp file
    tempFile = await this.app.vault.create(
      'temp.md',
      'temporary content'
    );

    // Process
    await doProcessing(file, tempFile);

  } catch (error) {
    console.error('Processing failed:', error);
    throw error;

  } finally {
    // Clean up temp file even if error occurred
    if (tempFile) {
      try {
        await this.app.vault.delete(tempFile);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }
    }
  }
}
```

## Error Boundaries

### Plugin Load Errors
```typescript
async onload(): Promise {
  try {
    // Load settings
    await this.loadSettings();

    // Initialize services
    await this.initializeServices();

    // Register features
    this.registerCommands();
    this.registerEvents();

  } catch (error) {
    console.error('Failed to load plugin:', error);
    new Notice(
      'Failed to load plugin. Check console for details.',
      10000
    );

    // Disable plugin features
    this.settings.enabled = false;
  }
}
```

### Graceful Degradation
```typescript
async function loadRemoteData(): Promise {
  try {
    return await fetchFromServer();
  } catch (error) {
    console.warn('Failed to load remote data, using cached:', error);

    try {
      return await loadFromCache();
    } catch (cacheError) {
      console.error('Cache also failed:', cacheError);
      return null; // Return null instead of throwing
    }
  }
}
```

## Error Types

### Custom Error Classes
```typescript
class PluginError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PluginError';
  }
}

class ValidationError extends PluginError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

class NetworkError extends PluginError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

// Usage
function validateInput(input: string): void {
  if (!input || input.trim() === '') {
    throw new ValidationError('Input cannot be empty');
  }
}

try {
  validateInput(userInput);
} catch (error) {
  if (error instanceof ValidationError) {
    new Notice('Invalid input: ' + error.message);
  } else {
    throw error;
  }
}
```
