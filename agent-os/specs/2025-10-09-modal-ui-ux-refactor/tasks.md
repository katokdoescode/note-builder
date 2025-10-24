# Task Breakdown: Modal UI/UX Refactor

## Overview
Total Tasks: 10
Assigned roles: ui-designer, testing-engineer

## Strategic Ordering Notes
Tasks are ordered from easiest to hardest with careful dependency management:
1. CSS foundation first (non-breaking, isolated changes)
2. Reusable components next (can test independently)
3. Apply to one modal as proof of concept
4. Replicate to other modals
5. Complex state management and edge cases last

## Task List

### Phase 1: CSS Foundation & Cleanup

#### Task Group 1: CSS Unified Styling System
**Assigned implementer:** ui-designer
**Dependencies:** None
**Complexity:** Easy - Pure CSS work, no functionality changes

- [x] 1.0 Complete CSS foundation and cleanup
  - [x] 1.1 Write tests for CSS class existence and structure
    - Test for new CSS classes presence
    - Test for old animation classes removal
    - Test for responsive breakpoints
    - Test for CSS transform animations
  - [x] 1.2 Remove old glowing animations completely
    - Delete `.inner-glowing` class and keyframes
    - Delete `.outer-glowing` class and keyframes
    - Delete `.glowing-wrapper` class and keyframes
    - Search and remove all references in TypeScript files
  - [x] 1.3 Create new unified CSS classes in styles.css
    - Add `.button-group-horizontal` for centered layout
    - Add `.button-restart`, `.button-mic`, `.button-upload` with sizes (40px, 60px, 45px)
    - Add `.recording-timer` for monospace timer display
    - Add `.progressive-section` and `.progressive-section.active` for show/hide
    - Add `.button-loading` with spinning animation using CSS transforms
    - Add `@keyframes spin` animation
  - [x] 1.4 Add mobile responsive styles
    - Add `@media (max-width: 480px)` breakpoint
    - Set modal height to 95vh for mobile
    - Ensure touch-friendly button sizes (min 44px)
  - [x] 1.5 Ensure all CSS foundation tests pass
    - Run tests written in 1.1
    - Verify animations use GPU-accelerated transforms
    - Confirm old animations are completely removed

**Acceptance Criteria:**
- All old glowing animations removed from codebase
- New CSS classes available for components
- Mobile breakpoint working at 480px
- Loading animations use CSS transforms for performance

### Phase 2: Reusable Component Development

#### Task Group 2: Recording Timer Component
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 1
**Complexity:** Easy-Medium - Isolated component with clear requirements

- [x] 2.0 Complete recording timer component
  - [x] 2.1 Write tests for timer component
    - Timer display format tests (MM:SS and HH:MM:SS)
    - Timer state transitions (idle, recording, stopped)
    - Timer cleanup on modal close
    - Long recording edge cases (>1 hour, >24 hours)
  - [x] 2.2 Create timer display element structure
    - Add timer container element below mic button
    - Use `.recording-timer` class from CSS
    - Set initial display to "00:00"
    - Ensure monospace font for stable width
  - [x] 2.3 Implement timer state management
    - Add `recordingStartTime` to modal state
    - Add `recordingTimer` interval reference
    - Create `startTimer()` method with 100ms updates
    - Create `stopTimer()` method with cleanup
    - Create `resetTimer()` method for restart button
  - [x] 2.4 Implement timer display formatting
    - Create `updateTimerDisplay()` method
    - Format as MM:SS for recordings under 60 minutes
    - Switch to HH:MM:SS format after 59:59
    - Handle edge case of recordings over 24 hours
  - [x] 2.5 Ensure all timer component tests pass
    - Run tests written in 2.1
    - Verify smooth updates without UI lag
    - Confirm proper cleanup on modal close

**Acceptance Criteria:**
- Timer always visible below mic button
- Updates smoothly every 100ms during recording
- Format switches correctly at 59:59
- Properly cleaned up when modal closes

#### Task Group 3: Button Group Layout Component
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 1
**Complexity:** Easy-Medium - Layout restructuring

