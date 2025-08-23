# Task Implementation Template

## What This Command Does

The `@createTask` command is executed by an AI agent from within Cursor IDE to create a comprehensive, detailed task definition for the Electric Vehicle Data Hub project. When this command is invoked, the agent will:

1. **Analyze Project Status**: The agent will automatically review the current project status from taskList.md
2. **Guide Task Creation**: The agent will help you define a task that fits within the 4-hour constraint
3. **Validate Requirements**: The agent will ensure the task aligns with project priorities and dependencies
4. **Generate Task File**: The agent will create a properly formatted task file following project standards

## Project Status Consultation
**The agent will automatically consult the current project status:**
- **Task List:** `tasks/taskList.md` - Current project status, completed tasks, and pending priorities
- **PRD:** `docs/specs/PRD.md` - Project Requirements Document defining core features and objectives
- **Technical Spec:** `docs/specs/TECHNICAL_SPEC.md` - Technical architecture and implementation guidelines
- **UI Spec:** `docs/specs/USER_INTERFACE_SPEC.md` - User interface design system and component guidelines

### Task List Integration Checklist
**The agent will automatically verify:**
- [ ] Review `tasks/taskList.md` for current project status and priorities
- [ ] Check if task aligns with current implementation phase
- [ ] Verify task doesn't duplicate or conflict with existing work
- [ ] Ensure task follows the established priority order (HIGH → MEDIUM → LOW)
- [ ] Confirm task dependencies are already completed or in progress
- [ ] Align with current milestone and roadmap timeline
- [ ] Check if task fits within the current development phase

### Current Project Status (from taskList.md)
**The agent will automatically retrieve:**
**Last Updated:** [Agent checks taskList.md for current date]
**Current Phase:** [Agent determines Phase 1/2/3/4 from roadmap]
**Next Milestone:** [Agent identifies from taskList.md]
**Available Effort:** [Agent assesses based on current team capacity and timeline]

### Priority Alignment Check
**The agent will automatically verify:**
- [ ] **HIGH PRIORITY** - Core Features (Must Complete First) - Check if this is the right time
- [ ] **MEDIUM PRIORITY** - Supporting Features - Verify dependencies are met
- [ ] **LOW PRIORITY** - Enhancement Features - Ensure core features are complete first

### Dependency Verification
**The agent will automatically verify:**
- [ ] All required tasks from previous phases are completed
- [ ] Required infrastructure and components are in place
- [ ] Database schema and services support the new task
- [ ] Required UI components and layouts are available
- [ ] State management patterns are established

---

## Task Overview
**Task Name:** [Descriptive task name - must be specific and focused]
**Priority:** [High/Medium/Low - must align with taskList.md priority order]
**Complexity:** [Half-Day (4 hours) - all tasks must fit this constraint]
**Phase:** [Phase 1/2/3/4 from roadmap]
**Related PRD Section:** [Section number and title from PRD]
**Related Technical Spec Section:** [Section number and title from TECHNICAL_SPEC]
**Dependencies:** [List specific completed tasks this depends on from taskList.md]

## Task Description
[Provide a clear, focused description of what needs to be accomplished in 4 hours. Keep scope narrow and specific. Include context, background information, and any relevant constraints. Reference specific PRD requirements and technical specifications where applicable. Explain how this task fits into the current project phase and roadmap.]

## Task Scope Requirements
**CRITICAL: This task must be completable in 4 hours (half a day) by a single developer.**

### Scope Validation Checklist
**The agent will automatically verify:**
- [ ] Task can be completed in 4 hours or less
- [ ] Scope is focused on a single, specific deliverable
- [ ] No complex integrations or multi-component work
- [ ] Clear, testable acceptance criteria
- [ ] Limited to 1-2 files maximum
- [ ] Single responsibility principle followed

### If Task is Too Large
**The agent will automatically break down into multiple 4-hour tasks:**
- [ ] Split into smaller, focused components
- [ ] Separate data logic from UI components
- [ ] Create individual tasks for each major feature
- [ ] Ensure each subtask is independently testable

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

