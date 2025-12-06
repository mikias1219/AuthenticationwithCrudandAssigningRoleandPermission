<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Users</h1>
      <p class="text-gray-500 mt-1">Manage users and their roles here.</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
        <div class="text-3xl font-bold text-gray-800">{{ users.length }}</div>
        <div class="text-gray-500">Total Users</div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
        <div class="text-3xl font-bold text-gray-800">{{ adminCount }}</div>
        <div class="text-gray-500">Administrators</div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
        <div class="text-3xl font-bold text-gray-800">{{ userCount }}</div>
        <div class="text-gray-500">Regular Users</div>
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
              placeholder="Search user" 
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
            />
          </div>
          <button class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-2">
            Bulk Actions (0)
            <ChevronDown class="w-4 h-4" />
          </button>
        </div>
        <button 
          @click="openAddModal"
          class="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
        >
          <Plus class="w-4 h-4" />
          Create new
        </button>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <div v-if="loading" class="p-8 text-center text-gray-500">Loading users...</div>
        <div v-else-if="filteredUsers.length === 0" class="p-8 text-center text-gray-500 bg-gray-50">No users found.</div>
        <table v-else class="w-full text-sm text-left">
          <thead class="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
            <tr>
              <th class="p-4 w-4">
                <input type="checkbox" class="rounded border-gray-300 text-red-600 focus:ring-red-500">
              </th>
              <th class="p-4 cursor-pointer hover:bg-gray-100">Name</th>
              <th class="p-4 cursor-pointer hover:bg-gray-100">Email</th>
              <th class="p-4 cursor-pointer hover:bg-gray-100">Role</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 transition-colors group">
              <td class="p-4">
                <input type="checkbox" class="rounded border-gray-300 text-red-600 focus:ring-red-500">
              </td>
              <td class="p-4 font-medium text-gray-900">{{ user.name }}</td>
              <td class="p-4 text-gray-500">{{ user.email }}</td>
              <td class="p-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {{ user.role?.name || 'No Role' }}
                </span>
              </td>
              <td class="p-4 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button @click="editUser(user)" class="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button @click="deleteUser(user.id)" class="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
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
        <div>1 to {{ filteredUsers.length }} of {{ filteredUsers.length }} results.</div>
        <div class="flex items-center gap-2">
          <select class="border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-red-500">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
          <div class="flex items-center gap-1">
            <span class="px-2">Page 1 of 1</span>
            <div class="flex border border-gray-200 rounded overflow-hidden">
               <button class="p-1 hover:bg-gray-50 disabled:opacity-50" disabled><ChevronLeft class="w-4 h-4" /></button>
               <button class="p-1 hover:bg-gray-50 disabled:opacity-50" disabled><ChevronRight class="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Drawer (Slide-over) -->
    <div v-if="showAdd" class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity" @click.self="closeModal">
      <!-- Drawer Panel -->
      <div class="bg-white w-full max-w-md h-full shadow-2xl flex flex-col bg-opacity-100 transform transition-transform">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 class="font-semibold text-xl text-gray-800">{{ editing ? "Edit User" : "New User" }}</h2>
            <p class="text-sm text-gray-500 mt-1">Manage user details and role assignment here.</p>
          </div>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Body (Scrollable) -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name <span class="text-red-500">*</span></label>
            <input v-model="form.name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm" placeholder="Enter full name" />
            <small v-if="validationErrors.name" class="text-red-500 text-xs mt-1">{{ validationErrors.name }}</small>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
            <input v-model="form.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm" placeholder="Enter email address" />
             <small v-if="validationErrors.email" class="text-red-500 text-xs mt-1">{{ validationErrors.email }}</small>
          </div>

          <div>
             <label class="block text-sm font-medium text-gray-700 mb-1">Role <span class="text-red-500">*</span></label>
             <select v-model="form.role_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm bg-white">
                <option :value="null" disabled>Select a role</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
             </select>
             <small v-if="validationErrors.role_id" class="text-red-500 text-xs mt-1">{{ validationErrors.role_id }}</small>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password <span v-if="!editing" class="text-red-500">*</span></label>
            <input v-model="form.password" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm" :placeholder="editing ? 'Leave blank to keep current' : 'Create password'" />
             <small v-if="validationErrors.password" class="text-red-500 text-xs mt-1">{{ validationErrors.password }}</small>
             <p class="text-xs text-gray-400 mt-1" v-if="!editing">Must be at least 8 characters.</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <button @click="saveUser" :disabled="saving" class="w-full py-2.5 bg-[#dc2626] rounded-lg text-sm font-medium text-white hover:bg-[#b91c1c] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <component :is="saving ? Loader2 : 'span'" :class="{'animate-spin': saving}" class="w-4 h-4" v-if="saving" />
            {{ saving ? 'Saving...' : 'Save User' }}
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
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  X,
  Loader2
} from 'lucide-vue-next';

