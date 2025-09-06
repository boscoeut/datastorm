import { supabase } from '../lib/supabase';

export interface SqlQueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  columns?: string[];
  rowCount?: number;
  executionTime?: number;
}

export interface SqlQueryRequest {
  query: string;
}

export class SqlService {
  /**
   * Execute a SQL query via the edge function
   */
  static async executeQuery(query: string): Promise<SqlQueryResult> {
    try {
      const { data, error } = await supabase.functions.invoke('sql-executor', {
        body: { query }
      });

      if (error) {
        console.error('Edge function error:', error);
        return {
          success: false,
          error: `Function error: ${error.message}`
        };
      }

      return data as SqlQueryResult;
    } catch (err) {
      console.error('SQL service error:', err);
      return {
        success: false,
        error: `Network error: ${err instanceof Error ? err.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get available tables in the database
   */
  static async getTables(): Promise<string[]> {
    try {
      const result = await this.executeQuery(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);

      if (result.success && result.data) {
        return result.data.map((row: any) => row.table_name);
      }
      
      return [];
    } catch (err) {
      console.error('Error fetching tables:', err);
      return [];
    }
  }

  /**
   * Get table schema information
   */
  static async getTableSchema(tableName: string): Promise<any[]> {
    try {
      const result = await this.executeQuery(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = '${tableName}' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);

      return result.success ? result.data || [] : [];
    } catch (err) {
      console.error('Error fetching table schema:', err);
      return [];
    }
  }
}
