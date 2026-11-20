export interface AuthSessionState {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function readAuthState(): AuthSessionState {
  return {
    isAuthenticated: Boolean(localStorage.getItem('access_token')),
    isAdmin:
      localStorage.getItem('is_staff') === 'true' ||
      localStorage.getItem('is_admin') === 'true',
  };
}

export function clearAuthSession(): AuthSessionState {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('username');
  localStorage.removeItem('is_staff');
  localStorage.removeItem('is_admin');
  window.dispatchEvent(new Event('auth-change'));
  return { isAuthenticated: false, isAdmin: false };
}