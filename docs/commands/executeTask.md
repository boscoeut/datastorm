# Task Execution Command

## Purpose
The `@executeTask` command is an AI agent command executed in the Cursor IDE that creates and executes tasks for the Electric Vehicle Data Hub project.

## Workflow
1. **Create Task**: Use `@createTask.md` to generate a properly formatted task based on the user's requirements
2. **Execute Task**: Implement the created task following its specifications and implementation steps
3. **Complete**: Update task status and documentation when finished

## Usage
```
@executeTask [user's task description]
```

The agent will first create a task file using the `@createTask.md` template, then immediately execute that task following its detailed implementation steps, requirements, and acceptance criteria. The created task will contain all necessary details for implementation, so the agent should follow those specifications exactly.