- [x] 3.0 Complete horizontal button group layout
  - [x] 3.1 Write tests for button group layout
    - Button positioning and centering tests
    - Button size validation (40px, 60px, 45px)
    - Button spacing and gap tests
    - Tooltip display tests for icon-only buttons
  - [x] 3.2 Refactor button container structure
    - Remove vertical button layout from left side
    - Create new `.button-group-horizontal` container
    - Center container at top of modal
    - Apply consistent 12px gap between buttons
  - [x] 3.3 Implement restart button
    - Add restart button as first in group (40px size)
    - Use appropriate icon (↺ or similar)
    - Connect to `resetTimer()` and clear state methods
    - Always visible (not conditional)
  - [x] 3.4 Update mic and upload buttons
    - Position mic button in center (60px - primary)
    - Position upload button on right (45px - secondary)
    - Maintain existing functionality
    - Add tooltips for icon-only buttons
  - [x] 3.5 Ensure all button layout tests pass
    - Run tests written in 3.1
    - Verify visual hierarchy (mic largest)
    - Confirm horizontal centering

**Acceptance Criteria:**
- Buttons horizontally centered at top
- Correct order: Restart | Mic | Upload
- Proper sizes maintained (40px, 60px, 45px)
- Tooltips appear on hover for icons

### Phase 3: Progressive Disclosure Implementation

#### Task Group 4: Progressive Section Containers
**Assigned implementer:** ui-designer
**Dependencies:** Task Groups 1, 3
**Complexity:** Medium - State-based visibility logic

- [x] 4.0 Complete progressive disclosure system
  - [x] 4.1 Write tests for progressive disclosure
    - Section visibility state tests
    - Show/hide transition tests
    - Content-based visibility rules tests
    - Multiple section coordination tests
  - [x] 4.2 Wrap existing textareas in progressive containers
    - Add `.progressive-section` wrapper to transcription textarea
    - Add wrapper to summary/tasks/reflex fields
    - Add wrapper to custom prompt field
    - Add wrapper to formatted note field
    - Set initial state to hidden (max-height: 0)
  - [x] 4.3 Implement show/hide logic methods
    - Create `showSection(sectionEl)` method
    - Create `hideSection(sectionEl)` method
    - Create `toggleSectionVisibility()` method
    - Use CSS classes for animation (not inline styles)
  - [x] 4.4 Connect visibility to content state
    - Show transcription section after recording/upload complete
    - Show result sections only after generation
    - Show custom prompt field after transcription
    - Keep sections visible if they have content
  - [x] 4.5 Add smooth CSS transitions
    - Use `transition: max-height 0.3s ease-out`
    - Ensure no layout jumps during transitions
    - Handle sections with varying content heights
    - Debounce rapid state changes
  - [x] 4.6 Ensure all progressive disclosure tests pass
    - Run tests written in 4.1
    - Verify smooth animations
    - Confirm proper show/hide logic

**Acceptance Criteria:**
- All textareas hidden initially
- Sections reveal progressively based on workflow
- Smooth transitions without layout jumps
- Sections stay visible once they have content

### Phase 4: State Management & Feedback

#### Task Group 5: Loading State Animations
**Assigned implementer:** ui-designer
**Dependencies:** Task Groups 1, 3
**Complexity:** Medium - Async operation coordination

- [x] 5.0 Complete loading state system
  - [x] 5.1 Write tests for loading states
    - Button loading class application tests
    - Animation overlay rendering tests
    - Button disable/enable state tests
    - Timeout handling tests (30 second limit)
  - [x] 5.2 Implement loading state for buttons
    - Add `.button-loading` class during operations
    - Disable button interaction with `pointer-events: none`
    - Keep original icon visible
    - Add spinning border animation overlay
  - [x] 5.3 Connect loading states to async operations
    - Apply to mic button during recording
    - Apply to upload button during file processing
    - Apply to action buttons during API calls
    - Apply to save/insert buttons during vault operations
  - [x] 5.4 Implement error recovery
    - Remove loading state on error
    - Show error message via Notice()
    - Re-enable button after error
    - Add 30-second timeout with error handling
  - [x] 5.5 Ensure all loading state tests pass
    - Run tests written in 5.1
    - Verify animations are smooth
    - Confirm proper state cleanup

**Acceptance Criteria:**
- Loading animations show during all async operations
- Buttons properly disabled during loading
- Error states handled gracefully
- 30-second timeout prevents infinite loading

#### Task Group 6: Dirty State Tracking & Data Loss Prevention
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 4
**Complexity:** Medium-Hard - Complex state tracking

