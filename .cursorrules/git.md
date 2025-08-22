# Git Commit Message Rules

## Commit Message Structure

All commit messages should follow this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Type
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

### Scope
- `ui`: User interface changes
- `api`: API changes
- `store`: State management changes
- `layout`: Layout and navigation changes
- `theme`: Theme and styling changes
- `task`: Task-related changes

### Description
- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize the first letter
- No dot (.) at the end

## Task-Related Commits

**If the change is related to a task, prefix the commit message with the task name:**

```
task: [Task Name] - <type>(<scope>): <description>
```

### Examples:
```
task: implement-theme-switcher - feat(theme): add dark mode toggle component
task: setup-basic-application-layout - feat(layout): create responsive sidebar navigation
task: implement-theme-switcher - fix(ui): resolve theme toggle button alignment issue
```

## Examples

### Feature Commit
```
feat(ui): add task creation form component
```

### Bug Fix Commit
```
fix(store): resolve state persistence issue on page refresh
```

### Documentation Commit
```
docs: update README with installation instructions
```

### Refactor Commit
```
refactor(layout): simplify navigation component structure
```

### Task-Related Commit
```
task: implement-theme-switcher - feat(theme): integrate theme context provider
```

## Rules

1. **Always use the structured format** - no exceptions
2. **Prefix with task name** when the change relates to a specific task
3. **Keep descriptions concise** but descriptive
4. **Use present tense** in descriptions
5. **Reference related issues** in the footer when applicable
6. **Test your commit message** by running `git log --oneline` to ensure readability
