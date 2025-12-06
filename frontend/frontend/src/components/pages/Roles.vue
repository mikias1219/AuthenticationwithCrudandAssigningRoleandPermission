<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Roles</h1>
      <p class="text-gray-500 mt-1">Manage system roles and their permissions.</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
        <div class="text-3xl font-bold text-gray-800">{{ roles.length }}</div>
        <div class="text-gray-500">Total Roles</div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
        <div class="text-3xl font-bold text-gray-800">{{ allPermissions.length }}</div>
        <div class="text-gray-500">System Permissions</div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
        <div class="text-3xl font-bold text-gray-800">{{ usersWithRolesCount }}</div>
        <div class="text-gray-500">Users with Roles</div>
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
              placeholder="Search roles" 
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
        <div v-if="loading" class="p-8 text-center text-gray-500">Loading roles...</div>
        <div v-else-if="filteredRoles.length === 0" class="p-8 text-center text-gray-500 bg-gray-50">No roles found.</div>
        <table v-else class="w-full text-sm text-left">
          <thead class="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
            <tr>
              <th class="p-4 w-4">
                <input type="checkbox" class="rounded border-gray-300 text-red-600 focus:ring-red-500">
              </th>
              <th class="p-4">Role Name</th>
              <th class="p-4">Assigned Users</th>
              <th class="p-4">Permissions</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="role in filteredRoles" :key="role.id" class="hover:bg-gray-50 transition-colors group">
              <td class="p-4">
                <input type="checkbox" class="rounded border-gray-300 text-red-600 focus:ring-red-500">
              </td>
              <td class="p-4 font-medium text-gray-900">{{ role.name }}</td>
              <td class="p-4 text-gray-500">
                <div class="flex items-center gap-2">
                  <Users class="w-4 h-4" />
                  {{ role.users ? role.users.length : 0 }} Users
                </div>
              </td>
              <td class="p-4 text-gray-500">
                <div class="flex items-center gap-2">
                  <ShieldCheck class="w-4 h-4" />
                  {{ role.permissions ? role.permissions.length : 0 }} Permissions
                </div>
              </td>
              <td class="p-4 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button @click="editRole(role)" class="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Edit Permissions">
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button @click="deleteRole(role.id)" class="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination Footer (Simple Placeholder) -->
      <div class="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <div>Showing all {{ filteredRoles.length }} roles</div>
      </div>
    </div>

    <!-- Drawer (Slide-over) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity" @click.self="closeModal">
      <!-- Drawer Panel -->
      <div class="bg-white w-full max-w-md h-full shadow-2xl flex flex-col bg-opacity-100 transform transition-transform">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
             <h2 class="font-semibold text-xl text-gray-800">{{ editing ? "Edit Role" : "New Role" }}</h2>
             <p class="text-sm text-gray-500 mt-1">Manage role name and permissions.</p>
          </div>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Body (Scrollable) -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Name Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Role Name <span class="text-red-500">*</span></label>
              <input v-model="form.name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm" placeholder="e.g. Manager" />
            </div>

            <!-- Permissions Checklist -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                 <div v-if="allPermissions.length === 0" class="text-sm text-gray-500 text-center py-4">No permissions found in system.</div>
                 <div v-else class="space-y-3">
                    <label v-for="perm in allPermissions" :key="perm.id" class="flex items-start gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors -mx-2">
                       <input type="checkbox" :value="perm.id" v-model="form.permissions" class="mt-1 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 flex-shrink-0" />
                       <span class="text-sm text-gray-700 leading-tight">{{ perm.name }}</span>
                    </label>
                 </div>
              </div>
              <p class="text-xs text-gray-500 mt-2">Select the permissions this role includes.</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <button @click="saveRole" :disabled="saving" class="w-full py-2.5 bg-[#dc2626] rounded-lg text-sm font-medium text-white hover:bg-[#b91c1c] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <component :is="saving ? Loader2 : 'span'" :class="{'animate-spin': saving}" class="w-4 h-4" v-if="saving" />
            {{ saving ? 'Saving...' : 'Save Role' }}
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
  Users,
  ShieldCheck
} from 'lucide-vue-next';

// State
const roles = ref([]);
const allPermissions = ref([]);
const usersWithRolesCount = ref(0);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const editing = ref(false);
const searchQuery = ref("");
const form = ref({
  id: null,
  name: "",
  permissions: []
});

