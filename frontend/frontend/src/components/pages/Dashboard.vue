<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p class="text-gray-500 mt-1">Have a snapshot information of your assets and performance.</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-2 text-gray-500 cursor-pointer hover:border-gray-300 transition-colors w-full md:w-auto">
        <Calendar class="w-4 h-4" />
        <span class="text-sm">Pick a date</span>
      </div>
    </div>

    <!-- Loading/Error States -->
    <div v-if="loading" class="text-center py-10 text-gray-500">Loading dashboard data...</div>
    <div v-else-if="error" class="text-center py-10 text-red-500">
      {{ error }}
      <button @click="loadData" class="block mx-auto mt-2 text-blue-600 underline">Retry</button>
    </div>

    <div v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Card 1: Total Users -->
        <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
          <div class="text-3xl font-bold text-gray-800">{{ counts.totalUsers }}</div>
          <div class="text-gray-500 mt-1">Total Users</div>
        </div>
        <!-- Card 2: Administrators -->
        <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
          <div class="text-3xl font-bold text-gray-800">{{ counts.admins }}</div>
          <div class="text-gray-500 mt-1">Administrators</div>
        </div>
        <!-- Card 3: Regular Users -->
        <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
          <div class="text-3xl font-bold text-gray-800">{{ counts.regularUsers }}</div>
          <div class="text-gray-500 mt-1">Regular Users</div>
        </div>
        <!-- Card 4: Roles -->
        <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
          <div class="text-3xl font-bold text-gray-800">{{ counts.roles }}</div>
          <div class="text-gray-500 mt-1">Roles</div>
        </div>
      </div>

      <!-- Customer Insights Section (Mapped to System Data) -->
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">System Insights</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Chart 1: Users by Role -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="mb-6">
              <h3 class="font-bold text-gray-800">Users by Role</h3>
              <p class="text-sm text-gray-500 mt-1">Distribution of users across different roles.</p>
            </div>
            <div class="h-64 relative">
               <Bar v-if="roleChartData" :data="roleChartData" :options="chartOptions" />
            </div>
          </div>

          <!-- Chart 2: System Overview -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="mb-6">
              <h3 class="font-bold text-gray-800">System Overview</h3>
              <p class="text-sm text-gray-500 mt-1">Comparative view of system resources.</p>
            </div>
            <div class="h-64 relative">
              <Bar v-if="overviewChartData" :data="overviewChartData" :options="chartOptions" />
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { Calendar } from "lucide-vue-next";
import axios from "axios";
import { useRouter } from "vue-router";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const router = useRouter();

// State
const loading = ref(true);
const error = ref(null);
const users = ref([]);
const roles = ref([]);
const permissions = ref([]);

// Computed Counts
const counts = computed(() => {
  const allUsers = users.value;
  // Naive check for admin role, adjust based on actual data structure
  const admins = allUsers.filter(u => {
      // Check if roles array contains an admin-like role object or string
      const userRoles = u.roles || [];
      return userRoles.some(r => (r.name || r).toLowerCase().includes('admin'));
  }).length;

  return {
    totalUsers: allUsers.length,
    admins: admins,
    regularUsers: allUsers.length - admins,
    roles: roles.value.length
  };
});

// Chart Data: Users by Role
const roleChartData = computed(() => {
  if (loading.value) return null;
  
  const roleCounts = {};
  users.value.forEach(u => {
    const userRoles = u.roles || [];
    if (userRoles.length === 0) {
      roleCounts['No Role'] = (roleCounts['No Role'] || 0) + 1;
    } else {
      userRoles.forEach(r => {
        const rName = r.name || r;
        roleCounts[rName] = (roleCounts[rName] || 0) + 1;
      });
    }
  });

  return {
    labels: Object.keys(roleCounts),
    datasets: [{
      label: 'Users',
      backgroundColor: '#3b82f6',
      data: Object.values(roleCounts),
      borderRadius: 4,
      barThickness: 30
    }]
  };
});

// Chart Data: System Overview
const overviewChartData = computed(() => {
  if (loading.value) return null;
  return {
    labels: ['Total Users', 'Roles', 'Permissions'],
    datasets: [{
      label: 'Count',
      backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
      data: [users.value.length, roles.value.length, permissions.value.length],
      borderRadius: 4,
      barThickness: 40
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { grid: { display: false } },
    x: { grid: { display: false } }
  }
};

// API Handling
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function loadData() {
  loading.value = true;
  error.value = null;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push('/login');
      return;
    }

    const [usersRes, rolesRes, permsRes] = await Promise.all([
      api.get("/users").catch(() => ({ data: [] })),
      api.get("/roles").catch(() => ({ data: [] })),
      api.get("/permissions").catch(() => ({ data: [] }))
    ]);

    users.value = usersRes.data || [];
    roles.value = rolesRes.data || [];
    permissions.value = permsRes.data || [];
    
    // Debug log
    console.log("Loaded data:", { 
      users: users.value.length, 
      roles: roles.value.length, 
      permissions: permissions.value.length 
    });

  } catch (err) {
    console.error("Error loading dashboard data:", err);
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
    } else {
      error.value = "Failed to load dashboard data.";
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* Tailwind */
</style>