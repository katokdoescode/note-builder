# Specification: Modal UI/UX Refactor

## Goal
Refactor all three Note Builder modals (MemoModal, CustomCommandModal, SmartMemoModal) to provide consistent, modern UI/UX with improved visual feedback, progressive disclosure, and mobile responsiveness while maintaining all existing functionality.

## User Stories
- As a user, I want to see a clean, uncluttered interface that reveals features progressively as I need them
- As a user, I want clear visual feedback during recording and processing operations
- As a user, I want protection against accidentally losing my work when closing modals
- As a mobile user, I want the modal to be fully usable on my device with appropriate sizing
- As a keyboard user, I want to navigate and control the modal without requiring a mouse
- As a user, I want consistent UI patterns across all modal types so I don't need to relearn interfaces

## Core Requirements

### Functional Requirements
#### Maintained Functionality (No Changes)
- Record audio via browser microphone using MediaRecorder API
- Upload audio files via drag-and-drop or file picker
- Transcribe audio using OpenAI Whisper API
- Generate summaries, tasks, and reflex notes from transcriptions
- Process transcriptions with custom prompts
- Merge new memos with existing ones
- Save voice files with attachments to notes
- Insert generated content into active note

#### New UI/UX Features
- **Horizontal Button Layout**: Centered button group at top of modal with Restart | Mic (60px) | Upload (45px)
- **Recording Timer**: Always-visible timer below mic button showing MM:SS (switching to HH:MM:SS after 59:59)
- **Progressive Disclosure**: Hide textareas initially, reveal only when content is generated
- **Loading State Animations**: Icon-based button animations during async operations
- **Data Loss Prevention**: Track dirty state and confirm before closing with unsaved changes
- **Consistent Styling**: Unified CSS classes across all three modals
- **Mobile Responsive**: 95vh height at 480px breakpoint for phones
- **Improved Feedback**: Replace statusEl with Notice() for all user notifications

### Non-Functional Requirements
- **Performance**: Timer updates and animations must not cause UI lag (use CSS transforms)
- **Accessibility**: ARIA labels, keyboard navigation, focus trap, screen reader announcements
- **Code Quality**: Reusable component patterns following single responsibility principle
- **Browser Compatibility**: Support all browsers that Obsidian supports

## Visual Design

### Current State (from mockups)
- Mockup reference: `planning/visuals/Create-memo-modal.png` - Shows vertical left-side button layout
- Mockup reference: `planning/visuals/Custom-prompt-modal.png` - Shows three always-visible sections
- Mockup reference: `planning/visuals/Smart-memo-modal.png` - Shows simpler layout with single textarea

### New Layout Structure
```
┌─────────────────────────────────────┐
│          Modal Title Bar            │
├─────────────────────────────────────┤
│                                     │
│    [↺] [🎤] [↑]  <- Centered       │
│         00:00                       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Progressive Content Area     │   │
│  │ (Hidden initially)           │   │
│  └─────────────────────────────┘   │
│                                     │
│    [Action Buttons] (Bottom)        │
└─────────────────────────────────────┘
```

## Reusable Components

### Existing Code to Leverage
- **Components**:
  - `.recording-wrapper` - Main container structure (keep)
  - `.recording-container` - Grid layout (modify for new layout)
  - `.recording-actions` - Action button container (keep)
- **Services**:
  - `AudioRecorder` class in `src/utils/recording.ts` (no changes)
  - OpenAI integration in `src/openai.ts` (no changes)
- **Patterns**:
  - Modal drag-and-drop overlay system (keep existing implementation)
  - File upload input pattern (keep existing)
  - Notice() usage for user feedback (extend to all notifications)

### New Components Required
- **Button Group Component**: Horizontal centered layout for top controls
- **Recording Timer Component**: Live updating timer display with format switching
- **Progressive Section Component**: Animated show/hide container for textareas
- **Loading Button Component**: Button with overlay animation during async operations
- **Dirty State Manager**: Track changes across all modal inputs

## Technical Approach

### Database
No database changes required - all UI/UX refactoring.

### API
No API changes required - maintain existing OpenAI integration.

### Frontend

#### CSS Architecture
```css
/* New CSS classes to add */
.button-group-horizontal {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 1rem 0;
}

.button-restart { width: 40px; height: 40px; }
.button-mic { width: 60px; height: 60px; }
.button-upload { width: 45px; height: 45px; }

.recording-timer {
  text-align: center;
  font-family: monospace;
  font-size: 1.2rem;
  margin-top: 0.5rem;
}

.progressive-section {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.progressive-section.active {
  max-height: 500px; /* Adjust as needed */
}

.button-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.7;
}

.button-loading::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile responsive */
@media (max-width: 480px) {
  .modal {
    height: 95vh;
    max-height: 95vh;
  }
}

/* Remove old animations */
/* Delete: .inner-glowing, .outer-glowing, .glowing-wrapper animations */
```

