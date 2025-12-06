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
      requiresAuth: true 
    }
  },
  { 
    path: "/users", 
    name: "users", 
    component: Users,
    meta: { 
      title: "Users",
      requiresAuth: true,
      permission: "manage_users"
    }
  },
  { 
    path: "/roles", 
    name: "roles", 
    component: Roles,
    meta: { 
      title: "Roles",
      requiresAuth: true,
      permission: "manage_users"
    }
  },
  { 
    path: "/permissions", 
    name: "permissions", 
    component: Permissions,
    meta: { 
      title: "Permissions",
      requiresAuth: true,
      permission: "manage_users"
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

// Helper function to log navigation details
function logNavigationDetails(to, from, token) {
  console.log(`\n=== ROUTER DEBUG ===`);
  console.log(`Navigation: ${from.path || '/'} -> ${to.path}`);
  console.log(`From:`, from);
  console.log(`To:`, to);
  console.log(`Token exists: ${!!token}`);
  console.log(`Token value: ${token ? `${token.substring(0, 20)}...` : 'null'}`);
  console.log(`Route name: ${to.name}`);
  console.log(`Route meta:`, to.meta);
  console.log(`Requires auth: ${to.meta.requiresAuth}`);
  console.log(`Is public: ${to.meta.public}`);
  console.log(`===================\n`);
}

// Check if components are properly imported
console.log('=== ROUTER INITIALIZATION ===');
console.log('Dashboard component:', Dashboard);
console.log('Login component:', Login);
console.log('Users component:', Users);
console.log('All routes:', routes);

// Navigation guard with enhanced debugging
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  // Log detailed navigation info
  logNavigationDetails(to, from, token);
  
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Role Management`;
  }
  
  // Check if going to login with existing token
  if (to.path === '/login' && token) {
    console.log('🔵 Already logged in, redirecting to dashboard');
    console.log('Token found:', token.substring(0, 20) + '...');
    next('/');
    return;
  }
  
  // Check if trying to access protected route without token
  if (to.meta.requiresAuth && !token) {
    console.log('🔴 No token, redirecting to login');
    console.log('Route requires auth but no token found');
    next('/login');
    return;
  }
  
  // Check if component exists for the route
  if (!to.matched.length) {
    console.log('⚠️ No route matched, redirecting to login');
    next('/login');
    return;
  }
  
  // Check if component is loaded
  const component = to.matched[0]?.components?.default;
  if (!component) {
    console.log('⚠️ Component not found for route:', to.path);
    console.log('Attempting to load component...');
    
    // Try dynamic import as fallback
    const componentName = to.name || 'dashboard';
    import(`@/components/pages/${componentName.charAt(0).toUpperCase() + componentName.slice(1)}.vue`)
      .then(module => {
        console.log('✅ Component loaded dynamically:', module.default);
        to.matched[0].components.default = module.default;
        next();
      })
      .catch(error => {
        console.error('❌ Failed to load component:', error);
        next('/login');
      });
    return;
  }
  
  console.log('✅ Navigation allowed to:', to.path);
  console.log('Component:', component);
  next();
});

// Add afterEach hook for debugging
router.afterEach((to, from, failure) => {
  console.log(`\n=== AFTER NAVIGATION ===`);
  console.log(`Completed: ${from.path || '/'} -> ${to.path}`);
  console.log(`Navigation ${failure ? 'failed' : 'succeeded'}`);
  if (failure) {
    console.error('Navigation error:', failure);
  }
  console.log(`Current route:`, router.currentRoute.value);
  console.log(`========================\n`);
});

// Error handler for navigation failures
router.onError((error, to, from) => {
  console.error('💥 Router Error:', error);
  console.error('From:', from);
  console.error('To:', to);
  
  // Check if it's a chunk loading error
  if (error && error.message && error.message.includes('Failed to fetch dynamically imported module')) {
    console.error('Chunk loading failed, likely component file missing');
    alert('Page failed to load. Please refresh or check if component exists.');
  }
});

// Export router with additional debugging
router.debug = {
  printRoutes: () => {
    console.log('Available routes:');
    router.getRoutes().forEach(route => {
      console.log(`- ${route.path} (${route.name}) -> ${route.components?.default?.name || 'No component'}`);
    });
  },
  
  checkComponent: (routeName) => {
    const route = router.getRoutes().find(r => r.name === routeName);
    if (route) {
      console.log(`Checking ${routeName}:`, route);
      console.log('Component:', route.components?.default);
    } else {
      console.log(`Route ${routeName} not found`);
    }
  }
};

// Log router initialization
console.log('Router created:', router);
console.log('Router mode:', router.mode);
console.log('Base URL:', router.options.history.base);

export default router;