<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Permissions</h1>
      <p class="text-gray-500 mt-1">Manage system permissions and access controls.</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
        <div class="text-3xl font-bold text-gray-800">{{ permissions.length }}</div>
        <div class="text-gray-500">Total Permissions</div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
        <div class="text-3xl font-bold text-gray-800">{{ guardsCount }}</div>
        <div class="text-gray-500">Active Guards</div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
        <div class="text-3xl font-bold text-gray-800">{{ recentCount }}</div>
        <div class="text-gray-500">New (This Month)</div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Action Bar -->
      <div class="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
        <div class="flex items-center gap-3 w-full md:w-auto">
          <div class="relative w-full md:w-80">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search permissions" 
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
            />
          </div>
        </div>
        <button 
          @click="openCreateModal"
          class="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
        >
          <Plus class="w-4 h-4" />
          Create new
        </button>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <div v-if="loading" class="p-8 text-center text-gray-500">Loading permissions...</div>
        <div v-else-if="filteredPermissions.length === 0" class="p-8 text-center text-gray-500 bg-gray-50">No permissions found.</div>
        <table v-else class="w-full text-sm text-left">
          <thead class="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
            <tr>
              <th class="p-4 w-4">
                <input type="checkbox" class="rounded border-gray-300 text-red-600 focus:ring-red-500">
              </th>
              <th class="p-4">Permission Name</th>
              <th class="p-4">Guard Name</th>
              <th class="p-4">Created At</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="perm in filteredPermissions" :key="perm.id" class="hover:bg-gray-50 transition-colors group">
              <td class="p-4">
                <input type="checkbox" class="rounded border-gray-300 text-red-600 focus:ring-red-500">
              </td>
              <td class="p-4 font-medium text-gray-900">{{ perm.name }}</td>
              <td class="p-4 text-gray-500">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  {{ perm.guard_name || 'web' }}
                </span>
              </td>
              <td class="p-4 text-gray-500">{{ formatDate(perm.created_at) }}</td>
              <td class="p-4 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button @click="editPermission(perm)" class="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button @click="deletePermission(perm.id)" class="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination Footer -->
      <div class="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <div>Showing all {{ filteredPermissions.length }} permissions</div>
      </div>
    </div>

    <!-- Drawer (Slide-over) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity" @click.self="closeModal">
      <!-- Drawer Panel -->
      <div class="bg-white w-full max-w-md h-full shadow-2xl flex flex-col bg-opacity-100 transform transition-transform">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 class="font-semibold text-xl text-gray-800">{{ editing ? "Edit Permission" : "New Permission" }}</h2>
            <p class="text-sm text-gray-500 mt-1">Manage system access rights.</p>
          </div>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Body (Scrollable) -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Permission Name <span class="text-red-500">*</span></label>
            <input v-model="form.name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm" placeholder="e.g. edit articles" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Guard Name</label>
            <input v-model="form.guard_name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm" placeholder="web" />
            <p class="text-xs text-gray-500 mt-1">Defaults to 'web' if left blank.</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <button @click="savePermission" :disabled="saving" class="w-full py-2.5 bg-[#dc2626] rounded-lg text-sm font-medium text-white hover:bg-[#b91c1c] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <component :is="saving ? Loader2 : 'span'" :class="{'animate-spin': saving}" class="w-4 h-4" v-if="saving" />
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
           <button @click="closeModal" class="w-full py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors text-center">Cancel</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Loader2,
  Lock
} from 'lucide-vue-next';

// State
const permissions = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const editing = ref(false);
const searchQuery = ref("");
const form = ref({
  id: null,
  name: "",
  guard_name: "web"
});

// Computed
const filteredPermissions = computed(() => {
  if (!searchQuery.value) return permissions.value;
  const q = searchQuery.value.toLowerCase();
  return permissions.value.filter(p => 
    p.name.toLowerCase().includes(q) || 
    (p.guard_name || '').toLowerCase().includes(q)
  );
});

const guardsCount = computed(() => {
  const guards = new Set(permissions.value.map(p => p.guard_name || 'web'));
  return guards.size;
});

const recentCount = computed(() => {
  const now = new Date();
  const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
  return permissions.value.filter(p => new Date(p.created_at) > oneMonthAgo).length;
});

// Axios
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Actions
async function fetchData() {
  loading.value = true;
  try {
    const res = await api.get("/permissions");
    permissions.value = Array.isArray(res.data) ? res.data : (res.data.data || []);
  } catch (err) {
    console.error("Error loading permissions:", err);
    if (err.response?.status === 401) window.location.href = '/login';
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  form.value = { id: null, name: "", guard_name: "web" };
  editing.value = false;
  showModal.value = true;
}

function editPermission(perm) {
  form.value = {
    id: perm.id,
    name: perm.name,
    guard_name: perm.guard_name || "web"
  };
  editing.value = true;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  form.value = { id: null, name: "", guard_name: "web" };
}

async function savePermission() {
  if (!form.value.name) return alert("Permission name is required");
  
  saving.value = true;
  try {
    const payload = {
      name: form.value.name,
      guard_name: form.value.guard_name
    };

    if (editing.value) {
      await api.put(`/permissions/${form.value.id}`, payload);
    } else {
      await api.post("/permissions", payload);
    }
    
    closeModal();
    await fetchData();
    
  } catch (err) {
    console.error("Save failed:", err);
    alert("Failed to save permission: " + (err.response?.data?.message || err.message));
  } finally {
    saving.value = false;
  }
}

async function deletePermission(id) {
  if (!confirm("Are you sure? This action cannot be undone.")) return;
  try {
    await api.delete(`/permissions/${id}`);
    await fetchData();
  } catch (err) {
    alert("Failed to delete permission");
  }
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* Tailwind */
</style>
