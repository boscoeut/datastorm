# Task Implementation Template

## Project Documentation References
**Before creating a task, ensure alignment with:**
- **PRD:** `docs/PRD.md` - Project Requirements Document defining core features and objectives
- **Technical Spec:** `docs/TECHNICAL_SPEC.md` - Technical architecture and implementation guidelines

### Alignment Checklist
- [ ] Task supports PRD core features and objectives
- [ ] Implementation follows TECHNICAL_SPEC architecture patterns
- [ ] Technology choices align with approved tech stack
- [ ] Performance requirements meet PRD success metrics
- [ ] Accessibility requirements follow TECHNICAL_SPEC guidelines

---

## Task Overview
**Task Name:** [Descriptive task name]
**Priority:** [High/Medium/Low]
**Complexity:** [Simple/Moderate/Complex]
**Related PRD Section:** [Section number and title from PRD]
**Related Technical Spec Section:** [Section number and title from TECHNICAL_SPEC]

## Task Description
[Provide a clear, detailed description of what needs to be accomplished. Include context, background information, and any relevant constraints. Reference specific PRD requirements and technical specifications where applicable.]

## Requirements
### Functional Requirements
- [ ] [Specific functionality requirement 1 - align with PRD Section X.X]
- [ ] [Specific functionality requirement 2 - align with PRD Section X.X]
- [ ] [Specific functionality requirement 3 - align with PRD Section X.X]

### Non-Functional Requirements
- [ ] [Performance requirement - must meet PRD success metrics]
- [ ] [Security requirement - follow TECHNICAL_SPEC security guidelines]
- [ ] [Accessibility requirement - meet WCAG 2.1 AA compliance]
- [ ] [Browser compatibility requirement - follow TECHNICAL_SPEC browser support]

### Technical Requirements
- [ ] [Framework/library requirement - must use approved tech stack from TECHNICAL_SPEC]
- [ ] [API integration requirement - follow TECHNICAL_SPEC data management patterns]
- [ ] [Database requirement - align with TECHNICAL_SPEC data architecture]
- [ ] [Testing requirement - meet TECHNICAL_SPEC testing strategy requirements]

## Implementation Steps

### Phase 1: Setup and Planning
1. [ ] Review relevant PRD sections for feature requirements
2. [ ] Review relevant TECHNICAL_SPEC sections for implementation guidelines
3. [ ] Analyze existing codebase structure
4. [ ] Identify relevant files and components
5. [ ] Plan component/module architecture following TECHNICAL_SPEC patterns
6. [ ] Set up any required dependencies from approved tech stack

### Phase 2: Core Implementation
1. [ ] [Create/modify specific component/function following TECHNICAL_SPEC component architecture]
2. [ ] [Implement core logic using approved patterns from TECHNICAL_SPEC]
3. [ ] [Handle edge cases and error states following TECHNICAL_SPEC error handling]
4. [ ] [Add necessary imports and dependencies from approved tech stack]

### Phase 3: Integration
1. [ ] [Integrate with existing components following TECHNICAL_SPEC patterns]
2. [ ] [Update routing if needed - follow TECHNICAL_SPEC navigation structure]
3. [ ] [Connect to state management if required - use Zustand patterns from TECHNICAL_SPEC]
4. [ ] [Ensure proper data flow following TECHNICAL_SPEC data management]

### Phase 4: Styling and UI
1. [ ] [Apply consistent styling using Tailwind CSS and design system from TECHNICAL_SPEC]
2. [ ] [Ensure responsive design following TECHNICAL_SPEC responsive guidelines]
3. [ ] [Add loading states and animations following TECHNICAL_SPEC UI patterns]
4. [ ] [Implement accessibility features meeting WCAG 2.1 AA requirements]

### Phase 5: Testing and Validation
1. [ ] [Test functionality manually following TECHNICAL_SPEC testing strategy]
2. [ ] [Verify edge cases and error scenarios]
3. [ ] [Check for console errors and performance issues]
4. [ ] [Validate against PRD requirements and TECHNICAL_SPEC guidelines]
5. [ ] [Ensure performance meets PRD success metrics]

### Phase 6: Final Review
1. [ ] [Code review and cleanup following TECHNICAL_SPEC code quality standards]
2. [ ] [Remove console.logs and debug code]
3. [ ] [Optimize performance to meet PRD success metrics]
4. [ ] [Update documentation if required]
5. [ ] [Verify alignment with PRD objectives and TECHNICAL_SPEC architecture]

## Files to Modify/Create
- [ ] `[file path 1]` - [purpose - follow TECHNICAL_SPEC project structure]
- [ ] `[file path 2]` - [purpose - follow TECHNICAL_SPEC project structure]
- [ ] `[file path 3]` - [purpose - follow TECHNICAL_SPEC project structure]

## Dependencies to Add
- [ ] [Package name] - [version] - [purpose - must be from approved tech stack in TECHNICAL_SPEC]
- [ ] [Package name] - [version] - [purpose - must be from approved tech stack in TECHNICAL_SPEC]

## Testing Checklist
- [ ] [Test case 1 - must meet TECHNICAL_SPEC testing coverage requirements]
- [ ] [Test case 2 - must meet TECHNICAL_SPEC testing coverage requirements]
- [ ] [Test case 3 - must meet TECHNICAL_SPEC testing coverage requirements]
- [ ] [Cross-browser testing - follow TECHNICAL_SPEC browser compatibility]
- [ ] [Mobile responsiveness - meet PRD mobile optimization requirements]
- [ ] [Performance testing - ensure PRD success metrics are met]

