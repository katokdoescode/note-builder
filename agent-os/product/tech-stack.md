# Note Builder - Tech Stack

## Overview

Note Builder is built as an Obsidian plugin using TypeScript and modern web technologies. The stack prioritizes developer experience, build performance, and seamless Obsidian integration.

---

## Frontend

### Core Language
- **TypeScript 4.7.4**
  - Strict type checking enabled
  - ES6/ES2018 target
  - Provides type safety for Obsidian API and OpenAI SDK

### UI Framework
- **Obsidian Plugin API (latest)**
  - Native modal system (`Modal` class)
  - Settings tab interface (`PluginSettingTab`)
  - Vault operations and file management
  - Event system for plugin lifecycle
  - No external UI framework needed

### Browser APIs
- **MediaRecorder API**
  - Audio capture from microphone
  - Supports desktop and mobile browsers
  - WebM/WAV audio formats
  - Handled via custom `AudioRecorder` class

### Component Architecture
- **Modal-based UI Pattern**
  - `MemoModal`: Primary recording and generation interface
  - `CustomCommandModal`: Custom prompt workflow
  - `NoteBuilderSettingTab`: Plugin configuration
  - State management within modal instances

---

## Build System

### Bundler
- **esbuild 0.25.0**
  - Fast TypeScript compilation
  - Bundle size optimization
  - Development watch mode
  - Production minification
  - CommonJS output for Obsidian compatibility

### Build Configuration
- **esbuild.config.mjs**
  - Entry: `main.ts`
  - Output: `main.js` (single bundle)
  - External modules: `obsidian`, `electron`, CodeMirror packages
  - Development: watch mode + inline sourcemaps
  - Production: minification, no sourcemaps

### Package Manager
- **npm**
  - Scripts: `dev`, `build`, `version`
  - Lockfile: `package-lock.json`

### Version Management
- **version-bump.mjs**
  - Automated version updates across `manifest.json` and `versions.json`
  - Git staging of version files

---

## AI & Machine Learning

### OpenAI Integration
- **OpenAI SDK 4.87.3**
  - Client-side usage (`dangerouslyAllowBrowser: true`)
  - Whisper API for transcription
  - GPT-4o for text generation (summary, tasks, reflex, custom)
  - Response format: `openai.responses.create()` with `input` parameter

### AI Models Used
- **whisper-1**: Audio transcription
- **gpt-4o**: Default for all text generation tasks
  - Summary generation
  - Task extraction
  - Reflex note creation
  - Memo merging
  - Custom prompt responses

### AI Architecture
- **Custom AI Wrapper** (`src/openai.ts`)
  - `AI` class encapsulates all OpenAI operations
  - Template-based prompt system with placeholder replacement
  - Configurable models per operation
  - Language and date context injection

---

## Data Storage

### Plugin Settings
- **Obsidian Data API**
  - Settings stored in `data.json` via `loadData()`/`saveData()`
  - Schema: API key, language, model selections, custom prompts/formats
  - No external database needed

### File Management
- **Obsidian Vault API**
  - `this.app.vault.getAbstractFileByPath()` for file operations
  - Recording storage in user-specified folders
  - File creation via `vault.create()` and `vault.adapter.write()`

### Audio Storage
- **Local File System**
  - Voice recordings saved as `.webm` or `.wav` files
  - User-configurable recording directory
  - No cloud storage by default

---

## Development Tools

### Type Checking
- **TypeScript Compiler**
  - `tsc -noEmit` for type validation
  - `skipLibCheck` enabled for performance
  - Run during production builds

### Linting
- **ESLint 5.29.0**
  - `@typescript-eslint/parser`
  - `@typescript-eslint/eslint-plugin`
  - Standard Obsidian plugin rules

### Code Quality
- **Cursor Rules** (`.cursor/rules/obsidian-plugin-rules.mdc`)
  - Obsidian best practices
  - API usage patterns
  - Resource cleanup guidelines

---

## Runtime Environment

### Platform Support
- **Desktop**: Electron (via Obsidian)
- **Mobile**: iOS and Android (via Obsidian mobile app)
- **Compatibility**: `minAppVersion: 0.15.0`

### Node Modules
- **Built-in Modules** (external to bundle)
  - Provided by Obsidian/Electron runtime
  - Declared in `builtin-modules` dependency

