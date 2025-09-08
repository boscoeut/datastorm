#!/usr/bin/env node

/**
 * Test script for the Datastorm MCP Server Wrapper
 */

import { spawn } from 'child_process';

console.log('Testing Datastorm MCP Server Wrapper...\n');

// Load environment variables from .env file
import { config } from 'dotenv';
config();

// Verify required environment variables
if (!process.env.SUPABASE_ACCESS_TOKEN) {
  console.error('❌ Error: SUPABASE_ACCESS_TOKEN environment variable is required');
  console.error('Please create a .env file with your Supabase access token');
  console.error('See .env.example for reference');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');

// Test the MCP server wrapper
const mcpServer = spawn('node', ['mcp-datastorm-server.js'], {
  cwd: '/Users/mebert/Documents/BitBucket/gitHub/datastorm',
  env: {
    ...process.env,
    SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN
  }
});

// Send initialize request
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

console.log('Sending initialize request...');
mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');

// Send tools/list request
setTimeout(() => {
  const listRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list'
  };
  
  console.log('Sending tools/list request...');
  mcpServer.stdin.write(JSON.stringify(listRequest) + '\n');
}, 1000);

// Handle responses
mcpServer.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log('Response:', JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('Raw output:', line);
    }
  });
});

mcpServer.stderr.on('data', (data) => {
  console.log('Server log:', data.toString());
});

mcpServer.on('close', (code) => {
  console.log(`\nMCP server wrapper exited with code ${code}`);
});

// Clean up after 5 seconds
setTimeout(() => {
  console.log('\nTest completed, shutting down...');
  mcpServer.kill();
  process.exit(0);
}, 5000);
