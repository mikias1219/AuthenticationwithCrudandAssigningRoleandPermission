<template>
  <div class="login-page">

    <!-- LEFT PANEL WITH BACKGROUND IMAGE -->
   <div class="left-panel" :style="{ backgroundImage: `url(${bgImage})` }">
  <div class="overlay"></div>

  <div class="left-content">
    <!-- Optional content -->
  </div>
</div>

    <!-- RIGHT PANEL — LOGIN FORM -->
    <div class="right-panel">
      <div class="login-card">
        <h2 class="title">Welcome Back!</h2>
        <p class="subtitle">Please enter your credentials to access your account.</p>

        <form @submit.prevent="login" class="form">

          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              v-model="form.email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input
              type="password"
              v-model="form.password"
              placeholder="Enter your password"
              required
            />
          </div>

          <button class="btn" type="submit" :disabled="loading">
            <span v-if="loading">Logging in...</span>
            <span v-else>Login</span>
          </button>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

          <p class="footer">
            Design and developed by
            <a href="https://www.melfantech.com/" target="_blank">MelfanTech</a>
          </p>
        </form>
      </div>
    </div>

  </div>
</template>

<script>
import axios from "axios";
import bgImage from "@/assets/img.jpg";

export default {
  name: "Login",

  data() {
    return {
      bgImage,
      form: {
        email: "",
        password: "",
      },
      loading: false,
      errorMessage: "",
    };
  },

  mounted() {
    const token = localStorage.getItem("token");
    if (token) {
      this.$router.push("/");
    }
  },

  methods: {
    async login() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await axios.post("http://localhost:8000/api/login", {
          email: this.form.email,
          password: this.form.password,
        });

        // Store token and user data
        localStorage.setItem("token", response.data.token);
        if (response.data.user) {
          // Ensure user data includes role and permissions
          const userData = response.data.user;
          if (userData.role && userData.role.permissions) {
            localStorage.setItem("user", JSON.stringify(userData));
          } else {
            // If permissions not loaded, store as is (backend should include them)
            localStorage.setItem("user", JSON.stringify(userData));
          }
        }

        setTimeout(() => {
          this.$router.replace("/");
        }, 100);

      } catch (error) {
        if (error.response && error.response.data) {
          this.errorMessage = error.response.data.message || "Login failed.";
        } else {
          this.errorMessage = "Network error. Please check your connection.";
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Whole page layout */
.login-page {
  display: grid;
  grid-template-columns: 1fr;
  height: 100vh;
}

@media (min-width: 1024px) {
  .login-page {
    grid-template-columns: 1fr 1fr;
  }
}

/* LEFT PANEL IMAGE */
.left-panel {
  display: none;
  position: relative;
}

@media (min-width: 1024px) {
  .left-panel {
    display: block;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
}

.overlay {
  background: rgba(0, 0, 0, 0.2); /* only 20% black */
}


/* Left text */
.left-content {
  position: absolute;
  top: 30%;
  left: 10%;
  z-index: 2;
  color: #fff;
}

.logo-title {
  font-size: 38px;
  font-weight: 700;
}

.logo-sub {
  font-size: 16px;
  opacity: 0.8;
}

/* RIGHT PANEL */
.right-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  max-width: 380px;
}

.title {
  font-size: 26px;
  margin-bottom: 5px;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
}

/* FORM */
.form {
  display: grid;
  gap: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  font-size: 14px;
}

.btn {
  width: 100%;
  height: 40px;
  background: #6F4E37;
  color: white;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  border: none;
}

.btn:hover {
  background: #5c3f2d;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: red;
  text-align: center;
  margin-top: 5px;
}

.footer {
  text-align: center;
  font-size: 13px;
  color: #777;
  margin-top: 10px;
}

.footer a {
  color: #6F4E37;
  font-weight: 600;
  text-decoration: underline;
}
</style>