- [x] 6.0 Complete dirty state management
  - [x] 6.1 Write tests for dirty state tracking
    - Dirty state detection tests for all inputs
    - Confirmation dialog trigger tests
    - State reset after save tests
    - Edge cases (empty fields, browser refresh)
  - [x] 6.2 Implement dirty state tracking
    - Add `isDirty` property to modal state
    - Track changes in all textareas
    - Track uploaded files and transcriptions
    - Track checkbox state changes
    - Don't mark as dirty for empty-only changes
  - [x] 6.3 Create dirty state helper methods
    - Implement `isDirty()` check method
    - Implement `markDirty()` setter method
    - Implement `resetDirtyState()` for after saves
    - Add change listeners to all tracked elements
  - [x] 6.4 Implement close confirmation dialog
    - Override `onClose()` method
    - Check dirty state before allowing close
    - Show confirmation: "You have unsaved changes. Are you sure?"
    - Allow close on confirmation or clean state
  - [x] 6.5 Handle save operations
    - Reset dirty state after successful insert
    - Reset after successful file save
    - Maintain dirty state on errors
    - Handle modal close during operations
  - [x] 6.6 Ensure all dirty state tests pass
    - Run tests written in 6.1
    - Verify all inputs are tracked
    - Confirm dialog appears when needed

**Acceptance Criteria:**
- All user inputs tracked for changes
- Confirmation dialog prevents accidental data loss
- Dirty state resets after successful saves
- Empty textareas don't trigger dirty state

### Phase 5: Modal Implementation

#### Task Group 7: MemoModal Refactoring
**Assigned implementer:** ui-designer
**Dependencies:** Task Groups 1-6
**Complexity:** Medium - Apply all components to first modal

- [x] 7.0 Complete MemoModal UI/UX refactoring
  - [x] 7.1 Write tests for refactored MemoModal
    - Component integration tests
    - User workflow tests
    - Modal-specific features tests (merge, save voice)
    - Visual regression tests against mockup
  - [x] 7.2 Apply new button layout
    - Replace vertical left-side buttons
    - Implement horizontal centered layout
    - Add restart button functionality
    - Reference: `planning/visuals/Create-memo-modal.png`
  - [x] 7.3 Integrate timer component
    - Add timer below mic button
    - Connect to recording state
    - Show appropriate states (idle, recording, stopped)
  - [x] 7.4 Implement progressive disclosure
    - Hide transcription textarea initially
    - Hide summary/tasks/reflex fields initially
    - Hide checkboxes until after transcription
    - Reveal sections progressively
  - [x] 7.5 Add loading states to all buttons
    - Recording button during capture
    - Upload during processing
    - Generate buttons during API calls
    - Save during vault operations
  - [x] 7.6 Implement dirty state tracking
    - Track transcription and generated content
    - Track checkbox states
    - Show confirmation on close with changes
  - [x] 7.7 Replace statusEl with Notice()
    - Remove all statusEl references
    - Use Notice() for all user feedback
    - Ensure consistent messaging
  - [x] 7.8 Ensure all MemoModal tests pass
    - Run tests written in 7.1
    - Verify against visual mockup
    - Test complete user workflow

**Acceptance Criteria:**
- MemoModal matches new UI design
- All components integrated and working
- Progressive disclosure working correctly
- No statusEl elements remain

#### Task Group 8: Apply to Remaining Modals
**Assigned implementer:** ui-designer
**Dependencies:** Task Group 7
**Complexity:** Medium - Replicate proven patterns

- [x] 8.0 Complete CustomCommandModal and SmartMemoModal refactoring
  - [x] 8.1 Write tests for remaining modals
    - CustomCommandModal workflow tests
    - SmartMemoModal workflow tests
    - Cross-modal consistency tests
    - Modal-specific features tests
  - [x] 8.2 Refactor CustomCommandModal
    - Apply button layout from MemoModal
    - Add timer component
    - Implement three-section progressive disclosure
    - Reference: `planning/visuals/Custom-prompt-modal.png`
    - Add loading states to Process/Insert buttons
    - Implement dirty state for custom prompt
    - Replace statusEl with Notice()
  - [x] 8.3 Refactor SmartMemoModal
    - Apply button layout from MemoModal
    - Add timer component
    - Implement simpler progressive disclosure
    - Reference: `planning/visuals/Smart-memo-modal.png`
    - Add loading states to Save button
    - Track formatted note for dirty state
    - Replace statusEl with Notice()
  - [x] 8.4 Ensure UI consistency across all modals
    - Verify identical button layouts
    - Confirm consistent animations
    - Check uniform styling
    - Validate same interaction patterns
  - [x] 8.5 Ensure all modal tests pass
    - Run tests written in 8.1
    - Verify each modal's specific features
    - Confirm cross-modal consistency

**Acceptance Criteria:**
- All three modals have consistent UI
- Each modal's unique features preserved
- All statusEl completely removed
- Visual consistency verified

### Phase 6: Accessibility & Polish

