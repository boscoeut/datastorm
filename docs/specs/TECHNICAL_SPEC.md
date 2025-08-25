# Technical Specification Document
## Electric Vehicle Data Hub

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Next Review:** [Date + 2 weeks]

---

## System Architecture Overview

### Technology Stack
- **Development Environment:** Cursor IDE with AI-powered development assistance
- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Vite with hot module replacement
- **Styling:** Tailwind CSS with CSS variables
- **State Management:** Zustand with TypeScript
- **UI Components:** Shadcn/ui with Radix UI primitives
- **Data Visualization:** Shadcn charts (https://ui.shadcn.com/charts/)
- **Data Grids:** TanStack Table (React Table v8) for sortable, filterable data tables
- **HTTP Client:** Axios with interceptors
- **Database:** Supabase (PostgreSQL) with real-time subscriptions
- **Database Tools:** Supabase MCP Tool integration in Cursor for direct database operations
- **Serverless Functions:** Supabase Edge Functions for backend logic and API endpoints
- **Testing:** React Testing Library + Jest
- **Code Quality:** ESLint + Prettier

### Required Dependencies
```json
{
  "dependencies": {
    "@tanstack/react-table": "^8.x.x",
    "recharts": "^2.x.x"
  }
}
```

### Development Environment
- **IDE:** Cursor IDE with AI-powered development assistance and intelligent code completion
- **Database Integration:** Supabase MCP Tool integration for direct database operations, migrations, and management
- **AI Assistance:** AI-powered code generation, refactoring, and debugging support
- **Version Control:** Git integration with enhanced AI-powered commit message generation and code review assistance

### Architecture Pattern
- **Component Architecture:** Feature-based organization with reusable UI components
- **State Management:** Multiple focused Zustand stores with TypeScript interfaces
- **Data Flow:** Unidirectional data flow with centralized state management
- **Error Handling:** Comprehensive error boundaries and typed error handling
- **Performance:** React.memo, useCallback, useMemo for optimization

---

## Development Tools and Workflow

### Cursor IDE Features
- **AI-Powered Development:** Intelligent code completion, refactoring suggestions, and bug detection
- **Supabase Integration:** Direct database access through MCP Tool for schema management, data queries, and migrations
- **Enhanced Git Workflow:** AI-assisted commit messages, code review suggestions, and conflict resolution
- **Real-time Collaboration:** Built-in collaboration features for team development
- **Performance Insights:** AI-powered performance analysis and optimization suggestions

### Database Development Workflow
- **Schema Management:** Direct database schema modifications through Cursor's Supabase MCP Tool
- **Migration Management:** Automated migration creation and application from within the IDE
- **Data Operations:** Direct SQL execution and data manipulation for development and testing
- **Real-time Monitoring:** Database performance and query optimization insights
- **Backup and Recovery:** Development branch management and data restoration capabilities

### Supabase MCP Tool Integration
- **Direct Database Access:** Execute SQL queries, create tables, and manage schema directly from Cursor
- **Migration Management:** Create, apply, and rollback database migrations without leaving the IDE
- **Development Branches:** Create and manage development database branches for feature development
- **Real-time Operations:** Monitor database logs, performance metrics, and real-time subscriptions
- **Data Management:** Insert, update, and delete test data directly from the development environment
- **Schema Visualization:** View table structures, relationships, and constraints through the MCP Tool interface
- **Edge Function Management:** Deploy, update, and manage Edge Functions directly from the IDE

## Frontend Architecture

### Project Structure
```
datastorm/
├── web/                       # Frontend web application
│   ├── src/                   # Frontend application source
│   │   ├── components/
│   │   │   ├── ui/           # Shadcn/ui base components
│   │   │   ├── data-display/ # Data visualization components
│   │   │   ├── vehicle/      # Vehicle-related components
│   │   │   ├── news/         # News and content components
│   │   │   └── layout/       # Layout and navigation components
│   │   ├── stores/           # Zustand state stores
│   │   ├── lib/              # Utility functions and helpers
│   │   ├── types/            # TypeScript type definitions
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API and external service integrations
│   │   └── pages/            # Page-level components
│   ├── package.json          # Frontend dependencies and scripts
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── vite.config.ts        # Vite build configuration
│   └── tsconfig.json         # TypeScript configuration
├── supabase/                  # Supabase configuration and functions
│   ├── functions/            # Edge Functions
│   │   ├── vehicle-api/      # Vehicle-related API endpoints
│   │   ├── news-api/         # News and content API endpoints
│   │   ├── auth/             # Authentication and user management
│   │   ├── webhooks/         # External service webhooks
│   │   └── utils/            # Shared utility functions
│   ├── migrations/           # Database migrations
│   └── config/               # Supabase configuration files
└── database/                  # Database schema and seed data
```

### Component Architecture
- **Atomic Design:** Atoms → Molecules → Organisms → Templates → Pages
- **Composition Pattern:** Prefer composition over inheritance
- **Props Interface:** All components must have typed props interfaces
- **Error Boundaries:** Implement at page and feature levels
- **Loading States:** Consistent loading patterns across all data components

---

## State Management Architecture

### Zustand Store Structure
```typescript
// Example store pattern following project rules
interface VehicleStoreState {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  filters: VehicleFilters;
  loading: boolean;
  error: string | null;
}

interface VehicleStoreActions {
  fetchVehicles: (filters?: VehicleFilters) => Promise<void>;
  selectVehicle: (vehicle: Vehicle) => void;
  updateFilters: (filters: Partial<VehicleFilters>) => void;
  clearError: () => void;
}

export const useVehicleStore = create<VehicleStoreState & VehicleStoreActions>((set, get) => ({
  // State implementation
}));
```

### Store Organization
- **Vehicle Store:** Vehicle data, specifications, and comparison state
- **News Store:** News articles, rumors, and industry updates
- **UI Store:** Global UI state, navigation, and user preferences
- **Filter Store:** Search and filtering state across all data types

### State Persistence
- **Local Storage:** User preferences and recent searches
- **Session Storage:** Temporary filter states and navigation
- **Store Hydration:** Proper state restoration on page reload
- **Database Sync:** Supabase real-time synchronization for collaborative features

---

## Data Management

### Database Architecture
- **Supabase Integration:** PostgreSQL database with built-in authentication and authorization
- **Database Schema:** Normalized schema for vehicles, specifications, and user preferences
- **Row Level Security:** Implement RLS policies for data access control
- **Real-time Subscriptions:** Live updates for collaborative features and data changes
- **Database Migrations:** Version-controlled schema changes using Supabase migrations
- **Backup Strategy:** Automated daily backups with point-in-time recovery

### Data Sources and APIs
- **Vehicle Specifications:** NHTSA API, manufacturer APIs, EV database APIs
- **News Content:** RSS feeds, news APIs, industry publications
- **Real-time Updates:** Supabase real-time subscriptions for live data feeds
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Backend APIs:** Supabase Edge Functions for custom business logic and external API integrations

### Data Models
```typescript
interface Vehicle {
  id: string;
  manufacturer: Manufacturer;
  model: string;
  year: number;
  specifications: VehicleSpecifications;
  performance: PerformanceMetrics;
  battery: BatterySpecifications;
  pricing: PricingInformation;
  availability: AvailabilityStatus;
}

interface VehicleSpecifications {
  dimensions: Dimensions;
  weight: WeightMetrics;
  cargo: CargoCapacity;
  safety: SafetyRatings;
  features: VehicleFeatures[];
}
```

### Data Validation and Caching
- **Input Validation:** Zod schemas for runtime type validation
- **Data Caching:** React Query for server state management
- **Cache Strategy:** Stale-while-revalidate with background updates
- **Error Handling:** Graceful degradation for missing or invalid data
- **Database Operations:** Supabase client with optimistic updates and offline support
- **API Validation:** Edge Function input validation with Zod schemas and proper error responses

---

## Edge Functions Architecture

### Edge Function Overview
- **Purpose:** Serverless backend logic for complex business operations, external API integrations, and data processing
- **Runtime:** Deno runtime with TypeScript support
- **Deployment:** Automatic deployment through Supabase CLI and MCP Tool integration
- **Scaling:** Automatic scaling based on demand with cold start optimization

### Edge Function Organization
```
supabase/functions/
├── vehicle-api/               # Vehicle-related API endpoints
│   ├── index.ts              # Main vehicle API router
│   ├── specifications.ts     # Vehicle specification processing
│   ├── comparison.ts         # Vehicle comparison logic
│   └── search.ts             # Advanced search algorithms
├── news-api/                  # News and content API endpoints
│   ├── index.ts              # Main news API router
│   ├── aggregator.ts         # News aggregation from multiple sources
│   ├── processor.ts          # Content processing and enrichment
│   └── webhooks.ts           # External news service webhooks
├── auth/                      # Authentication and user management
│   ├── index.ts              # Auth middleware and utilities
│   ├── permissions.ts        # Role-based access control
│   └── webhooks.ts           # Auth webhook handlers
├── webhooks/                  # External service integrations
│   ├── nhtsa-webhook.ts      # NHTSA API webhook handler
│   ├── manufacturer-webhook.ts # Manufacturer API webhook handler
│   └── news-webhook.ts       # News service webhook handler
└── utils/                     # Shared utility functions
    ├── validation.ts          # Common validation schemas
    ├── database.ts            # Database connection helpers
    ├── external-apis.ts       # External API client utilities
    └── response.ts            # Standardized response formatting
```

### Edge Function Implementation Standards
- **TypeScript:** All functions must be written in TypeScript with strict type checking
- **Error Handling:** Comprehensive error handling with proper HTTP status codes
- **Input Validation:** Zod schemas for request validation and type safety
- **Response Format:** Consistent JSON response structure across all endpoints
- **Logging:** Structured logging for debugging and monitoring
- **Security:** Proper authentication, authorization, and input sanitization


---

## User Interface Components

### Data Display Components
- **DataTable:** TanStack Table implementation for sortable, filterable tables with virtualization
- **ComparisonGrid:** Side-by-side vehicle comparison using TanStack Table
- **ChartComponents:** Interactive charts using Shadcn charts (https://ui.shadcn.com/charts/)
- **SpecificationCards:** Detailed vehicle specification displays
- **FilterPanel:** Advanced filtering with multiple criteria

### Navigation Components
- **MainNavigation:** Primary navigation with breadcrumbs
- **SearchBar:** Global search with autocomplete
- **FilterSidebar:** Collapsible filter panel
- **Pagination:** Efficient navigation through large datasets
- **Breadcrumbs:** Clear navigation hierarchy

### Responsive Design
- **Mobile-First:** Design for mobile devices first
- **Breakpoints:** Tailwind CSS responsive breakpoints
- **Touch Optimization:** Touch-friendly interactions and gestures
- **Performance:** Optimized rendering for mobile devices

---

## Data Grids and Tables

### TanStack Table Integration
- **Primary Data Grid:** TanStack Table (React Table v8) for all data table implementations
- **Installation:** `npm install @tanstack/react-table`
- **Features:** Sorting, filtering, pagination, column resizing, row selection, virtualization
- **Performance:** Optimized for large datasets with virtual scrolling support
- **Customization:** Highly customizable with TypeScript support and theme integration
- **Bundle Size:** Lightweight (~15KB) with tree-shaking support

### Data Grid Implementation Standards
- **Column Definitions:** Type-safe column definitions with accessorKey and header properties
- **Sorting:** Built-in sorting with custom sort functions for complex data
- **Filtering:** Global and column-specific filtering with debounced search
- **Pagination:** Server-side or client-side pagination based on data source
- **Row Selection:** Single and multi-row selection with keyboard navigation
- **Responsive Design:** Mobile-optimized with column hiding and touch interactions

### Data Grid Components
- **VehicleListTable:** Main vehicle listing with TanStack Table implementation
- **ComparisonTable:** Side-by-side vehicle comparison using TanStack Table
- **SpecificationTable:** Vehicle specifications display with sortable columns
- **FilterableDataGrid:** Advanced filtering and search capabilities

### TanStack Table Implementation Example
```typescript
// Example implementation pattern for vehicle data tables
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table'

interface VehicleTableProps {
  data: Vehicle[]
  onRowSelect?: (vehicle: Vehicle) => void
}

const VehicleTable: React.FC<VehicleTableProps> = ({ data, onRowSelect }) => {
  const columns = [
    { accessorKey: 'manufacturer.name', header: 'Manufacturer' },
    { accessorKey: 'model', header: 'Model' },
    { accessorKey: 'year', header: 'Year' },
    { accessorKey: 'battery_capacity', header: 'Battery (kWh)' },
    { accessorKey: 'range_miles', header: 'Range (mi)' },
    { accessorKey: 'price', header: 'Price' },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} onClick={() => onRowSelect?.(row.original)}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

## Data Visualization

### Chart Library Integration
- **Shadcn Charts:** Primary charting library with React wrappers (https://ui.shadcn.com/charts/)
- **Chart Types:** Bar charts, line charts, radar charts, comparison charts, area charts
- **Interactivity:** Hover effects, zoom, pan, and drill-down capabilities
- **Responsiveness:** Charts that adapt to container size changes

### Visualization Components
- **PerformanceCharts:** Vehicle performance comparisons
- **SpecificationRadar:** Multi-dimensional specification comparisons
- **TimelineCharts:** Historical data and trend analysis

### Data Density Optimization
- **Information Hierarchy:** Clear visual hierarchy for data presentation
- **Color Coding:** Consistent color schemes for data categories
- **Interactive Elements:** Tooltips, legends, and data point highlighting
- **Accessibility:** Screen reader support and keyboard navigation

---

## Performance Optimization

### React Performance
- **React.memo:** Memoize components that receive stable props
- **useCallback:** Stable function references for event handlers
- **useMemo:** Expensive calculations and derived state
- **Code Splitting:** Lazy loading for route-based code splitting
- **Bundle Optimization:** Tree shaking and dynamic imports

### Data Performance
- **Virtualization:** Virtual scrolling for large datasets
- **Pagination:** Efficient data loading and rendering
- **Debouncing:** Search input debouncing for API calls
- **Caching:** Intelligent caching strategies for frequently accessed data
- **Lazy Loading:** Progressive loading of data and images

### Build Optimization
- **Vite Configuration:** Optimized build settings for production
- **Bundle Analysis:** Regular bundle size monitoring
- **Tree Shaking:** Remove unused code from production builds
- **Asset Optimization:** Image and font optimization

---

## Testing Strategy

### Testing Framework
- **Unit Testing:** Jest for utility functions and hooks
- **Component Testing:** React Testing Library for component behavior
- **Edge Function Testing:** Deno testing framework for serverless function testing

### 10.3 Testing Patterns
```typescript
// Example test pattern following project rules
describe('VehicleCard', () => {
  it('should display vehicle information correctly', () => {
    const vehicle = mockVehicle();
    render(<VehicleCard vehicle={vehicle} />);
    
    expect(screen.getByText(vehicle.model)).toBeInTheDocument();
    expect(screen.getByText(vehicle.manufacturer.name)).toBeInTheDocument();
  });
});
```


## Security and Data Protection

### Input Validation
- **Client-Side Validation:** Zod schemas for form inputs
- **Server-Side Validation:** Supabase RLS policies and database constraints
- **Edge Function Validation:** Zod schemas for API input validation with proper error responses
- **XSS Prevention:** Sanitize all user inputs before rendering
- **CSRF Protection:** Supabase built-in CSRF protection for API requests

### Data Privacy
- **User Data:** Minimal collection and secure storage in Supabase
- **Third-Party APIs:** Secure API key management through environment variables
- **HTTPS:** Enforce HTTPS in production for all Edge Function endpoints
- **Data Encryption:** Supabase provides encryption at rest and in transit
- **Authentication:** Supabase Auth with JWT tokens and refresh token rotation
- **Edge Function Security:** Proper CORS configuration, rate limiting, and input sanitization


