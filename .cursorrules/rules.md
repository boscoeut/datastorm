# Cursor Rules for Datastorm Project

## Project Overview
This is a React + TypeScript project using:
- React 19 with modern patterns
- Shadcn/ui components with Radix UI primitives
- Zustand for state management
- Tailwind CSS for styling
- Vite for build tooling
- ESLint for code quality

## Code Style & Architecture

### React Components
- Use functional components with hooks
- Prefer named exports over default exports
- Use TypeScript interfaces for component props
- Follow React 19 best practices and patterns
- Use React.memo() for performance optimization when appropriate
- Implement proper error boundaries

### State Management with Zustand
- Create stores in `src/stores/` directory
- Use TypeScript for store definitions
- Prefer multiple small stores over one large store
- Use immer for complex state updates when needed
- Implement proper store persistence when required
- Use selectors for derived state

### Shadcn/ui Components
- Extend existing Shadcn components rather than creating from scratch
- Follow Shadcn's component composition patterns
- Use Radix UI primitives for custom components
- Maintain consistent styling with Tailwind CSS
- Use `cn()` utility for conditional classes

### TypeScript
- Enable strict mode (already configured)
- Use proper type annotations for all functions and variables
- Prefer interfaces over types for object shapes
- Use generic types when appropriate
- Implement proper error handling with typed errors

### File Organization
- Keep components in `src/components/`
- Store utilities in `src/lib/`
- Use barrel exports (index.ts) for clean imports
- Follow feature-based organization for complex features
- Keep related files close together

### Styling
- Use Tailwind CSS utility classes
- Prefer utility classes over custom CSS
- Use CSS variables for theme values
- Implement responsive design with Tailwind breakpoints
- Use `@apply` sparingly and only for complex patterns

### Performance
- Implement proper React.memo() usage
- Use useCallback and useMemo appropriately
- Lazy load components when beneficial
- Optimize bundle size with proper imports
- Use React DevTools for performance profiling

### Testing
- Write unit tests for utility functions
- Test component behavior, not implementation
- Use React Testing Library for component tests
- Mock external dependencies appropriately
- Maintain good test coverage

### Code Quality
- Follow ESLint rules strictly
- Use Prettier for consistent formatting
- Write self-documenting code with clear names
- Add JSDoc comments for complex functions
- Keep functions small and focused

### Git & Collaboration
- Use conventional commit messages
- Create feature branches for new development
- Keep commits atomic and focused
- Update documentation when changing APIs
- Review code before merging

## Specific Patterns

### Component Structure
```tsx
interface ComponentProps {
  // Props interface
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Hooks first
  // State and effects
  // Event handlers
  // Render logic
  return <div>...</div>
}
```

### Zustand Store Pattern
```tsx
interface StoreState {
  // State interface
}

interface StoreActions {
  // Actions interface
}

export const useStore = create<StoreState & StoreActions>((set, get) => ({
  // State
  // Actions
}))
```

### Error Handling
- Use try-catch blocks for async operations
- Implement proper error boundaries
- Provide meaningful error messages
- Log errors appropriately
- Handle loading and error states in UI

### Accessibility
- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation works
- Test with screen readers
- Follow WCAG guidelines

## Dependencies
- Keep dependencies up to date
- Use exact versions for critical packages
- Audit dependencies regularly
- Prefer smaller, focused packages
- Document why specific packages are chosen

## Build & Deployment
- Use Vite for fast development
- Optimize production builds
- Implement proper environment configuration
- Use environment variables for secrets
- Set up CI/CD pipelines

## Documentation
- Keep README.md updated
- Document complex business logic
- Use TypeScript for self-documenting code
- Add inline comments for non-obvious code
- Maintain API documentation

## Security
- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS in production
- Implement proper authentication
- Follow OWASP guidelines
