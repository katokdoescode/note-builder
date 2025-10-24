# Spec Requirements: Modal UI/UX Refactor

## Initial Description
Refactor all modals (MemoModal, CustomCommandModal, SmartMemoModal) for consistent UI/UX with:
- Reorganized button layout (restart/record/upload centered at top)
- Progressive disclosure (textareas hidden until processing)
- Live recording timer with state indicators
- Unified styling system
- Loading state indicators on buttons
- Mobile responsiveness (95vh)
- Data loss prevention (confirm on close with changes)
- New animations replacing old glowing effects

This is a UI/UX refactoring that maintains all existing functionality while improving consistency and user feedback.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the restart button should always be visible, not just during recording. Is that correct, or should it only appear when there's something to restart?
**Answer:** Always visible (not conditional)

**Q2:** I'm thinking the mic button should be 60px and the upload button 45px for better visual hierarchy. Should we proceed with these sizes?
**Answer:** Mic button 60px, upload button 45px - APPROVED

**Q3:** For the recording timer, I assume we show MM:SS format up to 59:59, then switch to HH:MM:SS for longer recordings. Is that correct?
**Answer:** Switch from MM:SS to HH:MM:SS after 59:59

**Q4:** For button loading states, I'm thinking we keep the same icon but add a spinning animation overlay. Should we also change the icon itself during loading?
**Answer:** Keep the same icon, show animation to indicate loading

**Q5:** When tracking "dirty state" for data loss prevention, should we only track text in textareas, or also track completed transcriptions and uploaded files?
**Answer:** Track ALL changes (text in textareas, completed transcriptions, uploaded files)

**Q6:** For mobile responsiveness, I assume 480px is the breakpoint for switching to 95vh height. Is that correct, or should we use 768px to include tablets?
**Answer:** 480px (phones only) for 95vh height

**Q7:** Should we maintain accessibility features like ARIA labels, keyboard shortcuts, and focus trap within the modal?
**Answer:** YES - maintain ARIA labels, add keyboard shortcuts, add focus trap

**Q8:** I'm thinking tooltips should appear on hover for all icon buttons. Should these tooltips be shown always, or only if buttons don't have text labels?
**Answer:** Show tooltips ONLY if buttons don't have text

**Q9:** Should we completely remove the glowing animations (inner-glowing, outer-glowing, glowing-wrapper) and statusEl references, or keep them commented for potential future use?
**Answer:** Totally remove glowing animations (inner-glowing, outer-glowing, glowing-wrapper) and statusEl

### Existing Code to Reference
No similar existing features identified for reference.

### Follow-up Questions
None required - all information gathered.

## Visual Assets

### Files Provided:
- `Create-memo-modal.png`: Shows current MemoModal with recording/upload buttons on left side, large textarea, checkboxes for merge/save options, and 4 action buttons (Save, Summary, Tasks, Reflex)
- `Custom-prompt-modal.png`: Shows current CustomCommandModal with recording/upload buttons on left, three labeled sections (Transcription, Custom prompt, Result preview), Process/Insert buttons at bottom
- `Smart-memo-modal.png`: Shows current SmartMemoModal with recording/upload buttons on left, "Formatted Note" section, checkbox for saving voice file, "Save to Note" button

### Visual Insights:
- Current layout has buttons vertically stacked on the left side
- All textareas are currently visible by default (need to be hidden initially)
- Need to move buttons from left-side vertical to center-top horizontal layout
- Recording and upload buttons need to be more prominent
- Current design lacks visual feedback for loading states
- No recording timer is visible in current implementation
- Modals currently have inconsistent layouts between different types

## Requirements Summary

### Functional Requirements

#### Core Functionality (Unchanged)
- Record audio via browser microphone
- Upload audio files via drag-and-drop or file picker
- Transcribe audio using OpenAI Whisper API
- Generate summaries, tasks, and reflex notes from transcriptions
- Process transcriptions with custom prompts
- Merge new memos with existing ones
- Save voice files with attachments to notes

#### New UI/UX Features
- **Progressive Disclosure**: Hide all textareas initially, show only when processing starts
- **Recording Timer**: Display live timer during recording (MM:SS format, switching to HH:MM:SS after 59:59)
- **Restart Button**: Always visible button to restart/clear current session
- **Loading States**: Visual feedback on buttons during async operations
- **Data Loss Prevention**: Confirm dialog when closing modal with unsaved changes
- **Unified Button Layout**: Consistent centered horizontal layout across all modals

### UI/UX Specifications

#### Button Layout
- **Position**: Centered horizontally at top of modal
- **Order**: Restart | Mic | Upload (left to right)
- **Sizes**:
  - Restart button: Standard size (40px)
  - Mic button: 60px (primary action)
  - Upload button: 45px (secondary action)