// Computed
const filteredRoles = computed(() => {
  if (!searchQuery.value) return roles.value;
  const q = searchQuery.value.toLowerCase();
  return roles.value.filter(r => r.name.toLowerCase().includes(q));
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
    const [rolesRes, permsRes, usersRes] = await Promise.all([
      api.get("/roles"),
      api.get("/permissions"),
      api.get("/users") // Fetching users to calculate "Users with Roles" stat
    ]);
    
    // Normalize roles data
    const rawRoles = Array.isArray(rolesRes.data) ? rolesRes.data : (rolesRes.data.data || []);
    roles.value = rawRoles;
    
    allPermissions.value = permsRes.data || [];
    
    // Calculate stats
    const users = usersRes.data || [];
    usersWithRolesCount.value = users.filter(u => u.roles && u.roles.length > 0).length;

  } catch (err) {
    console.error("Error loading data:", err);
    if (err.response?.status === 401) window.location.href = '/login';
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  form.value = { id: null, name: "", permissions: [] };
  editing.value = false;
  showModal.value = true;
}

function editRole(role) {
  form.value = {
    id: role.id,
    name: role.name,
    // Extract permission IDs for v-model
    permissions: role.permissions ? role.permissions.map(p => p.id || p) : [] 
  };
  editing.value = true;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  form.value = { id: null, name: "", permissions: [] };
}

async function saveRole() {
  if (!form.value.name) return alert("Role name is required");
  
  saving.value = true;
  try {
    if (editing.value) {
      // Update logic: This might need adjustment based on your strict API
      // Usually PUT /roles/:id for name, and sync permissions separately or together
      // Assuming a backend that supports syncing permissions via an endpoint or included in update
      
      // 1. Update Name (Generic assumption)
      // await api.put(`/roles/${form.value.id}`, { name: form.value.name });
      
      // 2. Sync Permissions. 
      // The previous file used /role/permissions with POST/DELETE.
      // Ideally, we have a bulk sync endpoint. If not, we iterate.
      // Let's try a common pattern based on the previous file's logic which toggled one by one.
      // BUT, for a clean save, we should ideally use a "sync" endpoint.
      // If none exists, we might have to use the loop approach or a custom endpoint.
      
      // PROPOSAL: Try to send everything to a sync-like endpoint or use the loop if strictly needed.
      // Given the previous code used `api.post('/role/permissions', ...)` or `delete`:
      
      /* 
         Previous strategy was:
         - togglePermission checks state and sends POST or DELETE.
         
         New strategy for "Save":
         - compare form.permissions with original role permissions.
         - find additions and removals.
         - execute requests.
      */
     
      const originalRole = roles.value.find(r => r.id === form.value.id);
      const originalPermIds = originalRole.permissions ? originalRole.permissions.map(p => p.id || p) : [];
      
      const newPermIds = form.value.permissions; // IDs
      
      const toAdd = newPermIds.filter(id => !originalPermIds.includes(id));
      const toRemove = originalPermIds.filter(id => !newPermIds.includes(id));
      
      // Execute removals
      for (const pId of toRemove) {
         await api.delete('/role/permissions', { data: { role_id: form.value.id, permissions: [pId] } });
      }
      
      // Execute additions
      for (const pId of toAdd) {
         await api.post('/role/permissions', { role_id: form.value.id, permissions: [pId] });
      }
      
      // Update Name check
      if (originalRole.name !== form.value.name) {
          // Assuming there is a way to update name, usually PUT /roles/:id
          // If not, we skip.
           try { await api.put(`/roles/${form.value.id}`, { name: form.value.name }); } catch(e) { console.warn("Role update name failed or not supported", e); }
      }

    } else {
      // Create New
      const res = await api.post("/roles", { name: form.value.name });
      const newRoleId = res.data.id || res.data.role?.id; // Adjust based on response
      
      if (newRoleId && form.value.permissions.length > 0) {
         // Assign permissions to new role
         for (const pId of form.value.permissions) {
             await api.post('/role/permissions', { role_id: newRoleId, permissions: [pId] });
         }
      }
    }
    
    closeModal();
    await fetchData();
    
  } catch (err) {
    console.error("Save failed:", err);
    alert("Failed to save role: " + (err.response?.data?.message || err.message));
  } finally {
    saving.value = false;
  }
}

async function deleteRole(id) {
  if (!confirm("Are you sure? This action cannot be undone.")) return;
  try {
    await api.delete(`/roles/${id}`);
    await fetchData();
  } catch (err) {
    alert("Failed to delete role");
  }
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* Tailwind */
</style>
