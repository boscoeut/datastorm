# Add Search for EVs Feature to Admin Dashboard

## Task Overview
Add a new feature to the Admin Dashboard that allows users to search Google for Electric Vehicles currently for sale, compare the results with the existing Supabase database, and display missing vehicles in a table.

## Requirements

### Functional Requirements
1. **Admin Dashboard Button**: Add a "Search for EVs" button to the Admin Dashboard
2. **Google Search Integration**: Create a new MCP tool that searches Google for Electric Vehicles currently for sale
3. **Database Comparison**: Compare Google search results with existing vehicles in the Supabase database
4. **Results Display**: Display missing vehicles in a table format on the web application
5. **User Experience**: Provide clear feedback during search process and results display

### Technical Requirements
1. **MCP Server Tool**: Implement new tool in `supabase/functions/mcp-server/`
2. **Frontend Integration**: Add UI components to Admin Dashboard
3. **API Integration**: Connect frontend to MCP server tool
4. **Error Handling**: Proper error handling for search failures
5. **Loading States**: Show loading indicators during search process

## Implementation Steps

### Step 1: Create MCP Tool for Google EV Search
- [ ] Add new tool function to `supabase/functions/mcp-server/index.ts`
- [ ] Implement Google search functionality for Electric Vehicles
- [ ] Add proper error handling and response formatting
- [ ] Test the tool independently

### Step 2: Add Frontend UI Components
- [ ] Add "Search for EVs" button to Admin Dashboard
- [ ] Create results table component for missing vehicles
- [ ] Add loading states and error handling
- [ ] Style components to match existing design

### Step 3: Implement Database Comparison Logic
- [ ] Query Supabase database for existing vehicles
- [ ] Compare Google search results with database vehicles
- [ ] Identify missing vehicles
- [ ] Format results for display

### Step 4: Connect Frontend to Backend
- [ ] Create service function to call MCP tool
- [ ] Handle API responses and errors
- [ ] Update UI based on search results
- [ ] Add proper TypeScript types

### Step 5: Testing and Refinement
- [ ] Test complete workflow end-to-end
- [ ] Verify error handling scenarios
- [ ] Ensure responsive design
- [ ] Performance optimization if needed

## Acceptance Criteria
- [ ] Admin Dashboard has a "Search for EVs" button
- [ ] Clicking the button triggers a Google search for Electric Vehicles
- [ ] Search results are compared with Supabase database
- [ ] Missing vehicles are displayed in a table
- [ ] Loading states are shown during search
- [ ] Error handling works for failed searches
- [ ] UI is responsive and matches existing design
- [ ] Feature works without breaking existing functionality

## Technical Specifications

### MCP Tool Interface
```typescript
interface SearchEVsTool {
  name: string;
  description: string;
  parameters: {
    query?: string;
    maxResults?: number;
  };
  handler: (params: any) => Promise<{
    foundVehicles: Vehicle[];
    missingVehicles: Vehicle[];
    totalSearched: number;
  }>;
}
```

### Frontend Components
- `SearchEVsButton`: Triggers the search
- `EVSearchResults`: Displays missing vehicles table
- `LoadingSpinner`: Shows during search process
- `ErrorMessage`: Displays search errors

### Database Schema
- Use existing `vehicles` table for comparison
- Compare by manufacturer, model, and year
- Handle variations in naming conventions

## Dependencies
- Existing MCP server infrastructure
- Google Search API or web scraping capability
- Supabase database connection
- Admin Dashboard components
- TypeScript types for vehicles

## Risk Mitigation
- **Search API Limits**: Implement rate limiting and caching
- **Data Quality**: Handle inconsistent vehicle naming
- **Performance**: Optimize search and comparison algorithms
- **User Experience**: Provide clear feedback and error messages

## Success Metrics
- Feature successfully searches for EVs
- Accurate comparison with database
- Missing vehicles correctly identified
- Good user experience with loading states
- No impact on existing functionality