## Acceptance Criteria
- [ ] [Criterion 1 - specific and measurable, aligned with PRD objectives]
- [ ] [Criterion 2 - specific and measurable, aligned with PRD objectives]
- [ ] [Criterion 3 - specific and measurable, aligned with PRD objectives]
- [ ] [Performance criteria - must meet PRD success metrics]
- [ ] [Accessibility criteria - must meet WCAG 2.1 AA compliance]

## Notes and Considerations
[Any additional information, warnings, or special considerations the agent should be aware of. Include references to specific PRD sections or TECHNICAL_SPEC guidelines that may impact implementation.]

## Example Usage
[Provide a brief example of how the implemented feature should work, demonstrating alignment with PRD requirements and TECHNICAL_SPEC patterns]

---

## Agent Instructions
1. **Review PRD and TECHNICAL_SPEC first** - understand project requirements and technical constraints
2. **Read the entire task description carefully** before starting implementation
3. **Follow the implementation steps in order** unless there's a compelling reason to deviate
4. **Check off each step** as you complete it
5. **Ask for clarification** if any requirements are unclear or conflict with documentation
6. **Test thoroughly** before marking the task complete
7. **Document any deviations** from the original plan or documentation
8. **Provide progress updates** at each major phase
9. **Ensure compliance** with PRD objectives and TECHNICAL_SPEC guidelines

## Success Metrics
- [ ] All functional requirements implemented and aligned with PRD
- [ ] All non-functional requirements met and follow TECHNICAL_SPEC
- [ ] Code follows project conventions from TECHNICAL_SPEC
- [ ] No console errors or warnings
- [ ] Feature works as expected in all scenarios
- [ ] Code is clean and maintainable
- [ ] Performance meets PRD success metrics
- [ ] Accessibility meets WCAG 2.1 AA compliance

---

## Documentation Compliance Checklist
Before marking task complete, verify:
- [ ] Implementation aligns with PRD core features and objectives
- [ ] Code follows TECHNICAL_SPEC architecture patterns
- [ ] Technology choices match approved tech stack
- [ ] Performance meets PRD success metrics
- [ ] Accessibility follows TECHNICAL_SPEC guidelines
- [ ] Testing coverage meets TECHNICAL_SPEC requirements
- [ ] Error handling follows TECHNICAL_SPEC patterns
- [ ] State management uses approved Zustand patterns
- [ ] Component architecture follows TECHNICAL_SPEC component guidelines
- [ ] Data flow follows TECHNICAL_SPEC data management patterns

---

# Task Generator

## How to Create a New Task

### 1. Fill Out the Template Above
Complete all sections of the template above with specific details for your task.

### 2. Generate Task File
Use the following naming convention for your task file:
```
tasks/[YYYY-MM-DD]-[task-name].md
```

Example: `tasks/2024-01-15-add-user-authentication.md`

### 3. Task File Structure
Each task file should follow this exact structure:

```markdown
# Task: [Task Name]

**Created:** [YYYY-MM-DD]
**Priority:** [High/Medium/Low]
**Complexity:** [Simple/Moderate/Complex]
**Status:** [Not Started/In Progress/Completed/Blocked]

## Task Description
[Copy the completed task description here]

## Requirements
[Copy the completed requirements here]

## Implementation Steps
[Copy the completed implementation steps here]

## Files to Modify/Create
[Copy the completed file list here]

## Dependencies to Add
[Copy the completed dependencies here]

## Testing Checklist
[Copy the completed testing checklist here]

## Acceptance Criteria
[Copy the completed acceptance criteria here]

## Notes and Considerations
[Copy the completed notes here]

## Example Usage
[Copy the completed example here]

## Progress Log
- [YYYY-MM-DD] Task created
- [YYYY-MM-DD] [Progress update]
- [YYYY-MM-DD] [Progress update]

## Completion Notes
[Add notes when task is completed]
```

### 4. Task Management Commands

#### Create a New Task
```bash
# Navigate to tasks directory
cd tasks

# Create new task file with current date
touch $(date +%Y-%m-%d)-[task-name].md
```

#### List All Tasks
```bash
# List all task files
ls -la tasks/

# List tasks by date
ls -la tasks/ | sort
```

#### Update Task Status
- **Not Started**: Task is created but not yet begun
- **In Progress**: Task is currently being worked on
- **Completed**: Task has been finished successfully
- **Blocked**: Task cannot proceed due to external dependencies

### 5. Task Organization

#### By Priority
- `tasks/priority-high/` - High priority tasks
- `tasks/priority-medium/` - Medium priority tasks  
- `tasks/priority-low/` - Low priority tasks

#### By Status
- `tasks/status-not-started/` - Tasks not yet begun
- `tasks/status-in-progress/` - Active tasks
- `tasks/status-completed/` - Finished tasks
- `tasks/status-blocked/` - Blocked tasks

### 6. Example Task File

See `tasks/example-task.md` for a complete example of a filled-out task file.

---

## Quick Start
1. Copy this template
2. Fill in your specific task details
3. Save as `tasks/[date]-[name].md`
4. Begin implementation following the steps
5. Update progress as you work
6. Mark complete when finished
