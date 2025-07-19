// Helper functions to manage cookies consistently across the application

// Set a cookie with given name, value, and days until expiration
export function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof window === 'undefined') return; // Skip if not in browser
  
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

// Get a cookie by name
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null; // Skip if not in browser
  
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  
  return null;
}

// Delete a cookie by name
export function deleteCookie(name: string): void {
  if (typeof window === 'undefined') return; // Skip if not in browser
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

// Check if a cookie exists
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}