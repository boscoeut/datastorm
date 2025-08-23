# Remove Feature Command Specification

## Overview
The `@removeFeature` command is used to completely remove a feature from the Electric Vehicle Data Hub application. This command ensures that all references to the feature are systematically removed from the project specifications, task list, and agent documentation, maintaining project consistency and preventing orphaned references.

## What This Command Does

The `@removeFeature` command is executed by an AI agent from within Cursor IDE to completely remove a feature from the Electric Vehicle Data Hub application. When this command is invoked, the agent will:

1. **Ask for Feature Details**: The agent will prompt you to provide:
   - **Feature Name**: The exact name of the feature you want to remove (must match what's in the project documentation)

2. **Analyze the Feature**: The agent will automatically:
   - Verify the feature exists in the project documentation
   - Identify all areas where the feature is referenced
   - Check if other features depend on the target feature
   - Assess the impact of removing the feature

3. **Update Project Documentation**: The agent will automatically:
   - Remove the feature from the Project Requirements Document (PRD.md)
   - Update the Technical Specification (TECHNICAL_SPEC.md) to remove technical requirements
   - Update the User Interface Specification (USER_INTERFACE_SPEC.md) to remove UI/UX requirements

4. **Clean Up Development Tasks**: The agent will:
   - Find all tasks related to the removed feature in taskList.md
   - Remove or update tasks that are no longer relevant
   - Adjust priorities of remaining tasks if needed
   - Update the implementation roadmap and milestones

5. **Update Agent Documentation**: The agent will:
   - Remove feature-specific responsibilities from the Boss Agent and Project Manager Agent
   - Update agent workflows to remove references to the deleted feature
   - Ensure all agents remain functional without the removed feature

## Command Purpose
This command performs a comprehensive removal of a feature from the application by:
1. Removing feature references from PRD.md
2. Updating TECHNICAL_SPEC.md to remove technical requirements
3. Updating USER_INTERFACE_SPEC.md to remove UI/UX requirements
4. Analyzing and removing related tasks from taskList.md
5. Updating agent documentation to remove feature-specific responsibilities

## Feature Removal Process

### Phase 1: Feature Identification and Analysis
1. **Feature Validation**: Verify the feature exists in project documentation
2. **Scope Assessment**: Identify all areas where the feature is referenced
3. **Dependency Analysis**: Check if other features depend on the target feature
4. **Impact Assessment**: Evaluate the scope of removal and potential conflicts

### Phase 2: Documentation Updates
1. **PRD.md Updates**: Remove feature from project objectives and core features
2. **TECHNICAL_SPEC.md Updates**: Remove technical requirements and architecture elements
3. **USER_INTERFACE_SPEC.md Updates**: Remove UI/UX specifications and component requirements
4. **Cross-Reference Validation**: Ensure no orphaned references remain

### Phase 3: Task List Cleanup
1. **Task Analysis**: Review taskList.md for feature-related tasks
2. **Task Removal**: Remove or update tasks that are no longer relevant
3. **Priority Rebalancing**: Adjust remaining task priorities as needed
4. **Timeline Updates**: Update implementation roadmap and milestones

### Phase 4: Agent Documentation Updates
1. **Boss Agent Updates**: Remove feature-specific responsibilities and workflows
2. **Project Manager Updates**: Remove feature-specific analysis and planning requirements
3. **Integration Validation**: Ensure agent workflows remain consistent

## Implementation Steps

### Step 1: Feature Reference Removal from PRD.md
- Remove feature from "Core Features" section
- Remove feature from "Project Objectives" if applicable
- Remove feature from "Data Requirements" if applicable
- Update feature count and project scope
- Remove any feature-specific success metrics

### Step 2: Technical Specification Updates
- Remove feature from "System Architecture Overview"
- Remove feature-specific technical requirements
- Update component architecture if feature had dedicated components
- Remove feature from data models and API specifications
- Update performance requirements if feature was performance-critical

### Step 3: UI/UX Specification Updates
- Remove feature-specific component requirements
- Remove feature from design system specifications
- Update layout requirements if feature affected layout
- Remove feature-specific accessibility requirements
- Update responsive design specifications if needed

### Step 4: Task List Analysis and Cleanup
- Identify all tasks related to the removed feature
- Remove completed tasks that are no longer relevant
- Update pending tasks to remove feature dependencies
- Rebalance remaining task priorities
- Update implementation roadmap and milestones

### Step 5: Agent Documentation Updates
- Remove feature-specific responsibilities from Boss Agent
- Update Project Manager Agent workflows
- Remove feature-specific commands and interactions
- Update agent integration requirements

## File Update Patterns

### PRD.md Update Pattern
```markdown
# Before (Feature to be removed)
#### 3.2 [Feature Name]
- **Feature Description**: Description of the feature
- **Feature Requirements**: Specific requirements
- **Feature Benefits**: Benefits of the feature

# After (Feature removed)
# [Feature section completely removed]
```

### TECHNICAL_SPEC.md Update Pattern
```markdown
# Before
### 3.2 [Feature] Components
- **Component Name**: Description
- **Component Requirements**: Technical requirements

# After
# [Feature section completely removed]
```

### USER_INTERFACE_SPEC.md Update Pattern
```markdown
# Before
### [Feature] UI Components
- **Component Design**: Design specifications
- **Component Behavior**: Behavior requirements

# After
# [Feature section completely removed]
```

### taskList.md Update Pattern
```markdown
# Before
#### [Task Number]. Implement [Feature Name]
**Priority:** [Priority Level]
**Effort:** [Effort Estimate]
**Dependencies:** [Feature-specific dependencies]

# After
# [Task completely removed]
```

## Validation Requirements

### Post-Removal Validation
1. **Reference Check**: No remaining references to the removed feature
2. **Documentation Consistency**: All specifications remain internally consistent
3. **Task Dependencies**: No orphaned task dependencies
4. **Agent Workflows**: Agent documentation remains functional
5. **Project Scope**: Project scope is appropriately reduced

### Quality Assurance
1. **Cross-Reference Validation**: Check for any remaining cross-references
2. **Formatting Consistency**: Maintain consistent document formatting
3. **Content Flow**: Ensure document flow remains logical
4. **Version Control**: Update document version numbers if applicable

## Error Handling

### Common Issues and Solutions
1. **Feature Not Found**: Verify feature name and check for variations
2. **Dependent Features**: Identify and handle feature dependencies
3. **Orphaned References**: Search for any remaining references
4. **Document Inconsistencies**: Resolve any conflicting information

### Rollback Capability
- Keep backup of original documents before removal
- Document all changes made during removal process
- Provide rollback instructions if needed

## Example Usage

### Example 1: Remove News Aggregation Feature
When you use `@removeFeature` to remove the news aggregation feature, the agent will:

**Ask you for:**
- Feature Name: "news-aggregation"

**Then automatically:**
- Remove news aggregation from PRD core features
- Remove news components from technical specifications
- Remove news UI requirements from interface specifications
- Remove all news-related tasks from the task list
- Remove news-specific agent responsibilities

### Example 2: Remove Advanced Search Feature
When you use `@removeFeature` to remove the advanced search feature, the agent will:

**Ask you for:**
- Feature Name: "advanced-search"

**Then automatically:**
- Remove advanced search from PRD features
- Remove search components from technical specifications
- Remove search UI requirements from interface specifications
- Remove search-related tasks from the task list
- Remove search-specific agent workflows

## Integration with Other Agent Commands

### Command Dependencies
- **@createTask**: The agent may need to create cleanup tasks for feature removal
- **@projectManager analyze**: The agent may need to analyze impact on remaining features
- **@boss execute-next**: The agent may need to adjust next task priorities

### Command Interactions
- **Task Creation**: The agent may create cleanup tasks for feature removal
- **Project Analysis**: The agent may trigger project status re-evaluation
- **Priority Updates**: The agent may require task priority rebalancing

## Success Criteria

### Feature Removal Success
1. **Complete Removal**: All feature references removed from specifications
2. **Document Consistency**: All documents remain internally consistent
3. **Task Cleanup**: All feature-related tasks removed or updated
4. **Agent Updates**: Agent documentation updated and functional
5. **Project Scope**: Project scope appropriately reduced

### Quality Metrics
1. **Reference Count**: Zero remaining references to removed feature
2. **Document Integrity**: All specifications remain valid and consistent
3. **Task Completeness**: No orphaned or incomplete task references
4. **Agent Functionality**: All agents remain fully functional

## Maintenance and Updates

### Regular Reviews
- **Post-Removal Review**: Validate removal completeness after execution
- **Document Consistency Check**: Ensure all documents remain consistent
- **Task List Validation**: Verify task list integrity
- **Agent Workflow Validation**: Ensure agent workflows remain functional

### Continuous Improvement
- **Process Refinement**: Improve removal process based on experience
- **Template Updates**: Update removal patterns and templates
- **Validation Enhancement**: Strengthen validation and quality checks
- **Documentation Standards**: Maintain high documentation quality

## Conclusion

The `@removeFeature` command provides a systematic approach to removing features from the Electric Vehicle Data Hub application while maintaining project consistency and integrity. When executed by an AI agent from Cursor IDE, it automatically handles all the complex work of updating documentation, removing tasks, and maintaining project consistency.

### Key Benefits
- **Systematic Removal**: Ensures complete feature removal
- **Document Consistency**: Maintains specification integrity
- **Task Cleanup**: Removes all related development tasks
- **Agent Updates**: Keeps agent documentation current
- **Quality Assurance**: Validates removal completeness

### Usage Guidelines
- Use only when feature removal is confirmed and approved
- The agent will guide you through providing the necessary information
- The agent automatically handles all documentation updates and task cleanup
- The agent ensures all changes follow project standards and constraints
- The agent maintains documentation quality throughout the process

---

**Note**: This command should be used carefully as feature removal can significantly impact project scope and timeline. The AI agent will guide you through providing the necessary information and then automatically handle all the complex work of updating documentation, removing tasks, and maintaining project consistency. Always validate the removal scope and ensure all stakeholders are aware of the impact before proceeding with feature removal.
