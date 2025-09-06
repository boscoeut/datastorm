# Add Quick Search to Vehicle Database Page

## Task Overview
Add a quick search input field to the vehicle database page that allows users to type and immediately filter the vehicle list below without needing to expand the advanced search panel.

## Current State Analysis
- The vehicle database page (`VehiclesPage.tsx`) currently uses the `VehicleList` component which includes a `VehicleSearch` component
- The `VehicleSearch` component has a comprehensive search and filter system but requires expansion to access the search input
- The search functionality is already implemented in the backend (`VehicleService.search`) and frontend store (`vehicle-store.ts`)
- The search query is debounced and integrated with the vehicle fetching system

## Requirements
1. **Quick Search Input**: Add a prominent search input field in the main header area of the vehicle database page
2. **Real-time Filtering**: The search should filter the vehicle list in real-time as the user types
3. **Debounced Search**: Implement debouncing to avoid excessive API calls while typing
4. **Visual Integration**: The quick search should be visually integrated with the existing design
5. **State Management**: Integrate with the existing vehicle store search functionality
6. **Accessibility**: Ensure proper labeling and keyboard navigation

## Implementation Steps

### Step 1: Add Quick Search Component
- Create a new `QuickSearch` component or add quick search functionality to the existing page
- Position the search input prominently in the header area, below the page title
- Use the existing `Input` component from the UI library for consistency

### Step 2: Integrate with Vehicle Store
- Connect the quick search input to the existing `setSearchQuery` function in the vehicle store
- Ensure the search query updates trigger the `fetchVehicles` function
- Maintain the existing debouncing mechanism (300ms delay)

### Step 3: Update Page Layout
- Modify `VehiclesPage.tsx` to include the quick search input
- Position it between the header and the vehicle list
- Ensure responsive design for mobile and desktop

### Step 4: Handle Search State
- Clear the quick search when the advanced search panel is used
- Sync the quick search with the advanced search panel if both are present
- Maintain search state across page navigation

### Step 5: Visual Design
- Style the search input to match the existing design system
- Add appropriate placeholder text
- Include a search icon for visual clarity
- Ensure proper spacing and alignment

## Technical Specifications

### Component Structure
```tsx
// Quick search input in VehiclesPage.tsx
<div className="mb-6">
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Quick search vehicles..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-10"
    />
  </div>
</div>
```

### State Integration
- Use `useVehicleSearchQuery()` hook to get current search query
- Use `setSearchQuery` from `useVehicleStore()` to update search
- Leverage existing debouncing in the store

### Search Functionality
- Search across vehicle model names (primary)
- Search across manufacturer names
- Case-insensitive search using `ilike` in the backend
- Real-time filtering with 300ms debounce

## Acceptance Criteria
1. ✅ Quick search input is visible and accessible on the vehicle database page
2. ✅ Typing in the search input immediately filters the vehicle list (with debouncing)
3. ✅ Search works across vehicle models and manufacturer names
4. ✅ Search input is properly styled and integrated with the existing design
5. ✅ Search state is maintained and synced with the advanced search panel
6. ✅ Search input is accessible with proper labeling and keyboard navigation
7. ✅ Performance is maintained with debounced search requests
8. ✅ Mobile responsive design works correctly

## Files to Modify
- `web/src/pages/VehiclesPage.tsx` - Add quick search input to the main page
- Potentially `web/src/components/vehicles/VehicleSearch.tsx` - Sync with advanced search

## Dependencies
- Existing vehicle store and search functionality
- UI components (Input, Search icon)
- Debounce hook
- Vehicle service search method

## Testing
1. Test quick search with various vehicle model names
2. Test search with manufacturer names
3. Test debouncing behavior (no excessive API calls)
4. Test integration with advanced search panel
5. Test responsive design on mobile devices
6. Test accessibility with keyboard navigation
7. Test search state persistence

## Notes
- The existing search infrastructure is already in place, so this is primarily a UI enhancement
- The search functionality in `VehicleService.search` already supports text search via `ilike`
- The vehicle store already has debouncing implemented
- This enhancement improves user experience by making search more accessible
