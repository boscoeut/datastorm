import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface SqlRequest {
  query: string;
}

interface SqlResponse {
  success: boolean;
  data?: any[];
  error?: string;
  columns?: string[];
  rowCount?: number;
  executionTime?: number;
}

// Security: List of allowed SQL operations
const ALLOWED_OPERATIONS = [
  'SELECT',
  'WITH',
  'EXPLAIN',
  'DESCRIBE',
  'SHOW'
];

// Security: List of forbidden SQL operations
const FORBIDDEN_OPERATIONS = [
  'DROP',
  'DELETE',
  'UPDATE',
  'INSERT',
  'CREATE',
  'ALTER',
  'TRUNCATE',
  'GRANT',
  'REVOKE',
  'EXEC',
  'EXECUTE',
  'CALL',
  'BEGIN',
  'COMMIT',
  'ROLLBACK'
];

function validateSqlQuery(query: string): { isValid: boolean; error?: string } {
  const trimmedQuery = query.trim().toUpperCase();
  
  // Check if query is empty
  if (!trimmedQuery) {
    return { isValid: false, error: 'Query cannot be empty' };
  }
  
  // Check for forbidden operations
  for (const forbidden of FORBIDDEN_OPERATIONS) {
    if (trimmedQuery.includes(forbidden)) {
      return { 
        isValid: false, 
        error: `Operation '${forbidden}' is not allowed for security reasons` 
      };
    }
  }
  
  // Check if query starts with allowed operation
  const startsWithAllowed = ALLOWED_OPERATIONS.some(op => 
    trimmedQuery.startsWith(op)
  );
  
  if (!startsWithAllowed) {
    return { 
      isValid: false, 
      error: `Query must start with one of: ${ALLOWED_OPERATIONS.join(', ')}` 
    };
  }
  
  return { isValid: true };
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }

  try {
    const { query }: SqlRequest = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query is required' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Validate the SQL query
    const validation = validateSqlQuery(query);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const startTime = Date.now();
    
    // Execute the query
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_query: query 
    });

    const executionTime = Date.now() - startTime;

    if (error) {
      console.error('SQL execution error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `SQL Error: ${error.message}`,
          executionTime 
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Process results
    let columns: string[] = [];
    let rowCount = 0;
    
    if (data && Array.isArray(data) && data.length > 0) {
      columns = Object.keys(data[0]);
      rowCount = data.length;
    }

    const response: SqlResponse = {
      success: true,
      data: data || [],
      columns,
      rowCount,
      executionTime
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Unexpected error: ${error.message}` 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
});