### Phase 1: Setup and Planning (30 minutes)
1. [ ] Review `tasks/taskList.md` for current project status and priorities
2. [ ] Review relevant PRD sections for feature requirements
3. [ ] Review relevant TECHNICAL_SPEC sections for implementation guidelines
4. [ ] Analyze existing codebase structure and completed components
5. [ ] Identify relevant files and components from existing implementations
6. [ ] Plan component/module architecture following TECHNICAL_SPEC patterns
7. [ ] Set up any required dependencies from approved tech stack
8. [ ] Verify task fits within current development phase timeline

### Phase 2: Core Implementation (2.5 hours)
1. [ ] [Create/modify specific component/function following TECHNICAL_SPEC component architecture]
2. [ ] [Implement core logic using approved patterns from TECHNICAL_SPEC]
3. [ ] [Handle edge cases and error states following TECHNICAL_SPEC error handling]
4. [ ] [Add necessary imports and dependencies from approved tech stack]

### Phase 3: Integration (30 minutes)
1. [ ] [Integrate with existing components following TECHNICAL_SPEC patterns]
2. [ ] [Update routing if needed - follow TECHNICAL_SPEC navigation structure]
3. [ ] [Connect to state management if required - use Zustand patterns from TECHNICAL_SPEC]
4. [ ] [Ensure proper data flow following TECHNICAL_SPEC data management]
5. [ ] [Verify integration with existing completed features from taskList.md]

### Phase 4: Styling and UI (30 minutes)
1. [ ] [Apply consistent styling using Tailwind CSS and design system from TECHNICAL_SPEC]
2. [ ] [Ensure responsive design following TECHNICAL_SPEC responsive guidelines]
3. [ ] [Add loading states and animations following TECHNICAL_SPEC UI patterns]
4. [ ] [Implement accessibility features meeting WCAG 2.1 AA requirements]

### Phase 5: Testing and Validation (15 minutes)
1. [ ] [Test functionality manually following TECHNICAL_SPEC testing strategy]
2. [ ] [Verify edge cases and error scenarios]
3. [ ] [Check for console errors and performance issues]
4. [ ] [Validate against PRD requirements and TECHNICAL_SPEC guidelines]
5. [ ] [Ensure performance meets PRD success metrics]
6. [ ] [Test integration with existing completed features]

### Phase 6: Final Review (15 minutes)
1. [ ] [Code review and cleanup following TECHNICAL_SPEC code quality standards]
2. [ ] [Remove console.logs and debug code]
3. [ ] [Optimize performance to meet PRD success metrics]
4. [ ] [Update documentation if required]
5. [ ] [Verify alignment with PRD objectives and TECHNICAL_SPEC architecture]
6. [ ] [Update taskList.md to mark this task as completed]

## Files to Modify/Create
**Maximum 2 files per 4-hour task:**
- [ ] `[file path 1]` - [purpose - follow TECHNICAL_SPEC project structure]
- [ ] `[file path 2]` - [purpose - follow TECHNICAL_SPEC project structure]

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
- [ ] [Integration testing with existing completed features]

## Acceptance Criteria
- [ ] [Criterion 1 - specific and measurable, aligned with PRD objectives]
- [ ] [Criterion 2 - specific and measurable, aligned with PRD objectives]
- [ ] [Criterion 3 - specific and measurable, aligned with PRD objectives]
- [ ] [Performance criteria - must meet PRD success metrics]
- [ ] [Accessibility criteria - must meet WCAG 2.1 AA compliance]
- [ ] [Integration criteria - works seamlessly with existing features]
- [ ] [Time constraint - task completed within 4 hours]

## Notes and Considerations
[Any additional information, warnings, or special considerations the agent should be aware of. Include references to specific PRD sections or TECHNICAL_SPEC guidelines that may impact implementation. Note how this task fits into the current project phase and what comes next. Emphasize the 4-hour time constraint and scope limitations.]

## Example Usage
[Provide a brief example of how the implemented feature should work, demonstrating alignment with PRD requirements and TECHNICAL_SPEC patterns]

---

