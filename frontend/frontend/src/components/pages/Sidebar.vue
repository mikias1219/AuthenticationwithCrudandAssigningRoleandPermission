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
      
      <!-- Core Section -->
      <div>
        <h3 class="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Core</h3>
        <nav class="space-y-1">
          <router-link 
            to="/dashboard" 
            class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            active-class="!bg-gray-100 !text-gray-900"
          >
            <LayoutDashboard class="size-5 text-gray-500" />
            Dashboard
          </router-link>

          <!-- Mapping 'Properties' from image to 'Users' based on existing links to avoid empty links, 
               OR just keeping 'Users' as it was. Let's keep 'Users'. -->
          <router-link 
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
      <div>
        <h3 class="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Personnel</h3>
        <nav class="space-y-1">
           <router-link 
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
               CA
            </div>
            <div class="flex flex-col truncate">
                <span class="text-sm font-semibold text-gray-900 truncate">Century Admin</span>
                <span class="text-xs text-gray-500 truncate">admin@century.com</span>
            </div>
         </div>
         
         <button @click="logout" class="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Logout">
            <LogOut class="size-5" />
         </button>
      </div>
    </div>

  </aside>
</template>

<script setup>
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
  ChevronRight
} from 'lucide-vue-next'

const router = useRouter()

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>
