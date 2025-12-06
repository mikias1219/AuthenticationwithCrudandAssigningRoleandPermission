<template>
  <div class="account-container">
    <h1 class="page-title">My Account</h1>

    <div v-if="loading" class="loading">Loading account information...</div>
    
    <div v-else class="account-card">
      <!-- Profile Information -->
      <div class="section">
        <h2>Profile Information</h2>
        
        <div class="form-group">
          <label>Name *</label>
          <input 
            v-model="form.name" 
            placeholder="Enter your name"
            :class="{ 'error': errors.name }"
          />
          <small v-if="errors.name" class="error-text">{{ errors.name[0] }}</small>
        </div>
        
        <div class="form-group">
          <label>Email Address *</label>
          <input 
            v-model="form.email" 
            type="email"
            placeholder="Enter your email"
            :class="{ 'error': errors.email }"
          />
          <small v-if="errors.email" class="error-text">{{ errors.email[0] }}</small>
        </div>
        
        <div class="form-info">
          <p><strong>Role:</strong> {{ userRole }}</p>
          <p><strong>Member since:</strong> {{ memberSince }}</p>
        </div>
      </div>

      <!-- Change Password -->
      <div class="section">
        <h2>Change Password</h2>
        <p class="section-description">
          Leave password fields empty if you don't want to change your password.
        </p>
        
        <div class="form-group">
          <label>Current Password *</label>
          <input 
            v-model="form.current_password" 
            type="password"
            placeholder="Enter current password"
            :class="{ 'error': errors.current_password }"
          />
          <small v-if="errors.current_password" class="error-text">{{ errors.current_password[0] }}</small>
        </div>
        
        <div class="form-group">
          <label>New Password</label>
          <input 
            v-model="form.password" 
            type="password"
            placeholder="Enter new password"
            :class="{ 'error': errors.password }"
          />
          <small v-if="errors.password" class="error-text">{{ errors.password[0] }}</small>
        </div>
        
        <div class="form-group">
          <label>Confirm New Password</label>
          <input 
            v-model="form.password_confirmation" 
            type="password"
            placeholder="Confirm new password"
            :class="{ 'error': errors.password_confirmation }"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button class="save-btn" @click="saveAccount" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
        
        <button class="logout-btn" @click="logout">
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const loading = ref(true);
const saving = ref(false);
const userData = ref({});
const errors = ref({});

const form = ref({
  name: "",
  email: "",
  current_password: "",
  password: "",
  password_confirmation: ""
});

// Axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const userRole = computed(() => userData.value.role?.name || 'No role assigned');
const memberSince = computed(() => {
  if (!userData.value.created_at) return '';
  return new Date(userData.value.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
});

async function fetchAccountData() {
  loading.value = true;
  errors.value = {};
  
  try {
    const response = await axiosInstance.get("/account");
    userData.value = response.data;
    form.value.name = userData.value.name || "";
    form.value.email = userData.value.email || "";
  } catch (error) {
    if (error.response?.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      router.push("/login");
    } else {
      alert("Failed to load account information.");
    }
  } finally {
    loading.value = false;
  }
}

async function saveAccount() {
  saving.value = true;
  errors.value = {};
  
  try {
    const dataToSend = {};
    if (form.value.name !== userData.value.name) dataToSend.name = form.value.name;
    if (form.value.email !== userData.value.email) dataToSend.email = form.value.email;
    if (form.value.password) {
      dataToSend.password = form.value.password;
      dataToSend.password_confirmation = form.value.password_confirmation;
      dataToSend.current_password = form.value.current_password;
    }
    if (Object.keys(dataToSend).length === 0) {
      alert("No changes to save.");
      saving.value = false;
      return;
    }
    const response = await axiosInstance.put("/account", dataToSend);
    if (response.data.user) userData.value = response.data.user;
    form.value.current_password = form.value.password = form.value.password_confirmation = "";
    alert(response.data.message || "Account updated successfully!");
    await fetchAccountData();
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors || {};
      alert("Please fix the validation errors below.");
    } else if (error.response?.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      router.push("/login");
    } else {
      alert("Failed to update account.");
    }
  } finally {
    saving.value = false;
  }
}

async function logout() {
  if (!confirm("Are you sure you want to logout?")) return;
  try { await axiosInstance.post("/logout"); } catch {}
  localStorage.removeItem("token");
  router.push("/login");
}

onMounted(fetchAccountData);
</script>

<style scoped>
/* Container */
.account-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 25px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 25px;
  color: #b71c1c; /* Red theme */
  text-align: center;
}

/* Loading */
.loading {
  text-align: center;
  padding: 30px;
  background: #ffebee;
  color: #b71c1c;
  border-radius: 8px;
  font-size: 1.1rem;
}

/* Card */
.account-card {
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
}

/* Section */
.section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}
.section:last-of-type { border-bottom: none; margin-bottom: 20px; }
.section h2 { font-size: 1.2rem; color: #b71c1c; margin-bottom: 15px; font-weight: 600; }
.section-description { font-size: 0.9rem; color: #666; margin-bottom: 15px; }

/* Form */
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #555; }
.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}
.form-group input:focus { border-color: #b71c1c; outline: none; }
.form-group input.error { border-color: #f56565; }
.error-text { color: #f56565; font-size: 0.8rem; margin-top: 4px; display: block; }

/* Info Box */
.form-info { background: #fff0f0; padding: 15px; border-radius: 6px; margin-top: 15px; }
.form-info p { margin: 6px 0; color: #555; }
.form-info strong { color: #b71c1c; }

/* Actions */
.actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}
.save-btn, .logout-btn {
  flex: 1;
  padding: 12px;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.save-btn { background: #b71c1c; color: white; }
.save-btn:hover:not(:disabled) { background: #d32f2f; transform: translateY(-1px); }
.save-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; }
.logout-btn { background: #f56565; color: white; }
.logout-btn:hover { background: #c53030; transform: translateY(-1px); }

/* Responsive */
@media (max-width: 640px) {
  .account-container { padding: 15px; }
  .account-card { padding: 20px; }
  .actions { flex-direction: column; }
}
</style>
