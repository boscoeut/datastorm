-- Create a function to safely execute SQL queries
-- This function will be called by the edge function to execute user queries

CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    query_result record;
    rows_array json[] := '{}';
BEGIN
    -- Execute the query and convert results to JSON
    FOR query_result IN EXECUTE sql_query
    LOOP
        rows_array := array_append(rows_array, to_json(query_result));
    END LOOP;
    
    -- Return the results as JSON array
    RETURN to_json(rows_array);
    
EXCEPTION
    WHEN OTHERS THEN
        -- Return error information
        RETURN json_build_object(
            'error', true,
            'message', SQLERRM,
            'code', SQLSTATE
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;
