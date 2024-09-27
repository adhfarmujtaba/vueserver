<template>
  <div class="login-background">
    <div class="login-container">
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
  background: linear-gradient(45deg, #f5f5f5, #ffffff);
}

.login-container {
  width: 90%;
  max-width: 400px;
  padding: 30px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15);
  text-align: center;
}

h1 {
  font-size: 36px;
  margin-bottom: 25px;
  font-family: 'Arial', sans-serif;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #dbdbdb;
  border-radius: 8px;
  box-sizing : border-box;
  margin: 10px 0;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input-field:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.login-button {
  width: 100%;
  padding: 15px;
  background: linear-gradient(45deg, #fd1d1d, #833ab4);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.login-button:hover {
  background: linear-gradient(45deg, #fd1d1d, #fd1d1d);
  transform: translateY(-2px);
}

.login-button:disabled {
  background-color: #999;
}

.error {
  color: red;
  margin-top: 10px;
}

.signup-link {
  margin-top: 15px;
  font-size: 14px;
  color: #007bff;
}

.signup-link a {
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>
