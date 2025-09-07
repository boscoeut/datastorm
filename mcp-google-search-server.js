#!/usr/bin/env node

/**
 * MCP Server for Google Search
 * Connects to the Supabase Edge Function
 */

import { config } from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Load environment variables from .env file
config();

// Configuration
const SUPABASE_URL = 'https://duiakhiloobwkgvfrcnl.supabase.co/functions/v1/google-search-mcp';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.ANON_KEY;

if (!ANON_KEY) {
  console.error('Error: SUPABASE_ANON_KEY or ANON_KEY environment variable is required');
  process.exit(1);
}

class GoogleSearchMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'google-search-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'google_search',
            description: 'Perform web searches using Google\'s Programmable Search Engine',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The search query string',
                },
                num_results: {
                  type: 'number',
                  description: 'Number of results to return (default: 10, max: 100)',
                  minimum: 1,
                  maximum: 100,
                },
                site_restriction: {
                  type: 'string',
                  description: 'Restrict search to a specific site (e.g., "example.com")',
                },
                language: {
                  type: 'string',
                  description: 'Search language preference (e.g., "en", "es", "fr")',
                },
                start_index: {
                  type: 'number',
                  description: 'Starting index for pagination (default: 1)',
                  minimum: 1,
                },
              },
              required: ['query'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'google_search') {
        return await this.performGoogleSearch(request.params.arguments);
      }
      
      throw new Error(`Unknown tool: ${request.params.name}`);
    });
  }

  async performGoogleSearch(args) {
    try {
      const response = await fetch(SUPABASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'google_search',
            arguments: args,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`MCP error: ${data.error.message}`);
      }

      // Parse the result content
      const result = JSON.parse(data.result.content[0].text);
      
      return {
        content: [
          {
            type: 'text',
            text: this.formatSearchResults(result),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error performing search: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  formatSearchResults(result) {
    if (!result.success) {
      return `Search failed: ${result.error}`;
    }

    let output = `🔍 Search Results for: "${result.query}"\n`;
    output += `📊 Total Results: ${result.totalResults}\n`;
    output += `⏱️ Search Time: ${result.searchTime}s\n\n`;

    result.results.forEach((item, index) => {
      output += `**${index + 1}. ${item.title}**\n`;
      output += `🔗 ${item.link}\n`;
      output += `📝 ${item.snippet}\n`;
      output += `🌐 ${item.displayLink}\n\n`;
    });

    return output;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Google Search MCP Server running on stdio');
  }
}

const server = new GoogleSearchMCPServer();
server.run().catch(console.error);

