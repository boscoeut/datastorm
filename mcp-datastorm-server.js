#!/usr/bin/env node

/**
 * Local MCP Server Wrapper for Datastorm MCP Server
 * 
 * This acts as a local MCP server that forwards requests to the deployed
 * Supabase Edge Function MCP server.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Configuration
const DATASTORM_MCP_URL = 'https://duiakhiloobwkgvfrcnl.supabase.co/functions/v1/mcp-server';
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('Error: SUPABASE_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

// Create MCP server
const server = new Server(
  {
    name: 'datastorm-mcp-wrapper',
    version: '2.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools (return static list since remote server requires auth)
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Return the tools directly without calling the remote server
  // since the remote server requires authentication for discovery
  return {
    tools: [
      {
        name: 'populate-images',
        description: 'Populate vehicle image galleries by searching for and downloading images from Google Search via mcp-server edge function. Requires admin privileges.',
        inputSchema: {
          type: 'object',
          properties: {
            vehicleId: {
              type: 'string',
              description: 'Vehicle ID to populate images for'
            },
            model: {
              type: 'string',
              description: 'Vehicle model name'
            },
            trim: {
              type: 'string',
              description: 'Vehicle trim level (optional)'
            },
            manufacturer: {
              type: 'string',
              description: 'Vehicle manufacturer (optional)'
            },
            maxImages: {
              type: 'number',
              description: 'Maximum number of images to download (default: 8)',
              minimum: 1,
              maximum: 20
            }
          },
          required: ['vehicleId', 'model']
        }
      },
      {
        name: 'update-vehicle-details',
        description: 'Update vehicle details including specifications, news articles, and manufacturer information. Performs comprehensive research and database updates.',
        inputSchema: {
          type: 'object',
          properties: {
            manufacturer: {
              type: 'string',
              description: 'Vehicle manufacturer name (e.g., "Tesla", "Ford")'
            },
            model: {
              type: 'string',
              description: 'Vehicle model name (e.g., "Model 3", "F-150 Lightning")'
            },
            trim: {
              type: 'string',
              description: 'Vehicle trim level (optional, e.g., "Performance", "Long Range")'
            },
            year: {
              type: 'number',
              description: 'Model year (optional, defaults to current year)'
            }
          },
          required: ['manufacturer', 'model']
        }
      },
      {
        name: 'web_search',
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
      {
        name: 'image_search',
        description: 'Search for images using Google\'s Programmable Search Engine',
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
            image_size: {
              type: 'string',
              enum: ['huge', 'icon', 'large', 'medium', 'small', 'xlarge', 'xxlarge'],
              description: 'Filter by image size',
            },
            image_type: {
              type: 'string',
              enum: ['clipart', 'face', 'lineart', 'stock', 'photo', 'animated'],
              description: 'Filter by image type',
            },
            image_color_type: {
              type: 'string',
              enum: ['color', 'gray', 'trans'],
              description: 'Filter by color type',
            },
            safe: {
              type: 'string',
              enum: ['active', 'off'],
              description: 'Safe search setting',
            },
          },
          required: ['query'],
        },
      },
    ]
  };
});

// Call a tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const response = await fetch(DATASTORM_MCP_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: request.params.name,
          arguments: request.params.arguments || {}
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`MCP Server Error: ${result.error.message}`);
    }

    // Parse the content from the MCP server response
    const content = result.result.content || [];
    
    return {
      content: content.map(item => ({
        type: item.type || 'text',
        text: item.text || JSON.stringify(item, null, 2)
      }))
    };
  } catch (error) {
    console.error('Error calling tool:', error);
    throw error;
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Datastorm MCP Server Wrapper running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