## Agent Instructions
1. **Review taskList.md first** - understand current project status, priorities, and completed work
2. **Review PRD and TECHNICAL_SPEC** - understand project requirements and technical constraints
3. **Verify task priority and phase alignment** - ensure task fits within current development timeline
4. **Check dependencies** - confirm all required work is completed before starting
5. **Validate task scope** - ensure task can be completed in 4 hours maximum
6. **Read the entire task description carefully** before starting implementation
7. **Follow the implementation steps in order** unless there's a compelling reason to deviate
8. **Check off each step** as you complete it
9. **Ask for clarification** if any requirements are unclear or conflict with documentation
10. **Test thoroughly** before marking the task complete
11. **Document any deviations** from the original plan or documentation
12. **Provide progress updates** at each major phase
13. **Ensure compliance** with PRD objectives and TECHNICAL_SPEC guidelines
14. **Update taskList.md** when task is completed to maintain project status
15. **Respect time constraints** - if task exceeds 4 hours, break it down into smaller tasks

## Success Metrics
- [ ] All functional requirements implemented and aligned with PRD
- [ ] All non-functional requirements met and follow TECHNICAL_SPEC
- [ ] Code follows project conventions from TECHNICAL_SPEC
- [ ] No console errors or warnings
- [ ] Feature works as expected in all scenarios
- [ ] Code is clean and maintainable
- [ ] Performance meets PRD success metrics
- [ ] Accessibility meets WCAG 2.1 AA compliance
- [ ] Integration with existing features works seamlessly
- [ ] Task completion advances project toward next milestone
- [ ] **Task completed within 4 hours (half-day constraint)**

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
- [ ] Task completion is documented in taskList.md
- [ ] Project status and roadmap are updated accordingly
- [ ] **Task scope was appropriate for 4-hour completion time**

---

# Task Generator

## How the Agent Creates a New Task

### 1. Agent Automatically Consults Current Project Status
**The agent will automatically review the current project status:**
- Current project phase and milestone
- Completed tasks and their status
- Pending task priorities and dependencies
- Available effort and timeline
- Next actions and roadmap

### 2. Agent Verifies Task Priority and Phase Alignment
**The agent will automatically ensure your task aligns with:**
- Current development phase (Phase 1/2/3/4)
- Priority order (HIGH → MEDIUM → LOW)
- Dependencies are already completed
- Timeline fits within current milestone

### 3. Agent Validates Task Scope (CRITICAL)
**The agent will automatically ensure your task fits the 4-hour constraint:**
- [ ] Task can be completed in half a day maximum
- [ ] Scope is focused and specific
- [ ] Limited to 1-2 files maximum
- [ ] Single responsibility principle
- [ ] Clear, testable deliverable

**If task is too large, the agent will automatically break it down:**
- Split into multiple 4-hour tasks
- Separate components and logic
- Create individual tasks for each feature
- Ensure each subtask is independently testable

### 4. Agent Fills Out the Template
The agent will automatically complete all sections of the template above with specific details for your task, ensuring alignment with current project status and 4-hour time constraint.

### 5. Agent Generates Task File
The agent will automatically use the following naming convention for your task file:
```
tasks/[YYYY-MM-DD]-[task-name].md
```

Example: `tasks/2024-01-15-create-vehicle-list-component.md`

### 6. Agent Creates Task File Structure
The agent will automatically create each task file following this exact structure:

```markdown
# Task: [Task Name]

**Created:** [YYYY-MM-DD]
**Priority:** [High/Medium/Low]
**Complexity:** [Half-Day (4 hours)]
**Phase:** [Phase 1/2/3/4]
**Status:** [Not Started/In Progress/Completed/Blocked]
**Dependencies:** [List completed tasks this depends on]

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

### 7. Task Management (Handled by Agent)

#### Create a New Task
The agent will automatically create new task files with the proper naming convention and structure.


#### Update Task Status
- **Not Started**: Task is created but not yet begun
- **In Progress**: Task is currently being worked on
- **Completed**: Task has been finished successfully
- **Blocked**: Task cannot proceed due to external dependencies

