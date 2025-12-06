<template>
  <div id="app" class="flex min-h-screen bg-gray-50 text-gray-900">
    <!-- Show Navbar only for non-auth pages -->
    <Navbar v-if="showNavbar" />
    
    <!-- Main content area -->
    <main class="flex-1 transition-all duration-300">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '@/components/pages/Navbar.vue';

const route = useRoute();

// Define which routes should NOT show navbar (auth pages)
const noNavbarRoutes = ['login', 'register', 'forgot-password'];

// Computed property to determine if navbar should show
const showNavbar = computed(() => {
  return !noNavbarRoutes.includes(route.name);
});
</script>

<!-- Global styles are now handled by Tailwind in style.css -->
<style></style>