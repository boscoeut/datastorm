# Task Implementation Template

## Purpose
The `@createTask` command helps AI agents create focused, 4-hour tasks for the Electric Vehicle Data Hub project.

## Agent Workflow
1. **Check Project Status** - Review `tasks/taskList.md`, PRD, Technical Spec, and UI Spec
2. **Validate Scope** - Ensure task fits within 4-hour constraint
3. **Create Task File** - Generate properly formatted task following project standards

## Task Overview
**Task Name:** [Descriptive, focused name]
**Priority:** [HIGH/MEDIUM/LOW - must align with taskList.md]
**Description:** [Clear description of what to accomplish in 4 hours]
**Phase:** [Phase 1/2/3/4 from roadmap]
**Dependencies:** [List completed tasks this depends on]

## Requirements
### Functional
- [ ] [Specific functionality requirement 1]
- [ ] [Specific functionality requirement 2]
- [ ] [Specific functionality requirement 3]

### Technical
- [ ] [Framework/library requirement]
- [ ] [API integration requirement]
- [ ] [Database requirement]
- [ ] [Testing requirement]

## Implementation Steps

### Setup & Planning (30 min)
1. [ ] Review project status and documentation
2. [ ] Analyze codebase structure
3. [ ] Plan component architecture
4. [ ] Set up dependencies

### Core Implementation (2.5 hours)
1. [ ] [Create/modify specific component/function]
2. [ ] [Implement core logic]
3. [ ] [Handle edge cases and errors]
4. [ ] [Add necessary imports]

### Integration (30 min)
1. [ ] [Integrate with existing components]
2. [ ] [Update routing if needed]
3. [ ] [Connect to state management if required]
4. [ ] [Verify data flow]

### Styling & UI (30 min)
1. [ ] [Apply Tailwind CSS styling]
2. [ ] [Ensure responsive design]
3. [ ] [Add loading states and animations]
4. [ ] [Implement accessibility features]

### Testing & Validation (15 min)
1. [ ] [Test functionality manually]
2. [ ] [Verify edge cases and errors]
3. [ ] [Check for console errors]
4. [ ] [Validate against requirements]

### Final Review (15 min)
1. [ ] [Code review and cleanup]
2. [ ] [Remove debug code]
3. [ ] [Optimize performance]
4. [ ] [Update taskList.md when complete]

## Files to Modify/Create
**Maximum 2 files per 4-hour task:**
- [ ] `[file path 1]` - [purpose]
- [ ] `[file path 2]` - [purpose]

## Dependencies to Add
- [ ] [Package name] - [version] - [purpose]
- [ ] [Package name] - [version] - [purpose]

## Testing Checklist
- [ ] [Builds successfully]
- [ ] [No lint errors]
- [ ] [No runtime errors]
- [ ] [Aligns with project specifications]

## Acceptance Criteria
- [ ] [Criterion 1 - specific and measurable]
- [ ] [Criterion 2 - specific and measurable]
- [ ] [Criterion 3 - specific and measurable]
- [ ] [Performance criteria met]
- [ ] [Accessibility requirements met]
- [ ] [Integration works with existing features]
- [ ] [Task completed within 4 hours]

## Notes and Considerations
[Additional information, warnings, or special considerations. Include references to specific documentation sections and explain how this task fits into the current project phase.]

## Example Usage
[Brief example of how the implemented feature should work]

---

## Agent Instructions
1. **Review taskList.md first** - understand current project status
2. **Check project documentation** - understand requirements and constraints
3. **Verify task scope** - ensure task can be completed in 4 hours
4. **Follow implementation steps** in order unless there's a compelling reason to deviate
5. **Test thoroughly** before marking complete
6. **Update taskList.md** when finished
7. **Respect time constraints** - if task exceeds 4 hours, break it down

## Success Metrics
- [ ] All requirements implemented
- [ ] Code follows project conventions
- [ ] No console errors or warnings
- [ ] Feature works as expected
- [ ] Performance meets requirements
- [ ] Accessibility requirements met
- [ ] Integration works seamlessly
- [ ] **Task completed within 4 hours**

---

## Task File Structure

The agent automatically creates task files with this naming convention:
```
tasks/[task-name].md
```

Example: `tasks/create-vehicle-list-component.md`

### Task File Content
```markdown
# Task: [Task Name]

**Created:** [YYYY-MM-DD]
**Priority:** [HIGH/MEDIUM/LOW]
**Description:** [Clear description]
**Phase:** [Phase 1/2/3/4]
**Status:** [Not Started/In Progress/Completed/Blocked]
**Dependencies:** [List completed tasks]

## Requirements
[Copy requirements here]

## Implementation Steps
[Copy steps here]

## Files to Modify/Create
[Copy file list here]

## Dependencies to Add
[Copy dependencies here]

## Testing Checklist
[Copy testing checklist here]

## Acceptance Criteria
[Copy criteria here]

## Notes and Considerations
[Copy notes here]

## Example Usage
[Copy example here]

## Progress Log
- [YYYY-MM-DD] Task created
- [YYYY-MM-DD] [Progress update]

## Completion Notes
[Add notes when completed]
```

### Task Status Management
- **Not Started**: Task created but not begun
- **In Progress**: Task currently being worked on
- **Completed**: Task finished successfully
- **Blocked**: Task cannot proceed due to dependencies

