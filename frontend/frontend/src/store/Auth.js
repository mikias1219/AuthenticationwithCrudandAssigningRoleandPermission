import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null);
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);
  
  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role?.name || null);
  const userName = computed(() => user.value?.name || null);
  
  function login(authData) {
    token.value = authData.token;
    user.value = authData.user;
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }
  
  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  function hasPermission(permissionName) {
    if (!user.value || !user.value.role || !user.value.role.permissions) {
      return false;
    }
    return user.value.role.permissions.some(p => p.name === permissionName);
  }
  
  return {
    token,
    user,
    isAuthenticated,
    userRole,
    userName,
    login,
    logout,
    hasPermission
  };
});