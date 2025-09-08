# Datastorm - Electric Vehicle Data Hub

A comprehensive platform for electric vehicle data, news, and comparisons built with Supabase, React, and TypeScript.

## Features

- 🚗 **Vehicle Database** - Comprehensive electric vehicle information
- 📰 **News Feed** - Latest EV industry news and updates
- 🖼️ **Image Management** - Automated vehicle image population
- 🔍 **Search & Comparison** - Advanced vehicle search and comparison tools
- 🔐 **Authentication** - Secure user authentication with role-based access
- 📊 **Admin Panel** - Administrative tools for content management

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd datastorm
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd web && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Set up MCP servers** (for AI integration)
   ```bash
   # Follow the MCP setup guide
   cat MCP_SETUP.md
   ```

5. **Start the development server**
   ```bash
   cd web
   npm run dev
   ```

## MCP Integration

This project includes Model Context Protocol (MCP) servers for AI integration:

- **Supabase MCP** - Direct database access
- **Google Search MCP** - Web search capabilities
- **Datastorm MCP** - Custom functionality including image population

See [MCP_SETUP.md](./MCP_SETUP.md) for detailed setup instructions.

## Project Structure

```
datastorm/
├── web/                    # React frontend application
├── supabase/              # Supabase functions and configuration
├── database/              # Database migrations and scripts
├── docs/                  # Project documentation
├── tasks/                 # Development tasks and features
└── mcp-*.js              # MCP server implementations
```

## Key Technologies

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (PostgreSQL, Edge Functions, Storage)
- **Authentication**: Supabase Auth
- **AI Integration**: Model Context Protocol (MCP)
- **Image Processing**: Google Search API integration

## Development

### Database Migrations

```bash
# Apply migrations
supabase db push

# Create new migration
supabase migration new migration_name
```

### Edge Functions

```bash
# Deploy functions
supabase functions deploy function-name
```

### MCP Servers

The MCP servers provide AI integration capabilities:

- **populate-images** - Automatically populate vehicle image galleries
- **web_search** - Perform web searches
- **sql_executor** - Execute database queries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security

- Environment variables are stored in `.env` (not committed to git)
- Access tokens are managed securely through environment variables
- Admin operations require proper authentication

## License

See [LICENSE](./LICENSE) for details.
