# Add Image Preview to Latest News Section

## Task Overview
Add image previews to the latest news section on the Home page and update the section label from "Latest Industry News" to "Latest News".

## Requirements
1. **Image Preview**: Add image previews to news articles in the latest news section on the Home page
2. **Label Update**: Change the section label from "Latest Industry News" to "Latest News"
3. **UI Enhancement**: Ensure the image previews are properly styled and responsive

## Implementation Steps
1. **Examine Current Implementation**
   - Review the current Home page component structure
   - Identify the latest news section implementation
   - Check existing news data structure and image availability

2. **Update News Section Component**
   - Modify the news section to display image previews
   - Update the section label from "Latest Industry News" to "Latest News"
   - Ensure proper styling and responsive design

3. **Test Implementation**
   - Verify image previews display correctly
   - Ensure responsive design works on different screen sizes
   - Test with various news articles

## Acceptance Criteria
- [ ] Latest news section displays image previews for each news article
- [ ] Section label is changed from "Latest Industry News" to "Latest News"
- [ ] Image previews are properly styled and responsive
- [ ] No breaking changes to existing functionality
- [ ] UI maintains consistent design language

## Technical Notes
- Use existing news data structure
- Ensure images are properly sized and cropped
- Maintain accessibility standards
- Follow existing component patterns

## Files to Modify
- `web/src/components/LandingPage.tsx` (likely contains the Home page)
- Possibly `web/src/components/news/` components if news section is modularized

## Priority
Medium - UI enhancement that improves user experience
