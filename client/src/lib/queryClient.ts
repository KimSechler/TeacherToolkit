import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
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

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Enable background updates
      staleTime: 5 * 60 * 1000, // 5 minutes - reasonable cache time
      retry: (failureCount, error) => {
        // Retry network errors, but not auth errors
        if (error instanceof Error && error.message.includes('401')) {
          return false;
        }
        return failureCount < 3; // Retry up to 3 times
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations for auth errors
        if (error instanceof Error && error.message.includes('401')) {
          return false;
        }
        return failureCount < 2; // Retry mutations up to 2 times
      },
    },
  },
});