const users = ref([]);
const roles = ref([]);
const showAdd = ref(false);
const editing = ref(false);
const loading = ref(false);
const saving = ref(false);
const validationErrors = ref({});
const searchQuery = ref("");

const form = ref({
  name: "",
  email: "",
  password: "",
  role_id: null,
});

// Computed properties for stats
const adminCount = computed(() => {
  return users.value.filter(u => u.role?.name?.toLowerCase().includes('admin')).length;
});

const userCount = computed(() => {
  return users.value.filter(u => !u.role?.name?.toLowerCase().includes('admin')).length;
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const q = searchQuery.value.toLowerCase();
  return users.value.filter(u => 
    u.name.toLowerCase().includes(q) || 
    u.email.toLowerCase().includes(q) ||
    (u.role?.name || '').toLowerCase().includes(q)
  );
});

// Axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Fetch users and roles
async function fetchData() {
  loading.value = true;
  validationErrors.value = {};
  
  try {
    const rolesRes = await axiosInstance.get("/roles");
    // Handle both array and wrapped { data: [...] } responses
    const rawRoles = Array.isArray(rolesRes.data) ? rolesRes.data : (rolesRes.data.data || []);
    roles.value = rawRoles;
    
    const usersRes = await axiosInstance.get("/users");
    // Handle both array and wrapped { data: [...] } responses for users as well, for safety
    users.value = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data.data || []);
    
  } catch (err) {
    console.error("Error fetching data:", err);
    if (err.response?.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  } finally {
    loading.value = false;
  }
}

function openAddModal() {
  validationErrors.value = {};
  const userRole = roles.value.find(role => role.name === "User");
  
  form.value = {
    name: "",
    email: "",
    password: "",
    role_id: userRole ? userRole.id : (roles.value.length > 0 ? roles.value[0].id : null),
  };
  editing.value = false;
  showAdd.value = true;
}

function editUser(user) {
  validationErrors.value = {};
  
  form.value = {
    id: user.id,
    name: user.name,
    email: user.email,
    password: "",
    role_id: user.role_id || (user.role ? user.role.id : null)
  };
  
  editing.value = true;
  showAdd.value = true;
}

function closeModal() {
  showAdd.value = false;
  editing.value = false;
  form.value = {
    name: "",
    email: "",
    password: "",
    role_id: null,
  };
  validationErrors.value = {};
}

async function saveUser() {
  saving.value = true;
  validationErrors.value = {};
  
  try {
    const userData = {
      name: form.value.name,
      email: form.value.email,
      role_id: form.value.role_id
    };
    
    if (form.value.password && form.value.password.trim() !== '') {
      userData.password = form.value.password;
    }
    
    if (editing.value) {
      await axiosInstance.put(`/users/${form.value.id}`, userData);
    } else {
      await axiosInstance.post(`/users`, userData);
    }
    
    closeModal();
    await fetchData();
    
  } catch (err) {
    console.error("Save failed:", err);
    if (err.response?.status === 422 && err.response?.data?.errors) {
      validationErrors.value = err.response.data.errors;
    } else if (err.response?.status === 401) {
      alert("Session expired.");
    } else {
      alert("An error occurred: " + (err.response?.data?.message || err.message));
    }
  } finally {
    saving.value = false;
  }
}

async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;
  
  try {
    await axiosInstance.delete(`/users/${id}`);
    await fetchData();
  } catch (err) {
    console.error(err);
    alert("Failed to delete user");
  }
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* Tailwind CSS */
</style>