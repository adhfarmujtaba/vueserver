<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          type="text"
          v-model="username"
          id="username"
          required
          placeholder="Enter your username"
        />
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input
          type="password"
          v-model="password"
          id="password"
          required
          placeholder="Enter your password"
        />
      </div>

      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

      <button type="submit" :disabled="loading">{{ loading ? "Logging in..." : "Login" }}</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { useToast } from 'vue-toastification'; // Import toast hook

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
    // Check if the user is already logged in
    const user = localStorage.getItem("user");
    if (user) {
      // If user is logged in, redirect to /profile
      this.$router.push("/profile");
    }
  },
  methods: {
    async login() {
      this.loading = true;
      this.errorMessage = null;
      const toast = useToast(); // Initialize toast

      try {
        const response = await axios.post("https://blog.tourismofkashmir.com/apilogin.php", {
          username: this.username,
          password: this.password,
        });

        if (response.data.message === "Login successful.") {
          // Store the user data in localStorage
          const user = response.data.user;
          localStorage.setItem("user", JSON.stringify(user));

          // Show welcome toast
          toast.success(`Welcome ${user.name || user.username}!`);

          // Redirect to profile page after login
          this.$router.push("/profile");
        } else {
          // Handle login errors
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
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:disabled {
  background-color: #999;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