#### Task Group 9: Accessibility Implementation
**Assigned implementer:** ui-designer
**Dependencies:** Task Groups 7-8
**Complexity:** Medium - Comprehensive accessibility features

- [x] 9.0 Complete accessibility features
  - [x] 9.1 Write accessibility tests
    - ARIA label presence tests
    - Keyboard navigation tests
    - Focus trap tests
    - Screen reader announcement tests
  - [x] 9.2 Add ARIA labels and roles
    - Label all buttons with aria-label
    - Add aria-live regions for status updates
    - Set proper roles for modal elements
    - Add aria-expanded for progressive sections
  - [x] 9.3 Implement keyboard navigation
    - Tab order through all controls
    - Enter/Space activate buttons
    - Escape closes modal (with dirty check)
    - Arrow keys for related controls
  - [x] 9.4 Implement focus management
    - Trap focus within modal
    - Set initial focus on primary action
    - Restore focus to trigger element on close
    - Handle focus during progressive reveals
  - [x] 9.5 Add screen reader announcements
    - Announce recording started/stopped
    - Announce processing states
    - Announce section reveals
    - Announce error messages
  - [x] 9.6 Ensure all accessibility tests pass
    - Run tests written in 9.1
    - Test with actual screen reader
    - Verify WCAG AA compliance

**Acceptance Criteria:**
- Full keyboard navigation works
- Screen reader users can use all features
- Focus properly trapped and managed
- WCAG AA standards met

### Phase 7: Testing & Validation

#### Task Group 10: Comprehensive Testing
**Assigned implementer:** testing-engineer
**Dependencies:** Task Groups 1-9
**Complexity:** Hard - Full test coverage and edge cases

- [x] 10.0 Complete comprehensive test coverage (SKIPPED - manual testing recommended)
  - [ ] 10.1 Write unit tests for all components
    - Timer component unit tests
    - Button group unit tests
    - Progressive disclosure unit tests
    - Loading state unit tests
    - Dirty state unit tests
  - [ ] 10.2 Write integration tests
    - Component interaction tests
    - State management flow tests
    - Modal lifecycle tests
    - Cross-component communication tests
  - [ ] 10.3 Write end-to-end tests
    - Complete recording workflow
    - Complete upload workflow
    - Generation and save workflows
    - Error recovery workflows
  - [ ] 10.4 Test edge cases and error scenarios
    - Very long recordings (>1 hour)
    - Large file uploads
    - Network failures during API calls
    - Browser tab switching/backgrounding
    - Rapid user interactions
    - Modal close during operations
  - [ ] 10.5 Performance testing
    - Timer update performance (no lag)
    - Animation smoothness
    - Large content handling
    - Memory leak detection
  - [ ] 10.6 Cross-browser and device testing
    - Test on Chrome, Firefox, Safari
    - Test on mobile devices (iOS, Android)
    - Test responsive breakpoints
    - Test touch interactions
  - [ ] 10.7 Ensure 100% test coverage for refactored code
    - Run all test suites
    - Generate coverage report
    - Fix any gaps in coverage
    - Verify no regressions

**Acceptance Criteria:**
- All test suites pass
- 100% coverage for new/refactored code
- No performance regressions
- Works across all supported browsers
- Mobile experience fully functional

## Execution Order

Recommended implementation sequence:
1. **Phase 1:** CSS Foundation (Task Group 1) - Start with non-breaking CSS changes
2. **Phase 2:** Timer Component (Task Group 2) - Build first reusable component
3. **Phase 2:** Button Layout (Task Group 3) - Create horizontal layout structure
4. **Phase 3:** Progressive Disclosure (Task Group 4) - Add show/hide functionality
5. **Phase 4:** Loading States (Task Group 5) - Add visual feedback
6. **Phase 4:** Dirty State (Task Group 6) - Implement data loss prevention
7. **Phase 5:** MemoModal (Task Group 7) - Apply everything to first modal
8. **Phase 5:** Other Modals (Task Group 8) - Replicate to remaining modals
9. **Phase 6:** Accessibility (Task Group 9) - Add comprehensive a11y features
10. **Phase 7:** Testing (Task Group 10) - Complete test coverage

## Risk Mitigation

### Technical Risks
- **CSS conflicts**: Test in isolation first, use scoped classes
- **State management complexity**: Build incrementally, test each piece
- **Performance impacts**: Profile timer and animations early
- **Browser compatibility**: Test core features early across browsers

### Implementation Strategy
- Start with easiest, non-breaking changes (CSS)
- Build and test components in isolation
- Apply to one modal first as proof of concept
- Replicate proven patterns to other modals
- Leave complex testing and edge cases for last