- **Spacing**: Consistent gap between buttons (8-12px)

#### Recording Timer
- **Position**: Directly below mic button
- **Initial State**: Shows "00:00" when not recording
- **Recording State**: Updates every second
- **Format**:
  - MM:SS for recordings under 1 hour
  - HH:MM:SS for recordings 1 hour and above
- **Visibility**: Always visible (not conditional)

#### Progressive Disclosure
- **Initial State**: Only show button controls and timer
- **After Recording/Upload**: Show transcription textarea
- **After Processing**: Show relevant result textareas
- **MemoModal Specific**: Show checkboxes only after transcription
- **CustomCommandModal Specific**: Show prompt field after transcription, result after processing
- **SmartMemoModal Specific**: Show formatted note field after processing

#### Loading States
- **Implementation**: Keep original icon, add animation overlay
- **Animation Types**:
  - Mic button: Pulsing or spinning indicator during recording
  - Upload button: Progress indicator during file processing
  - Action buttons: Spinner during API calls
- **Disabled State**: Buttons disabled during their respective operations

#### Dirty State Tracking
- **Track Changes In**:
  - All textareas (transcription, custom prompt, result, formatted note)
  - Completed transcriptions (even if textarea is empty)
  - Uploaded files (even if not processed)
  - Checkbox states
- **Trigger Confirmation**: On modal close if any tracked changes exist
- **Confirmation Message**: "You have unsaved changes. Are you sure you want to close?"

### Non-Functional Requirements

#### Performance
- Timer updates should not cause UI lag
- Animations should use CSS transforms for GPU acceleration
- Progressive disclosure should have smooth transitions

#### Mobile Responsiveness
- **Breakpoint**: 480px (phones only)
- **Mobile Height**: 95vh for modals on screens < 480px
- **Desktop Height**: Current height maintained for screens >= 480px
- **Button Sizes**: Should remain touch-friendly on mobile (minimum 44px tap target)

#### Accessibility
- **ARIA Labels**: Maintain on all interactive elements
- **Keyboard Navigation**:
  - Tab navigation between controls
  - Enter/Space to activate buttons
  - Escape to close modal (with confirmation if dirty)
- **Focus Trap**: Keep focus within modal when open
- **Screen Reader**: Announce state changes (recording started/stopped, processing, etc.)

### Technical Considerations

#### CSS Cleanup
- **Remove Completely**:
  - `.inner-glowing` class and animations
  - `.outer-glowing` class and animations
  - `.glowing-wrapper` class and animations
  - `statusEl` DOM element and all references
- **Add New Classes**:
  - `.button-loading` for loading states
  - `.button-group-horizontal` for centered button layout
  - `.recording-timer` for timer display
  - `.progressive-section` for show/hide animations

#### State Management
- Track dirty state in modal class property
- Implement `isDirty()` method to check all tracked elements
- Add `resetDirtyState()` method for after saves
- Override `onClose()` to check dirty state before closing

#### Animation Replacements
- Replace glowing effects with:
  - CSS transitions for progressive disclosure
  - Transform-based loading spinners
  - Subtle pulse animation for recording state

### Scope Boundaries

**In Scope:**
- Refactor all three modals (MemoModal, CustomCommandModal, SmartMemoModal)
- Implement new button layout and positioning
- Add recording timer with format switching
- Implement progressive disclosure for all textareas
- Add loading state animations on buttons
- Implement dirty state tracking and confirmation
- Remove old glowing animations completely
- Add mobile responsiveness at 480px breakpoint
- Maintain all accessibility features

**Out of Scope:**
- Changing core functionality (transcription, generation, etc.)
- Modifying API integration or backend logic
- Adding new features beyond UI/UX improvements
- Changing modal sizes for desktop (only mobile adjustment)
- Modifying the underlying OpenAI integration
- Creating new modal types
- Changing keyboard shortcuts for commands

### Edge Cases and Error Handling

#### Recording Timer
- Handle recordings over 24 hours (show days or cap at 23:59:59)
- Properly cleanup timer on modal close during recording
- Reset timer when restart button is clicked

#### Dirty State
- Don't show confirmation if only empty textareas exist
- Clear dirty state after successful save operations
- Handle browser refresh (can't prevent data loss here, browser limitation)

#### Progressive Disclosure
- Handle rapid button clicks (debounce/disable during transitions)
- Ensure textareas remain visible if they contain content
- Smooth transitions even with large content

#### Loading States
- Handle timeout scenarios (show error, restore button state)
- Prevent multiple simultaneous operations on same button
- Clear loading state on modal close

#### Mobile
- Test with virtual keyboards (ensure modal remains accessible)
- Handle orientation changes gracefully
- Ensure touch targets remain accessible with loading overlays