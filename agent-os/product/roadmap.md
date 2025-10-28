# Note Builder - Product Roadmap

## Current State (v1.0.6)

### Shipped Features
- ✅ Voice recording with MediaRecorder API
- ✅ Audio file upload (drag-and-drop or button)
- ✅ OpenAI Whisper transcription
- ✅ Summary generation with customizable prompts
- ✅ Task extraction from voice notes
- ✅ Reflex note generation
- ✅ Custom prompt processing
- ✅ Memo merging (combine old and new)
- ✅ Customizable output formats
- ✅ Model selection per operation
- ✅ Language preference settings
- ✅ Custom recording folder specification
- ✅ Desktop and mobile support

### Known Technical Debt
- Client-side OpenAI API usage (`dangerouslyAllowBrowser: true`)
- No streaming transcription
- Limited error handling and retry logic
- No offline mode or caching
- Modal-heavy UI (could benefit from alternative interfaces)

---

## Phase 1: Stability & Quality of Life (Next Release)

**Goal**: Improve reliability, user experience, and address common pain points

### P0 - Critical Improvements
- **Enhanced Error Handling**
  - Graceful API failure recovery with user-friendly messages
  - Retry logic for network failures
  - Rate limit detection and handling
  - File size validation before upload

- **Performance Optimization**
  - Progress indicators for long transcriptions
  - Cancellable operations
  - Reduce bundle size if possible

- **User Experience Polish**
  - Keyboard shortcuts for recording start/stop
  - Audio playback preview before processing
  - Transcription preview before AI processing
  - Loading states and better feedback

### P1 - Quality Improvements
- **Settings UI Enhancement**
  - Prompt editor with syntax highlighting
  - Template variable documentation
  - Model cost calculator/estimator
  - Test prompts with sample transcriptions

- **Recording Improvements**
  - Audio level meter during recording
  - Recording time limit warnings
  - Multiple audio format support

---

## Phase 2: Power User Features (Q2 2025)

**Goal**: Enable advanced workflows and customization

### P0 - Advanced Features
- **Template System Expansion**
  - More template variables (note title, vault path, current time, etc.)
  - Conditional logic in templates
  - Template library/sharing
  - Per-folder default templates

- **Batch Processing**
  - Process multiple audio files at once
  - Bulk transcription without AI processing
  - Queue management for API calls

- **Integration Enhancements**
  - Insert at cursor position (not just append)
  - Create new note from voice (don't require open note)
  - Daily note integration
  - Tasks plugin integration
  - Dataview compatibility

### P1 - Workflow Features
- **Smart Defaults**
  - Remember last used settings per command
  - Workspace-specific configurations
  - Time-of-day based prompt selection

- **Output Management**
  - History of generated notes
  - Undo/regenerate with different prompts
  - Compare multiple AI outputs

---

## Phase 3: Intelligence & Automation (Q3 2025)

**Goal**: Leverage AI more effectively and reduce manual steps

### P0 - AI Enhancements
- **Streaming Transcription**
  - Real-time transcription display
  - Faster perceived performance
  - Earlier error detection

- **Smart Processing**
  - Auto-detect note type from content (summary vs. task vs. reflex)
  - Multi-section output (summary + tasks in one pass)
  - Context-aware prompts (time of day, note location, etc.)

- **Voice Commands**
  - Voice-activated plugin commands
  - Navigate vault with voice
  - Edit notes via voice instructions

### P1 - Intelligent Features
- **Learning & Adaptation**
  - Remember user edits to improve future generations
  - Suggest prompt improvements
  - Personalized output style

- **Multi-Modal Input**
  - Image + voice note support
  - Screenshot annotation via voice
  - Link extraction from speech

---

## Phase 4: Scale & Collaboration (Q4 2025)

**Goal**: Support team workflows and reduce costs

### P0 - Alternative AI Backends
- **Local AI Support**
  - Whisper.cpp for local transcription
  - Ollama/LM Studio integration for privacy
  - Fallback chain (local → cloud)

- **Multiple Provider Support**
  - Azure OpenAI
  - Anthropic Claude for text generation
  - Google Speech-to-Text
  - Custom API endpoints

### P1 - Collaboration Features
- **Shared Configurations**
  - Export/import prompt templates
  - Team workspace settings
  - Prompt marketplace/community

- **Advanced Workflows**
  - Scheduled processing (record now, process later)
  - Webhook integrations
  - API for other plugins

---

## Phase 5: Mobile-First & Accessibility (2026)

**Goal**: Perfect mobile experience and ensure accessibility

### P0 - Mobile Optimization
- **Mobile-Specific UI**
  - Simplified modal interfaces
  - Quick action buttons
  - Gesture controls

- **Offline Capabilities**
  - Queue recordings for later processing
  - Local storage management
  - Sync status indicators

### P1 - Accessibility
- **Inclusive Design**
  - Screen reader support
  - High contrast themes
  - Configurable UI sizing
  - Alternative input methods

---

## Future Considerations (Backlog)

### Ideas Under Evaluation
- Multi-language transcription and translation
- Speaker diarization (identify multiple speakers)
- Emotion/sentiment detection
- Meeting note generation (long-form audio)
- Voice note threading (related memos)
- Integration with external voice recorders
- Export to other formats (Markdown, PDF, etc.)
- Voice note search within plugin

### Research Areas
- Real-time collaboration on voice notes
- Voice-based graph navigation
- Audio compression before API calls
- Privacy-preserving transcription
- Cost optimization strategies

---

## Release Cadence

- **Patch releases**: As needed for bug fixes
- **Minor releases**: Monthly for new features
- **Major releases**: Quarterly for significant changes

## Success Criteria by Phase

### Phase 1
- 50% reduction in error reports
- 90%+ user satisfaction with reliability
- <3s perceived load time for common operations

### Phase 2
- 30%+ adoption of advanced features
- 5+ community-shared templates
- Support for 3+ workflow integrations

### Phase 3
- 2x faster transcription with streaming
- 40% reduction in user edits needed
- Voice commands used by 20%+ of users

### Phase 4
- Local AI adoption by 25%+ of users
- 50% cost reduction via alternative providers
- Active prompt sharing community

### Phase 5
- 50%+ of usage on mobile
- WCAG 2.1 AA compliance
- Offline mode used by 30%+ of users
