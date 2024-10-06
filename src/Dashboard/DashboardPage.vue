<template>
  <div class="dashboard">
    <nav class="navbar">
      <h2 class="navbar-title">My Dashboard</h2>
      <button class="logout-button" @click="logout">
        <FontAwesomeIcon icon="sign-out-alt" />
        Logout
      </button>
    </nav>

    <div class="dashboard-content">
      <aside class="side-menu">
        <router-link to="/dashboard/home" class="side-menu-link">
          <FontAwesomeIcon icon="home" />
          Home
        </router-link>
        <router-link to="/dashboard/post-list" class="side-menu-link">
          <FontAwesomeIcon icon="file-alt" />
          Your Posts
        </router-link>
        <router-link to="/settings" class="side-menu-link">
          <FontAwesomeIcon icon="cog" />
          Settings
        </router-link>
        <router-link to="/profile" class="side-menu-link">
          <FontAwesomeIcon icon="user" />
          Profile
        </router-link>
        <router-link to="/dashboard/create-post" class="side-menu-link">
          <FontAwesomeIcon icon="plus" />
          Create New Post
        </router-link>
      </aside>

      <div class="main-content">
        <h1 class="dashboard-title">Dashboard</h1>
        <p v-if="userData" class="welcome-message">Welcome, {{ userData.name }}!</p>
        <p v-else class="welcome-message">Welcome to your dashboard!</p>

        <div class="stats-container">
          <div class="stat-card">
            <h3>Total Posts</h3>
            <p>{{ userStats.total_posts }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Followers</h3>
            <p>{{ userStats.total_followers }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Likes</h3>
            <p>{{ userStats.total_likes }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Post Views</h3>
            <p>{{ userStats.total_post_views }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import axios from 'axios';

export default {
  name: 'DashboardPage',
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      userData: null,
      userStats: {
        total_posts: 0,
        total_followers: 0,
        total_likes: 0,
        total_post_views: 0,
      },
    };
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.userData = user;
      this.fetchUserStats();
    }
  },
  methods: {
    async fetchUserStats() {
      try {
        const response = await axios.get('https://blog.tourismofkashmir.com/dashboard_api.php', {
          params: { userId: this.userData.id },
        });
        
        this.userStats = {
          total_posts: response.data.total_posts || 0,
          total_followers: response.data.total_followers || 0,
          total_likes: response.data.total_likes || 0,
          total_post_views: response.data.total_post_views || 0,
        };
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    },
    logout() {
      localStorage.removeItem('user');
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
.dashboard {
  display: flex;
  font-family: 'Roboto', sans-serif;
  background-color: #eaeef2;
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #6200ea;
  color: white;
  padding: 10px 15px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logout-button {
  background-color: transparent;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding-right: 40px;
}

.dashboard-content {
  display: flex;
  margin-top: 70px; /* Space for the fixed navbar */
  width: 100%;
}

.side-menu {
  background-color: #fff;
  width: 250px;
  padding: 20px;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  border-right: 1px solid #ddd;
}

.side-menu-link {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 10px;
  color: #6200ea;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s, color 0.3s;
}

.side-menu-link svg {
  margin-right: 10px;
}

.side-menu-link:hover {
  background-color: #f1f1f1;
  color: #bb86fc;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dashboard-title {
  margin: 20px 0;
  font-size: 2rem;
  color: #333;
}

.welcome-message {
  font-size: 1.2rem;
  color: #666;
  margin: 10px 0;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.stat-card {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.stat-card h3 {
  color: #6200ea;
  margin-bottom: 10px;
}

@media (max-width: 600px) {
  .side-menu {
    width: 100%;
    position: relative;
    box-shadow: none;
  }

  .dashboard-content {
    flex-direction: column;
  }
}
</style>
