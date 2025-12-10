// Permission utility functions

/**
 * Refresh user data from API and update localStorage
 */
export async function refreshUserPermissions(api) {
  try {
    const response = await api.get('/account');
    const userData = response.data;
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error('Failed to refresh user permissions:', error);
    return null;
  }
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(permissionName) {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    const user = JSON.parse(userStr);
    if (!user.role || !user.role.permissions) return false;
    return user.role.permissions.some(p => p.name === permissionName);
  } catch {
    return false;
  }
}

/**
 * Get all user permissions
 */
export function getUserPermissions() {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return [];
    const user = JSON.parse(userStr);
    if (!user.role || !user.role.permissions) return [];
    return user.role.permissions.map(p => p.name);
  } catch {
    return [];
  }
}

/**
 * Get current user data
 */
export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

