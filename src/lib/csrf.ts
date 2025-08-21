/**
 * CSRF Token Utilities for Frontend
 */

/**
 * Get CSRF token from cookies
 */
export function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf-token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Create headers with CSRF token for API requests
 */
export function getAPIHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
  
  const csrfToken = getCSRFToken();
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  
  return headers;
}

/**
 * Perform authenticated API request with CSRF protection
 */
export async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const { headers = {}, ...restOptions } = options;
  
  const requestHeaders = {
    ...getAPIHeaders(),
    ...(headers as Record<string, string>)
  };

  // Log missing CSRF token for debugging
  if (!requestHeaders['X-CSRF-Token'] && 
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || 'GET').toUpperCase())) {
    console.warn('CSRF token not found for state-changing request to:', url);
  }
  
  return fetch(url, {
    ...restOptions,
    headers: requestHeaders,
    credentials: 'include'
  });
}
