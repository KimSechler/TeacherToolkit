import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "./supabase";

export type UnauthorizedBehavior = "redirect" | "returnNull" | "throw";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`API Error ${res.status}:`, errorText);
    
    if (res.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }
}

export async function apiRequest(
  methodOrUrl: string,
  urlOrOptions?: string | { method: string; body: string },
  data?: unknown | undefined,
): Promise<Response> {
  let method: string;
  let url: string;
  let body: string | undefined;

  if (typeof urlOrOptions === 'string') {
    // First overload: apiRequest(method, url, data?)
    method = methodOrUrl;
    url = urlOrOptions;
    body = data ? JSON.stringify(data) : undefined;
  } else if (urlOrOptions && typeof urlOrOptions === 'object') {
    // Second overload: apiRequest(url, { method, body })
    method = urlOrOptions.method;
    url = methodOrUrl;
    body = urlOrOptions.body;
  } else {
    throw new Error('Invalid arguments to apiRequest');
  }

  // Get the current session to include the access token
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  // Use relative URLs for API calls (will work with Vercel)
  const apiUrl = url.startsWith('/api/') ? url : `/api/${url}`;

  const res = await fetch(apiUrl, {
    method,
    headers,
    body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get the current session to include the access token
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {};
    
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    // Use relative URLs for API calls
    const url = queryKey.join("/") as string;
    const apiUrl = url.startsWith('/api/') ? url : `/api/${url}`;

    const res = await fetch(apiUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Create and export the query client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
