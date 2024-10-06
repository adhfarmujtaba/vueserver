<template>
  <div class="login-background">
    <div class="login-container">
      <button class="back-button" @click="goHome">🏠</button>
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
          {{ loading ? "Logging in..." : "Log In" }}
        </button>
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
    };
  },
  mounted() {
    const user = localStorage.getItem("user");
    if (user) {
      this.$router.push("/profile");
    }
  },
  methods: {
    goHome() {
      this.$router.push("/"); // Navigate to home
    },
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
          localStorage.setItem("user", JSON.stringify(user));
          toast.success(`Welcome ${user.name || user.username}!`);
          this.$router.push("/dashboard");
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
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 24px;
  background-color: white;
  border-radius: 32px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
  text-align: center;
  animation: fadeIn 2.2s ease; /* Fade-in animation for the container */
}

.back-button {
  background: none;
  border: none;
  font-size: 24px; /* Adjusted size for the home icon */
  color: #1976d2; /* Color for the back button */
  cursor: pointer;
  margin-bottom: 16px; /* Space below the back button */
  align-self: flex-start; /* Align to the left */
}

h1 {
  font-size: 30px;
  margin-bottom: 24px;
  font-family: 'Roboto', sans-serif;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.input-field {
  width: 100%;
  padding: 14px;
  border: 1px solid #b0bec5;
  border-radius: 30px;
  box-sizing: border-box;
  margin: 8px 0;
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.2s;
  font-size: 16px;
}

.input-field:focus {
  border-color: #1976d2;
  outline: none;
  box-shadow: 0 0 8px rgba(25, 118, 210, 0.5);
  transform: scale(1.02); /* Slightly enlarge on focus */
}

.login-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(45deg, #ff4081, #f50057);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.login-button:hover {
  background: linear-gradient(45deg, #f50057, #ff4081);
  transform: translateY(-2px);
}

.login-button:disabled {
  background-color: #cccccc;
}

.error {
  color: #d32f2f;
  margin-top: 10px;
  font-size: 14px;
}

.signup-link {
  margin-top: 20px;
  font-size: 14px;
  color: #1976d2;
}

.signup-link a {
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}

/* Keyframes for fade-in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
