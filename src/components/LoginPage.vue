<template>
  <div class="login-background">
    <div class="login-container">
      <router-link to="/" class="back-button">
        <i class="fas fa-arrow-left"></i>
      </router-link>
      <h1>Login</h1>
      <form @submit.prevent="login">
        <div class="form-group">
          <input
            type="text"
            v-model="username"
            required
            placeholder="Username"
            class="input-field"
          />
        </div>

        <div class="form-group">
          <input
            type="password"
            v-model="password"
            required
            placeholder="Password"
            class="input-field"
          />
        </div>

        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

        <button type="submit" :disabled="loading" class="login-button">
          <span v-if="loading" class="loader"></span>
          {{ loading ? "Logging in..." : "Log In" }}
        </button>

        <div class="remember-me">
          <input type="checkbox" id="remember" v-model="rememberMe" />
          <label for="remember">Remember Me</label>
        </div>
      </form>
      <p class="signup-link">
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useToast } from 'vue-toastification';

export default {
  data() {
    return {
      username: "",
      password: "",
      errorMessage: null,
      loading: false,
      rememberMe: false,
    };
  },
  mounted() {
    const user = localStorage.getItem("user");
    if (user) {
      this.$router.push("/profile");
    }
  },
  methods: {
    async login() {
      this.loading = true;
      this.errorMessage = null;
      const toast = useToast();

      try {
        const response = await axios.post("https://blog.tourismofkashmir.com/apilogin.php", {
          username: this.username,
          password: this.password,
        });

        if (response.data.message === "Login successful.") {
          const user = response.data.user;
          if (this.rememberMe) {
            localStorage.setItem("user", JSON.stringify(user));
          } else {
            sessionStorage.setItem("user", JSON.stringify(user));
          }
          toast.success(`Welcome ${user.name || user.username}!`);
          this.$router.push("/profile");
        } else {
          this.errorMessage = response.data.message;
        }
      } catch (error) {
        console.error("Error logging in:", error);
        this.errorMessage = "An error occurred while logging in. Please try again.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-background {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(45deg, #e3f2fd, #ffffff);
}

.login-container {
  width: 90%;
  max-width: 400px;
  padding: 40px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  position: relative;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  color: #42a5f5;
  text-decoration: none;
  font-size: 20px;
}

.back-button:hover {
  color: #1e88e5;
}

h1 {
  font-size: 30px;
  margin-bottom: 30px;
  font-family: 'Roboto', sans-serif;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  padding: 15px;
  border: 2px solid #cfd8dc;
  border-radius: 10px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: #42a5f5;
  outline: none;
}

.login-button {
  width: 100%;
  padding: 15px;
  background: linear-gradient(45deg, #ff4081, #ff3d00);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
  position: relative;
}

.login-button:hover {
  background: #ff4081;
}

.login-button:disabled {
  background-color: #bdbdbd;
}

.loader {
  width: 24px;
  height: 24px;
  border: 4px solid white;
  border-top: 4px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: absolute;
  left: calc(50% - 12px);
  top: calc(50% - 12px);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.remember-me {
  display: flex;
  align-items: center;
  margin: 15px 0;
}

.error {
  color: red;
  margin-top: 10px;
}

.signup-link {
  margin-top: 15px;
  font-size: 14px;
  color: #42a5f5;
}

.signup-link a {
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>