#### State Management
```typescript
interface ModalState {
  isDirty: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  recordingStartTime: number | null;
  recordingTimer: NodeJS.Timer | null;
  transcription: string;
  generatedContent: {
    summary?: string;
    tasks?: string;
    reflex?: string;
    custom?: string;
    formatted?: string;
  };
}

class BaseModal extends Modal {
  protected state: ModalState;

  protected isDirty(): boolean {
    // Check all tracked elements for changes
  }

  protected resetDirtyState(): void {
    this.state.isDirty = false;
  }

  protected confirmClose(): boolean {
    if (this.isDirty()) {
      return confirm('You have unsaved changes. Are you sure you want to close?');
    }
    return true;
  }

  onClose(): void {
    if (this.state.recordingTimer) {
      clearInterval(this.state.recordingTimer);
    }
    // Other cleanup
  }
}
```

#### Timer Implementation
```typescript
private startTimer(): void {
  this.state.recordingStartTime = Date.now();
  this.state.recordingTimer = setInterval(() => {
    this.updateTimerDisplay();
  }, 100); // Update every 100ms for smooth display
}

private updateTimerDisplay(): void {
  if (!this.state.recordingStartTime) return;

  const elapsed = Date.now() - this.state.recordingStartTime;
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  let display: string;
  if (hours > 0) {
    display = `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  } else {
    display = `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  this.timerEl.setText(display);
}
```

#### Progressive Disclosure
```typescript
private showSection(sectionEl: HTMLElement): void {
  sectionEl.addClass('active');
}

private hideSection(sectionEl: HTMLElement): void {
  sectionEl.removeClass('active');
}

private toggleSectionVisibility(): void {
  // Show transcription section after recording/upload
  if (this.state.transcription) {
    this.showSection(this.transcriptionSection);
  }

  // Show result sections after generation
  if (this.state.generatedContent.summary) {
    this.showSection(this.summarySection);
  }
  // etc...
}
```

### Testing
- Unit tests for timer formatting logic
- Unit tests for dirty state detection
- Integration tests for progressive disclosure transitions
- E2E tests for complete user workflows
- Accessibility testing with screen readers
- Mobile testing on actual devices

## Out of Scope
- Changing core transcription or generation logic
- Modifying OpenAI API integration
- Adding new modal types or commands
- Changing the underlying plugin architecture
- Modifying file saving logic or vault operations
- Adding new AI models or providers
- Creating new keyboard shortcuts for commands
- Changing the plugin's settings interface

## Success Criteria
- All three modals have consistent horizontal button layout at top
- Recording timer is always visible and updates smoothly
- Textareas only appear when they have content to display
- Loading animations provide clear feedback during async operations
- Users are warned before losing unsaved work
- Mobile users can fully use the modals on phones (480px breakpoint)
- All glowing animations and statusEl are completely removed
- Keyboard users can navigate all controls with Tab/Enter/Escape
- All user feedback uses Notice() instead of DOM status elements
- Code passes existing test suites without regression

## Implementation Phases

### Phase 1: Foundation
1. Create base modal class with shared functionality
2. Implement button group component
3. Add recording timer component
4. Remove old animation classes

### Phase 2: Progressive Disclosure
1. Implement progressive section containers
2. Add show/hide logic based on content
3. Add smooth transitions

### Phase 3: State Management
1. Implement dirty state tracking
2. Add confirmation dialogs
3. Add loading state animations

### Phase 4: Mobile & Accessibility
1. Add responsive breakpoints
2. Implement keyboard navigation
3. Add ARIA labels and focus management
4. Test with screen readers

### Phase 5: Polish & Testing
1. Replace all statusEl with Notice()
2. Ensure consistency across all three modals
3. Complete testing suite
4. Performance optimization

## Edge Cases and Error Handling

### Recording Timer
- **Long recordings**: Cap display at 99:59:59 or show days if needed
- **Browser tab switching**: Timer should continue accurately even if tab loses focus
- **Modal close during recording**: Stop recording and cleanup timer
- **Restart during recording**: Stop current recording, reset timer to 00:00

### Dirty State
- **Empty textareas**: Don't mark as dirty if only empty fields exist
- **Successful save**: Clear dirty state after content is inserted to note
- **Browser refresh**: Can't prevent data loss (browser limitation) but state is lost anyway
- **Multiple changes**: Track any change, not just the latest

### Progressive Disclosure
- **Rapid clicks**: Debounce button clicks during transitions
- **Content updates**: Keep sections visible if they already contain content
- **Large content**: Ensure smooth animations even with lengthy text
- **Section ordering**: Maintain logical order even when shown progressively

### Loading States
- **Timeout handling**: Show error notice and restore button state after 30 seconds
- **Multiple operations**: Prevent concurrent operations on same button
- **Modal close**: Clear all loading states and cancel pending operations
- **Network errors**: Show specific error messages using Notice()

### Mobile Responsiveness
- **Virtual keyboard**: Ensure modal remains scrollable when keyboard appears
- **Orientation change**: Recalculate heights appropriately
- **Touch targets**: Maintain 44px minimum even with loading overlays
- **Drag and drop**: Provide alternative upload button for devices without drag support

### Accessibility
- **Focus management**: Trap focus within modal, restore focus on close
- **Screen reader**: Announce state changes (recording started, processing, complete)
- **Keyboard shortcuts**: Escape to close (with confirmation), Tab to navigate
- **Color contrast**: Ensure all states maintain WCAG AA compliance