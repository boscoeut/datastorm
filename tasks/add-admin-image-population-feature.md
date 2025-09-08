# Add Admin Image Population Feature

## Task Overview
Add a new feature to the vehicle detail page that allows admin users to populate images for vehicles using Google Search MCP edge function.

## Requirements
- Add an admin-only "Populate Images" button to the vehicle detail page
- When clicked, the button should:
  1. Use the built-in Google Search functionality to search for images related to the selected model and trim
  2. Download the found images
  3. Upload them to the image gallery

## Implementation Steps

### 1. Analyze Current Vehicle Detail Page
- Examine the existing vehicle detail page component
- Understand the current admin authentication system
- Review the image gallery implementation

### 2. Add Admin-Only Button
- Add conditional rendering for admin users
- Create a "Populate Images" button component
- Position it appropriately on the vehicle detail page

### 3. Integrate Google Search
- Use the built-in Google Search functionality in the MCP server
- Create a service function to call the MCP server
- Handle the search results for images

### 4. Implement Image Download
- Create functionality to download images from search results
- Handle different image formats and sizes
- Implement error handling for failed downloads

### 5. Implement Image Upload
- Integrate with existing image upload functionality
- Upload downloaded images to the vehicle's image gallery
- Update the UI to show newly uploaded images

### 6. Error Handling and UX
- Add loading states during the process
- Implement proper error handling
- Show success/error messages to the user

## Acceptance Criteria
- [ ] Admin users see a "Populate Images" button on vehicle detail pages
- [ ] Non-admin users do not see the button
- [ ] Clicking the button triggers image search using the model and trim
- [ ] Images are successfully downloaded from search results
- [ ] Downloaded images are uploaded to the vehicle's image gallery
- [ ] The process shows appropriate loading and success/error states
- [ ] The feature works for different vehicle models and trims

## Technical Considerations
- Ensure proper authentication checks for admin access
- Handle rate limiting for image downloads
- Implement proper error handling for network issues
- Consider image quality and size optimization
- Ensure the feature doesn't interfere with existing functionality

## Files to Modify
- Vehicle detail page component
- Admin authentication utilities
- Image upload services
- Edge function integration services

## Dependencies
- Built-in Google Search functionality in MCP server
- Current admin authentication system
- Image gallery and upload functionality
