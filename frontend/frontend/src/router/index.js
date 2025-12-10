import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/components/pages/Dashboard.vue";
import Users from "@/components/pages/Users.vue";
import Roles from "@/components/pages/Roles.vue";
import Permissions from "@/components/pages/Permissions.vue";
import Account from "@/components/pages/Account.vue";
import Login from "@/components/pages/Login.vue";

const routes = [
  { 
    path: "/login", 
    name: "login", 
    component: Login,
    meta: { 
      title: "Login",
      public: true,
      hideSidebar: true
    }
  },
  { 
    path: "/", 
    name: "dashboard", 
    component: Dashboard,
    meta: { 
      title: "Dashboard",
      requiresAuth: true,
      permission: "view_dashboard" // Optional - if user doesn't have this, they'll be redirected to account
    }
  },
  { 
    path: "/users", 
    name: "users", 
    component: Users,
    meta: { 
      title: "Users",
      requiresAuth: true,
      permission: "view_users"
    }
  },
  { 
    path: "/roles", 
    name: "roles", 
    component: Roles,
    meta: { 
      title: "Roles",
      requiresAuth: true,
      permission: "view_roles"
    }
  },
  { 
    path: "/permissions", 
    name: "permissions", 
    component: Permissions,
    meta: { 
      title: "Permissions",
      requiresAuth: true,
      permission: "view_permissions"
    }
  },
  { 
    path: "/account", 
    name: "account", 
    component: Account,
    meta: { 
      title: "Account",
      requiresAuth: true 
    }
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/login"
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


import { hasPermission } from '@/utils/permissions';

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Role Management`;
  }
  
  // Check if going to login with existing token
  if (to.path === '/login' && token) {
    next('/');
    return;
  }
  
  // Check if trying to access protected route without token
  if (to.meta.requiresAuth && !token) {
    next('/login');
    return;
  }
  
  // Check permission if route requires specific permission
  if (to.meta.permission && token) {
    if (!hasPermission(to.meta.permission)) {
      // Log the permission issue (for debugging)
      console.warn(`Access denied: User does not have permission '${to.meta.permission}' for route '${to.path}'`);
      
      // Redirect to a safe page
      // Try dashboard first, then account (which all authenticated users can access)
      if (hasPermission('view_dashboard')) {
        next('/');
      } else {
        // If no dashboard permission, go to account page
        next('/account');
      }
      return;
    }
  }
  
  // Check if component exists
  if (!to.matched.length) {
    next('/login');
    return;
  }
  
  next();
});


export default router;