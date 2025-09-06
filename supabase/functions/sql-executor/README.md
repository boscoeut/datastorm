# SQL Executor Edge Function

## Overview
This edge function provides a secure way to execute SQL queries against the Supabase database from the frontend application. It includes security measures to prevent malicious SQL operations while allowing read-only queries.

## Security Features
- **Query Validation**: Only allows SELECT, WITH, EXPLAIN, DESCRIBE, and SHOW operations
- **Forbidden Operations**: Blocks DROP, DELETE, UPDATE, INSERT, CREATE, ALTER, TRUNCATE, GRANT, REVOKE, EXEC, EXECUTE, CALL, BEGIN, COMMIT, ROLLBACK
- **Input Sanitization**: Validates query structure before execution
- **Error Handling**: Returns detailed error messages for debugging

## Usage

### Request Format
```typescript
POST /functions/v1/sql-executor
Content-Type: application/json

{
  "query": "SELECT * FROM vehicles LIMIT 10;"
}
```

### Response Format
```typescript
{
  "success": boolean;
  "data"?: any[];
  "error"?: string;
  "columns"?: string[];
  "rowCount"?: number;
  "executionTime"?: number;
}
```

## Example Queries

### List Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Show Table Schema
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
ORDER BY ordinal_position;
```

### Query Data
```sql
SELECT * FROM vehicles LIMIT 10;
```

### Count Records
```sql
SELECT COUNT(*) as total_records FROM vehicles;
```

## Error Handling
The function returns appropriate error messages for:
- Empty queries
- Forbidden SQL operations
- SQL syntax errors
- Database connection issues
- Unexpected errors

## Deployment
Deploy this function using the Supabase CLI:
```bash
supabase functions deploy sql-executor
```

## Environment Variables
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access

## Database Function
This edge function relies on the `execute_sql` database function defined in migration `003_sql_executor_function.sql`. This function safely executes SQL queries and returns results as JSON.