---

## Third-Party Dependencies

### Production
```json
{
  "openai": "^4.87.3"
}
```

### Development
```json
{
  "@types/node": "^16.11.6",
  "@typescript-eslint/eslint-plugin": "5.29.0",
  "@typescript-eslint/parser": "5.29.0",
  "builtin-modules": "3.3.0",
  "esbuild": "0.25.0",
  "obsidian": "latest",
  "tslib": "2.4.0",
  "typescript": "4.7.4"
}
```

---

## File Structure

```
note-builder/
├── main.ts                      # Plugin entry, modals, settings UI
├── manifest.json                # Plugin metadata
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── esbuild.config.mjs           # Build configuration
├── version-bump.mjs             # Version automation
├── src/
│   ├── openai.ts               # AI wrapper and methods
│   ├── prompts/                # Default prompt templates
│   │   ├── summary.ts
│   │   ├── tasks.ts
│   │   └── reflex.ts
│   └── utils/
│       ├── recording.ts        # AudioRecorder class
│       ├── files.ts            # File operations
│       └── dates.ts            # Date formatting
└── .cursor/
    └── rules/                  # Development guidelines
```

---

## Security Considerations

### API Key Management
- User-provided OpenAI API key stored in Obsidian's encrypted data
- Not hardcoded or shared externally
- Client-side API calls (user bears usage costs)

### Data Privacy
- No telemetry or analytics
- Audio processed via user's OpenAI account
- No third-party data sharing
- Local storage for recordings

### Browser Security
- `dangerouslyAllowBrowser: true` required for OpenAI SDK
- Risk: API key exposure in browser context
- Mitigation: Obsidian's desktop environment provides isolation

---

## Performance Characteristics

### Bundle Size
- Single `main.js` bundle
- OpenAI SDK included (~200KB+ after minification)
- Obsidian API externalized (not bundled)

### API Latency
- Transcription: 2-10 seconds (depends on audio length)
- Text generation: 3-15 seconds (depends on model and prompt complexity)
- No streaming (responses received as complete blocks)

### Resource Usage
- Audio recording: Minimal CPU, managed by MediaRecorder
- API calls: Network-bound, no local processing
- Memory: Modal instances and audio blobs (cleaned up on close)

---

## Future Stack Considerations

### Potential Additions
- **Whisper.cpp**: Local transcription (privacy, cost reduction)
- **Ollama/LM Studio**: Local LLM support
- **Alternative Providers**: Anthropic Claude, Azure OpenAI, Google STT
- **Streaming APIs**: Real-time transcription/generation
- **IndexedDB**: Client-side caching for offline mode
- **Web Workers**: Background processing for heavy operations

### Stack Constraints
- Must remain compatible with Obsidian plugin architecture
- Cannot use Node.js-specific modules (unless bundled)
- Must support both desktop (Electron) and mobile (WebView) environments
- Bundle size should remain reasonable (<1MB ideal)

---

## Development Workflow

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Watch mode for development
npm run build        # Production build
npm run version      # Bump version numbers
```

### Testing Strategy
- Manual testing in Obsidian (no automated tests currently)
- Test on both desktop and mobile
- Validate with different audio sources and lengths
- Verify API error handling with invalid keys

### Deployment
- Built plugin (`main.js`) copied to Obsidian vault plugins folder
- Published via Obsidian community plugins (pending)
- GitHub releases with `manifest.json` and `versions.json`

---

## Tech Stack Decision Log

### Why TypeScript?
- Type safety for complex Obsidian API
- Better IDE support and refactoring
- Standard for modern Obsidian plugins

### Why esbuild?
- 10-100x faster than webpack/rollup
- Simple configuration
- Excellent TypeScript support
- Recommended by Obsidian plugin template

### Why OpenAI SDK?
- Official, well-maintained library
- Supports both Whisper and ChatGPT APIs
- Type-safe API interactions
- Handles auth and error responses

### Why Modal-Based UI?
- Native Obsidian pattern
- Familiar to users
- Simple state management
- No need for React/Vue/Svelte

### Why Client-Side API Calls?
- Simplicity (no backend needed)
- User controls costs and data
- Faster development iteration
- Privacy (no middleman server)
