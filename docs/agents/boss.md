# Boss Agent for Cursor IDE

## Overview
The Boss Agent is an AI-powered assistant that coordinates the Electric Vehicle Data Hub project. It analyzes project status, creates detailed tasks, implements features, and ensures continuous development momentum through systematic task execution.

## What This Agent Does

The Boss Agent can:

1. **Analyze Project Status** - Review current progress, completed tasks, and priorities
2. **Create Detailed Tasks** - Generate 4-hour task definitions using templates
3. **Implement Features** - Write code and create components according to specifications
4. **Manage Project Flow** - Coordinate with other agents to maintain momentum
5. **Ensure Quality** - Validate work meets PRD, technical, and UI standards
6. **Handle Features** - Add or remove features using `@addFeature` and `@removeFeature`

## Agent Workflow

### Phase 1: Project Status Analysis
1. **Call Project Manager** - Use `@projectManager analyze` for current status
2. **Review Priorities** - Analyze task priorities and dependencies
3. **Select Next Task** - Identify highest priority task that can start immediately
4. **Validate Readiness** - Ensure all prerequisites are met

### Phase 2: Task Definition Creation
1. **Use Task Template** - Apply `@createTask` template for structure
2. **Fill Task Details** - Complete requirements and implementation steps
3. **Scope Validation** - Ensure task fits within 4-hour constraint
4. **Create Task File** - Generate file in `tasks/` directory

### Phase 3: Task Implementation
1. **Setup and Planning** - Follow implementation steps from task definition
2. **Core Development** - Implement functionality according to specifications
3. **Integration** - Connect with existing components and systems
4. **Testing** - Validate against acceptance criteria
5. **Completion** - Update project status and mark task finished

## Agent Commands

### Primary Commands
- **`@boss execute-next`** - Complete workflow: analyze, create task, implement
- **`@boss analyze`** - Consult project manager and determine next task
- **`@boss create-task`** - Generate detailed task definition
- **`@boss implement`** - Execute most recently created task
- **`@boss status`** - Provide current project status and next actions

### Feature Management
- **`@addFeature`** - Add new feature and update specifications
- **`@removeFeature`** - Remove feature and update specifications

### Integration Commands
- **`@projectManager analyze`** - Get project status and priorities
- **`@projectManager suggest-next`** - Get specific task recommendations
- **`@createTask`** - Use task creation template for planning

## Task Execution Process

### 1. Project Analysis
**Command**: `@projectManager analyze`
**Purpose**: Get project status, identify gaps, determine priorities

### 2. Task Selection Criteria
**The agent automatically evaluates:**
- **Priority Level** - HIGH → MEDIUM → LOW order
- **Dependencies** - All prerequisites must be completed
- **Scope** - Must fit within 4-hour constraint
- **Phase Alignment** - Must align with current development phase
- **Resource Availability** - Required components must exist

### 3. Task Implementation Phases
**The agent follows the 6-phase breakdown:**
- **Phase 1 (30 min)**: Setup, planning, and analysis
- **Phase 2 (2.5 hours)**: Core implementation
- **Phase 3 (30 min)**: Integration with existing systems
- **Phase 4 (30 min)**: Styling and UI implementation
- **Phase 5 (15 min)**: Testing and validation
- **Phase 6 (15 min)**: Final review and cleanup

## Quality Standards

### Code Quality Requirements
- **PRD Compliance** - All features align with project objectives
- **Technical Standards** - Follow TECHNICAL_SPEC architecture patterns
- **UI/UX Standards** - Meet USER_INTERFACE_SPEC design requirements
- **Performance** - Achieve PRD success metrics (< 3s page load)
- **Accessibility** - Maintain WCAG 2.1 AA compliance

### Implementation Standards
- **Component Architecture** - Follow shadcn/ui patterns
- **State Management** - Use Zustand with TypeScript
- **Database Integration** - Follow Supabase patterns with RLS policies
- **Error Handling** - Implement proper error states and user feedback
- **Responsive Design** - Mobile-first approach with specified breakpoints

## Task Management

### File Organization
- **Task Files**: `tasks/[YYYY-MM-DD]-[task-name].md`
- **Task List**: `tasks/taskList.md` - Master project status
- **Documentation**: `docs/` - PRD, technical specs, and UI specs

### Status Tracking
- **Task Status**: Not Started → In Progress → Completed → Blocked
- **Progress Logging**: Document each phase completion
- **Dependency Updates**: Track task dependencies and blockers

## Error Handling

### Common Issues
- **Task Too Large** - Break down into multiple 4-hour tasks
- **Missing Dependencies** - Create prerequisite tasks first
- **Technical Blockers** - Consult technical documentation
- **Scope Creep** - Strictly enforce 4-hour constraint

### Escalation Process
- **Project Manager** - For priority and dependency questions
- **Technical Spec** - For implementation guidance
- **PRD** - For requirement interpretation
- **UI Spec** - For design and component questions

## Success Metrics

### Performance Indicators
- **Task Completion Rate** - 100% within 4 hours
- **Quality Score** - All tasks meet acceptance criteria
- **Integration Success** - New features work with existing functionality
- **Performance Compliance** - Meets PRD success metrics
- **Accessibility Score** - Maintains WCAG 2.1 AA compliance

## Example Workflow

### Complete Task Execution
1. **Analyze project status** using `@projectManager analyze`
2. **Get next task recommendation** using `@projectManager suggest-next`
3. **Create detailed task definition** using `@createTask`
4. **Implement the task** using `@boss implement`
5. **Update project status** using `@projectManager analyze`

### Task Definition Example
**Task**: Create Vehicle List Component
**Priority**: HIGH
**Phase**: Phase 1
**Dependencies**: Basic layout setup, database schema

**Requirements**:
- Display vehicle data in responsive table format
- Follow theme system and design patterns
- Mobile-responsive with touch interactions
- Meet accessibility standards

**Files to Modify/Create**:
- `src/components/vehicles/VehicleList.tsx`
- `src/stores/vehicle-store.ts`

**Acceptance Criteria**:
- Component displays vehicle data correctly
- Follows theme system
- Mobile-responsive
- No console errors
- Meets accessibility standards

## Maintenance

### Regular Reviews
- **Daily Analysis** - Review project progress and update priorities
- **Task Completion** - Update project status after each task
- **Quality Checks** - Ensure completed work meets all standards
- **Dependency Updates** - Track and update task dependencies

### Continuous Improvement
- **Process Optimization** - Refine task creation and implementation workflows
- **Template Updates** - Improve task definition templates
- **Standard Updates** - Keep aligned with evolving requirements
- **Feature Management** - Maintain clean project scope

---

**Note**: The Boss Agent is an AI-powered assistant that drives project execution. It works with the Project Manager Agent to ensure continuous development momentum. All tasks must be properly scoped and executed within the 4-hour constraint. Use `@addFeature` or `@removeFeature` commands to maintain project consistency.
