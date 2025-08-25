# Supabase Edge Functions - Deno Configuration

This directory contains Supabase Edge Functions configured to run on Deno runtime.

## Prerequisites

- [Deno](https://deno.land/) installed on your system
- [Supabase CLI](https://supabase.com/docs/reference/cli) installed
- VS Code with [Deno extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno) (recommended)

## Project Structure

```
supabase/functions/
├── .vscode/
│   └── settings.json          # VS Code Deno configuration
├── tesla-news-fetcher/        # Tesla news fetching function
│   ├── index.ts               # Main function code
│   ├── types.ts               # TypeScript type definitions
│   ├── test.ts                # Test file
│   └── README.md              # Function-specific documentation
├── deno.jsonc                 # Deno configuration
└── .gitignore                 # Git ignore rules
```

## Deno Configuration

The `deno.jsonc` file provides:

- **Import Map**: Maps package names to URLs for clean imports
- **Compiler Options**: TypeScript compilation settings
- **Tasks**: Predefined commands for development
- **Linting**: Code quality rules
- **Formatting**: Code style configuration
- **Testing**: Test file patterns

## Available Tasks

Run these commands from the functions directory:

```bash
# Development with hot reload
deno task dev

# Run function once
deno task start

# Run tests
deno task test

# Lint code
deno task lint

# Format code
deno task fmt

# Type check
deno task check

# Compile to executable
deno task compile
```

## Development Workflow

1. **Start Development Server**:
   ```bash
   cd supabase/functions
   deno task dev
   ```

2. **Make Changes**: Edit your TypeScript files
3. **Auto-reload**: Deno will automatically restart on file changes
4. **Test**: Use `deno task test` to run tests
5. **Deploy**: Use Supabase CLI to deploy functions

## Import Usage

With the import map configured, you can use clean imports:

```typescript
// Instead of long URLs, use package names
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import { serve } from 'std/http/server.ts'
```

## Environment Variables

Edge Functions require these environment variables:

```bash
GOOGLE_GEMINI_API_KEY=your_api_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing

Run tests with:

```bash
deno task test
```

Or run specific test files:

```bash
deno test --allow-net --allow-env --allow-read test.ts
```

## Linting and Formatting

- **Lint**: `deno task lint`
- **Format**: `deno task fmt`

## VS Code Integration

The `.vscode/settings.json` file configures VS Code for optimal Deno development:

- Enables Deno language server
- Configures formatting and linting
- Sets up import suggestions
- Enables auto-formatting on save

## Deployment

Deploy functions using Supabase CLI:

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy tesla-news-fetcher

# Deploy with environment variables
supabase functions deploy --env-file .env.local
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure `deno.jsonc` is in the functions directory
2. **Type Errors**: Run `deno task check` to verify types
3. **Permission Errors**: Ensure proper flags are set in tasks
4. **VS Code Issues**: Install Deno extension and reload window

### Deno Permissions

Edge Functions require these permissions:
- `--allow-net`: Network access
- `--allow-env`: Environment variable access
- `--allow-read`: File system read access

### Version Compatibility

- Deno: 1.28+ recommended
- Supabase CLI: Latest version
- Edge Functions: Compatible with Supabase project

## Resources

- [Deno Documentation](https://deno.land/manual)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno VS Code Extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
