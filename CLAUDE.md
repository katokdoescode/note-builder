# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Note Builder is an Obsidian plugin that enables voice-to-text note creation using OpenAI's Whisper and ChatGPT APIs. It provides commands for recording audio, transcribing it, and generating structured notes (summaries, tasks, reflex notes) from voice input.

## Build and Development Commands

### Development
```bash
npm run dev
```
Starts esbuild in watch mode. Changes to TypeScript files are automatically compiled to `main.js`.

### Production Build
```bash
npm run build
```
Runs TypeScript type checking (without emitting files) and builds a minified production bundle.

### Version Bump
```bash
npm run version
```
Updates version in `manifest.json` and `versions.json`, then stages these files for commit.

## Architecture

### Core Components

**Main Plugin Class (`NoteBuilder` in main.ts)**
- Entry point extending Obsidian's `Plugin` class
- Registers two commands: "Create memo" and "Custom prompt"
- Manages settings persistence and AI instance initialization
- Settings are stored in `data.json` via Obsidian's `loadData()`/`saveData()` API

**Modal System (main.ts)**
- `MemoModal`: Primary UI for recording, transcription, and note generation (summary/tasks/reflex)
  - Supports both recording and file upload (drag-and-drop or button)
  - Provides checkboxes for merging with existing memo and saving voice files
  - Generates multiple output types (summary, tasks, reflex) that can be inserted together
- `CustomCommandModal`: Allows custom prompts for processing transcriptions
  - Three-step workflow: record/upload → enter custom prompt → preview result → insert

**AI Integration (`src/openai.ts`)**
- Wraps OpenAI SDK with `dangerouslyAllowBrowser: true` for client-side usage
- Methods:
  - `transcribe()`: Uses Whisper API for audio-to-text
  - `generateSummary()`, `generateTasks()`, `generateReflex()`: Use ChatGPT with customizable prompts and formats
  - `mergeMemo()`: Merges old and new memos
  - `generateCustomResponse()`: Processes transcription with user-defined prompts
- All generation methods inject current date and language settings via template replacement

**Prompts System (`src/prompts/`)**
- Template files (`summary.ts`, `tasks.ts`, `reflex.ts`) define default prompts and output formats
- Use placeholder syntax (`{{ transcription }}`, `{{ format }}`, `{{ otherInformation }}`)
- Users can customize prompts via settings

**Utilities**
- `src/utils/recording.ts`: `AudioRecorder` class wraps MediaRecorder API for browser audio capture
- `src/utils/files.ts`: File saving utilities for voice recordings
- `src/utils/dates.ts`: Date formatting for template injection

### Settings Architecture

Settings are managed through `NoteBuilderSettingTab` extending `PluginSettingTab`:
- OpenAI API key
- Language preference
- Recording directory configuration
- Model selection for each operation (transcription, summary, tasks, reflex, merge, custom)
- Custom prompts and output formats for each generation type

### Key Design Patterns

**Template-Based Generation**: All AI generations use template strings with placeholders replaced at runtime. This allows user customization while maintaining structure.

**Modal State Management**: Modals handle complex state including recording files, uploaded files, transcription, and multiple generation results. Fields are created lazily (e.g., summary/tasks/reflex fields only appear when button is clicked).

**Resource Cleanup**: `onClose()` methods properly dispose of MediaRecorder instances and clear temporary state.

## Important Development Notes

### Obsidian Plugin Standards (from .cursor/rules)
- Always use `this.app` for API access, never global `app` or `window.app`
- Use `registerEvent()` and `addCommand()` for automatic cleanup on unload
- Prefer Obsidian API over direct DOM manipulation
- Use `new Notice()` for user notifications, not `alert()`
- For vault operations, use `this.app.vault.getAbstractFileByPath()` instead of `getFiles().find()` for performance

### TypeScript Configuration
- Target: ES6/ES2018
- Strict null checks enabled
- Source maps inlined in development builds
- All `.ts` files are included in compilation

### Build System (esbuild.config.mjs)
- Entry: `main.ts`
- Output: `main.js` (bundled, CJS format)
- External modules: Obsidian API, Electron, CodeMirror
- Development mode: watch + inline sourcemaps
- Production mode: minification, no sourcemaps

### OpenAI API Usage
- API calls use `openai.responses.create()` with `input` parameter
- Client-side execution requires `dangerouslyAllowBrowser: true`
- Response format: `response.output_text`
- All responses include language and date context injection

## File Organization

```
main.ts                  # Plugin entry, modals, settings UI
src/
  openai.ts             # AI wrapper and all generation methods
  prompts/              # Default prompt templates
  utils/
    recording.ts        # Audio capture
    files.ts            # File operations
    dates.ts            # Date utilities
```
