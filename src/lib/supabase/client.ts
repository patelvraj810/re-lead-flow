import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const hasSupabaseConfig =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('your-project');

/**
 * Server-side Supabase client for use in Server Components and API routes.
 */
export function createSupabaseServerClient() {
  if (!hasSupabaseConfig) {
    return createMockClient();
  }

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return undefined;
      }
    }
  });
}

/**
 * Client-side Supabase client for browser components.
 */
export function createSupabaseClient() {
  if (!hasSupabaseConfig) {
    return createMockClient();
  }

  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}

/**
 * Mock client used when Supabase is not configured.
 * Returns empty datasets so the UI can still render during build/development.
 */
function createMockClient(): any {
  const emptyResult = { data: [], error: null };

  const makeChainable = (): any => {
    const result = { ...emptyResult };

    const handler: ProxyHandler<object> = {
      get(_target, prop) {
        // Terminal properties — return mock result
        if (prop === 'then') return undefined;
        if (prop === 'data') return result.data;
        if (prop === 'error') return result.error;

        // Chaining methods that return another chainable
        return (..._args: any[]) => makeChainable();
      }
    };

    return new Proxy({}, handler);
  };

  const from = (_table: string) => makeChainable();

  return {
    from,
    rpc: () => Promise.resolve(emptyResult),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    }
  };
}