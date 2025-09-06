# Create SQL Page Task

## Task Overview
Add a new "SQL" page to the Electric Vehicle Data Hub website that allows users to enter SQL queries and execute them against the database through an edge function.

## Requirements
1. **New SQL Page**: Create a dedicated page accessible via navigation
2. **Query Input**: Text area for users to enter SQL queries
3. **Edge Function**: Backend function to safely execute SQL queries
4. **Results Display**: Show query results in a formatted table
5. **Error Handling**: Display SQL errors and validation messages
6. **Security**: Implement proper input validation and query restrictions

## Implementation Steps

### 1. Create SQL Edge Function
- Create `supabase/functions/sql-executor/index.ts`
- Implement SQL query execution with proper error handling
- Add input validation and security measures
- Return results in JSON format

### 2. Create SQL Page Component
- Create `web/src/pages/SqlPage.tsx`
- Add query input textarea with syntax highlighting
- Implement results display table
- Add execute button and loading states
- Include error message display

### 3. Add Navigation and Routing
- Add SQL page to navigation menu
- Update routing in `App.tsx`
- Add appropriate icons and styling

### 4. Create SQL Service
- Create `web/src/services/sql.ts`
- Implement function to call SQL executor edge function
- Add proper error handling and response parsing

## Acceptance Criteria
- [ ] SQL page is accessible via navigation menu
- [ ] Users can enter SQL queries in a text area
- [ ] Queries are executed via edge function
- [ ] Results are displayed in a formatted table
- [ ] Error messages are shown for invalid queries
- [ ] Page has proper loading states and user feedback
- [ ] Security measures prevent malicious SQL injection
- [ ] Responsive design works on all screen sizes

## Technical Specifications
- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Supabase Edge Function with Deno
- **Database**: PostgreSQL via Supabase
- **Security**: Input validation, query sanitization
- **UI Components**: Custom components with shadcn/ui

## Files to Create/Modify
- `supabase/functions/sql-executor/index.ts` (new)
- `web/src/pages/SqlPage.tsx` (new)
- `web/src/services/sql.ts` (new)
- `web/src/App.tsx` (modify)
- `web/src/components/layout/Navigation.tsx` (modify)

## Security Considerations
- Validate SQL queries before execution
- Implement query timeout limits
- Restrict certain dangerous SQL operations
- Add rate limiting for query execution
- Log all executed queries for audit purposes
