           <div class="flex items-center justify-center size-8 rounded-lg bg-red-100 text-red-600 shrink-0">
              <Building class="size-5" />
           </div>
           <div class="flex flex-col truncate">
             <span class="text-sm font-semibold text-gray-900 truncate">Century Sheba Homes</span>
             <span class="text-xs text-gray-500 truncate">Partner company</span>
           </div>
        </div>
        <ChevronsUpDown class="size-4 text-gray-400" />
      </div>
    </div>

    <!-- 3. Navigation Links -->
    <div class="flex-1 overflow-y-auto px-4 space-y-6">
      
      <!-- Core Section - Only show if user has at least one core permission -->
      <div v-if="hasPermission('view_dashboard') || hasPermission('view_users')">
        <h3 class="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Core</h3>
        <nav class="space-y-1">
          <router-link 
            v-if="hasPermission('view_dashboard')"
            to="/dashboard" 
            class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            active-class="!bg-gray-100 !text-gray-900"
          >
            <LayoutDashboard class="size-5 text-gray-500" />
            Dashboard
          </router-link>

          <router-link 
            v-if="hasPermission('view_users')"
            to="/users" 
            class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            active-class="!bg-gray-100 !text-gray-900"
          >
             <div class="flex items-center gap-3">
               <Users class="size-5 text-gray-500" />
               Users
             </div>
             <ChevronRight class="size-4 text-gray-400" />
          </router-link>
        </nav>
      </div>

      <!-- Personnel Section (Mapped from Roles/Permissions) -->
      <div v-if="hasPermission('view_roles') || hasPermission('view_permissions')">
        <h3 class="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Personnel</h3>
        <nav class="space-y-1">
           <router-link 
            v-if="hasPermission('view_roles')"
            to="/roles" 
            class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            active-class="!bg-gray-100 !text-gray-900"
          >
             <div class="flex items-center gap-3">
               <Settings2 class="size-5 text-gray-500" />
               Roles
             </div>
             <ChevronRight class="size-4 text-gray-400" />
          </router-link>

          <router-link 
            v-if="hasPermission('view_permissions')"
            to="/permissions" 
            class="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            active-class="!bg-gray-100 !text-gray-900"
          >
             <div class="flex items-center gap-3">
               <ShieldCheck class="size-5 text-gray-500" />
               Permissions
             </div>
             <ChevronRight class="size-4 text-gray-400" />
          </router-link>
        </nav>
      </div>

    </div>

    <!-- 4. Bottom User Profile -->
    <div class="p-4 border-t border-gray-200">
      <div class="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
         <div class="flex items-center gap-3 overflow-hidden">
            <div class="flex items-center justify-center size-10 rounded-lg bg-gray-100 text-gray-600 font-bold shrink-0">
               {{ userInitials }}
            </div>
            <div class="flex flex-col truncate">
                <span class="text-sm font-semibold text-gray-900 truncate">{{ user?.name || 'User' }}</span>
                <span class="text-xs text-gray-500 truncate">{{ user?.email || 'user@example.com' }}</span>
            </div>
         </div>
         
         <div class="flex items-center gap-1">
           <button @click="refreshPermissions" class="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Refresh Permissions">
              <RefreshCw class="size-4" />
           </button>
           <button @click="logout" class="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Logout">
              <LogOut class="size-5" />
           </button>
         </div>
      </div>
    </div>

  </aside>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  Settings2, 
  ShieldCheck, 
  LogOut,
  ChevronsUpDown,
  Building,
  ChevronRight,
  RefreshCw
} from 'lucide-vue-next'
import { api } from '@/api/api'
import { hasPermission as checkPermission, getCurrentUser, refreshUserPermissions } from '@/utils/permissions'

const router = useRouter()

// Reactive user data
const user = ref(getCurrentUser())

// Refresh user permissions periodically (every 30 seconds) to get real-time updates
let refreshInterval = null

onMounted(async () => {
  // Initial refresh
  await refreshUserData()
  
  // Set up periodic refresh for real-time permission updates
  refreshInterval = setInterval(async () => {
    await refreshUserData()
  }, 30000) // Refresh every 30 seconds
  
  // Listen for storage events (when user data is updated in another tab)
  window.addEventListener('storage', handleStorageChange)
  
  // Listen for custom permission update events
  window.addEventListener('permissions-updated', refreshUserData)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('permissions-updated', refreshUserData)
})

async function refreshUserData() {
  const updatedUser = await refreshUserPermissions(api)
  if (updatedUser) {
    user.value = updatedUser
  }
}

function handleStorageChange(e) {
  if (e.key === 'user') {
    user.value = e.newValue ? JSON.parse(e.newValue) : null
  }
}

// Check if user has permission (reactive)
function hasPermission(permissionName) {
  if (!user.value || !user.value.role || !user.value.role.permissions) {
    return false
  }
  return user.value.role.permissions.some(p => p.name === permissionName)
}

// Get user initials
const userInitials = computed(() => {
  if (!user.value || !user.value.name) return 'U'
  return user.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

async function refreshPermissions() {
  await refreshUserData()
  alert('Permissions refreshed!')
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>
