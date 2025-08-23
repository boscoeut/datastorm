# Remove Feature Command Specification

## Overview
The `@removeFeature` command completely removes a feature from the Electric Vehicle Data Hub application, systematically removing all references from project specifications, task lists, and agent documentation.

## What This Command Does

When invoked, the agent will:

1. **Ask for Feature Details**:
   - Feature Name (must match project documentation)

2. **Analyze the Feature**:
   - Verify feature exists in project documentation
   - Identify all areas where feature is referenced
   - Check for feature dependencies
   - Assess removal impact

3. **Update Project Documentation**:
   - Remove from Project Requirements Document (PRD.md)
   - Update Technical Specification (TECHNICAL_SPEC.md)
   - Update User Interface Specification (USER_INTERFACE_SPEC.md)

4. **Clean Up Development Tasks**:
   - Find all feature-related tasks in taskList.md
   - Remove or update irrelevant tasks
   - Adjust remaining task priorities
   - Update implementation roadmap

5. **Update Agent Documentation**:
   - Remove feature-specific responsibilities from agents
   - Update agent workflows
   - Ensure agents remain functional

## Implementation Process

### Phase 1: Feature Analysis
- Validate feature exists in project documentation
- Identify all feature references
- Check for feature dependencies
- Assess removal scope and conflicts

### Phase 2: Documentation Updates
- Remove from PRD.md core features and objectives
- Remove from TECHNICAL_SPEC.md technical requirements
- Remove from USER_INTERFACE_SPEC.md UI/UX specifications
- Ensure no orphaned references remain

### Phase 3: Task List Cleanup
- Review taskList.md for feature-related tasks
- Remove or update irrelevant tasks
- Rebalance remaining task priorities
- Update implementation roadmap

### Phase 4: Agent Updates
- Remove feature-specific responsibilities from agents
- Update agent workflows and integration requirements

## File Update Patterns

### PRD.md
```markdown
# Before
#### 3.2 [Feature Name]
- **Feature Description**: Description of the feature
- **Feature Requirements**: Specific requirements

# After
# [Feature section completely removed]
```

### TECHNICAL_SPEC.md
```markdown
# Before
### 3.2 [Feature] Components
- **Component Name**: Description
- **Component Requirements**: Technical requirements

# After
# [Feature section completely removed]
```

### USER_INTERFACE_SPEC.md
```markdown
# Before
### [Feature] UI Components
- **Component Design**: Design specifications
- **Component Behavior**: Behavior requirements

# After
# [Feature section completely removed]
```

### taskList.md
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
1. No remaining references to removed feature
2. All specifications remain internally consistent
3. No orphaned task dependencies
4. Agent documentation remains functional
5. Project scope appropriately reduced

## Error Handling

### Common Issues
1. **Feature Not Found**: Verify feature name and check for variations
2. **Dependent Features**: Identify and handle feature dependencies
3. **Orphaned References**: Search for any remaining references
4. **Document Inconsistencies**: Resolve conflicting information

### Rollback Capability
- Keep backup of original documents before removal
- Document all changes made during removal process
- Provide rollback instructions if needed

## Example Usage

### Example: Remove Advanced Search Feature
**Input:**
- Feature Name: "advanced-search"

**Result:**
- Removed from PRD features
- Removed from technical specifications
- Removed from UI specifications
- Removed search-related tasks
- Removed search-specific agent workflows

## Integration with Other Commands

- **@createTask**: May create cleanup tasks for feature removal
- **@projectManager analyze**: May analyze impact on remaining features
- **@boss execute-next**: May adjust next task priorities

## Success Criteria

1. Complete feature removal from all specifications
2. All documents remain internally consistent
3. All feature-related tasks removed or updated
4. Agent documentation updated and functional
5. Project scope appropriately reduced

---

**Note**: Use carefully as feature removal significantly impacts project scope and timeline. The AI agent will guide you through providing the necessary information and automatically handle all documentation updates and task cleanup while maintaining project consistency. Always validate removal scope and ensure stakeholders are aware of the impact.
