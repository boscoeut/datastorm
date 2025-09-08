# Admin Vehicle Update Feature

## Overview
The Admin Vehicle Update feature allows administrators to update vehicle information in the database using AI-powered research and data extraction. This feature integrates with the MCP server's `update-vehicle-details` tool to provide intelligent vehicle data updates.

## Components

### 1. VehicleUpdateForm (`VehicleUpdateForm.tsx`)
The main form component that allows admins to input vehicle information and trigger updates.

**Features:**
- Form validation for required fields
- Real-time error handling
- Loading states during updates
- Detailed result display with statistics
- Responsive design

**Form Fields:**
- **Manufacturer** (required): Vehicle manufacturer (e.g., Tesla, Ford, BMW)
- **Model** (required): Vehicle model (e.g., Model 3, F-150, X5)
- **Trim** (optional): Vehicle trim level (e.g., Performance, Long Range, Base)
- **Year** (optional): Model year (defaults to current year)

### 2. AdminVehicleUpdateTest (`AdminVehicleUpdateTest.tsx`)
A test component that allows admins to quickly test the vehicle update functionality with predefined parameters.

**Features:**
- One-click test with Tesla Model 3 Performance
- Real-time test results
- Error reporting
- Success/failure indicators

### 3. AdminPage (`AdminPage.tsx`)
The main admin dashboard page that contains all admin tools.

**Features:**
- Admin-only access control
- Dashboard overview
- Integration of all admin tools
- Responsive layout

## Service Layer

### VehicleUpdateService (`vehicle-update.ts`)
The service layer that handles communication with the MCP server.

**Methods:**
- `updateVehicleDetails(params)`: Main method to update vehicle details
- `validateParams(params)`: Validates input parameters

**Features:**
- Error handling and retry logic
- Structured response handling
- Type safety with TypeScript interfaces

## Integration

### MCP Server Integration
The feature integrates with the MCP server's `update-vehicle-details` tool:

```typescript
const { data, error } = await supabase.functions.invoke('mcp-server', {
  body: {
    method: 'update-vehicle-details',
    params: {
      manufacturer: 'Tesla',
      model: 'Model 3',
      trim: 'Performance',
      year: 2024
    }
  }
});
```

### Authentication & Authorization
- Requires admin authentication
- Protected routes using `ProtectedRoute` component
- Admin role verification through `AuthContext`

### Navigation
- Added to sidebar navigation for admin users only
- Accessible via `/admin` route
- Integrated with existing navigation system

## Usage

### For Administrators

1. **Access the Admin Dashboard**
   - Sign in with admin credentials
   - Navigate to "Admin Dashboard" in the sidebar
   - Or go directly to `/admin`

2. **Update Vehicle Details**
   - Fill in the vehicle information form:
     - Enter manufacturer (required)
     - Enter model (required)
     - Optionally specify trim and year
   - Click "Update Vehicle" button
   - Wait for AI-powered research to complete
   - Review the results and statistics

3. **Test the Functionality**
   - Use the test component to quickly verify the system works
   - Click "Run Test" to test with Tesla Model 3 Performance
   - Review test results

### Expected Results

When a vehicle update is successful, you'll see:
- **Manufacturer Statistics**: Number of manufacturers created/updated
- **Vehicle Statistics**: Number of vehicles created/updated
- **Specification Statistics**: Number of specifications created/updated
- **News Statistics**: Number of news articles added
- **Trims Processed**: List of trim levels processed
- **Processing Details**: Model year, timestamp, and source information

## Error Handling

The system handles various error scenarios:

1. **Validation Errors**: Form validation prevents invalid inputs
2. **Network Errors**: Connection issues with MCP server
3. **API Errors**: MCP server processing errors
4. **Authentication Errors**: Admin access verification

All errors are displayed to the user with clear messaging and suggested actions.

## Technical Details

### Dependencies
- React 18+ with TypeScript
- Supabase client for API calls
- Radix UI components for form elements
- Lucide React for icons
- Tailwind CSS for styling

### File Structure
```
src/
├── components/
│   └── admin/
│       ├── VehicleUpdateForm.tsx
│       ├── AdminVehicleUpdateTest.tsx
│       └── README.md
├── pages/
│   └── AdminPage.tsx
├── services/
│   └── vehicle-update.ts
└── stores/
    └── layout-store.ts (updated)
```

### Type Definitions
```typescript
interface VehicleUpdateParams {
  manufacturer: string;
  model: string;
  trim?: string;
  year?: number;
}

interface VehicleUpdateResult {
  success: boolean;
  message: string;
  data: {
    manufacturer_created: number;
    manufacturer_updated: number;
    vehicles_created: number;
    vehicles_updated: number;
    specifications_created: number;
    specifications_updated: number;
    news_articles_added: number;
    news_articles_skipped: number;
    trims_processed: string[];
    vehicle_ids: string[];
    model_year_processed: string;
  };
  timestamp: string;
  source: string;
  error?: string;
}
```

## Future Enhancements

1. **Bulk Updates**: Support for updating multiple vehicles at once
2. **Update History**: Track and display update history
3. **Scheduled Updates**: Automatically update vehicles on a schedule
4. **Advanced Filtering**: Filter and search through update results
5. **Export Functionality**: Export update results to CSV/JSON
6. **Real-time Notifications**: WebSocket notifications for update progress
7. **Update Templates**: Predefined templates for common vehicle updates

## Troubleshooting

### Common Issues

1. **"Admin access required" error**
   - Ensure you're signed in with admin credentials
   - Check that your user role is set to 'admin' in the database

2. **"MCP server error" messages**
   - Verify the MCP server edge function is deployed
   - Check that all required environment variables are set
   - Ensure the Gemini proxy is working correctly

3. **Form validation errors**
   - Ensure all required fields are filled
   - Check that year is within valid range (1900 to current year + 2)
   - Verify manufacturer and model names are not empty

4. **Network timeouts**
   - Vehicle updates can take 30-60 seconds due to AI processing
   - Check your internet connection
   - Try again if the request times out

### Debug Information

Enable console logging to see detailed debug information:
- Open browser developer tools
- Check the Console tab for detailed logs
- Look for messages starting with 🚗, ✅, or ❌ emojis
