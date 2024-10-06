<template>
  <aside class="sidebar" :class="{ active: isMenuOpen }">
    <nav class="nav">
      <div class="logo-wrapper" :class="{ active: isMenuOpen }">
        <div class="logo" v-if="isMenuOpen">
          <img src="@/assets/logo.png" alt="Leak News" />
          <span>Leak News</span>
        </div>
      </div>
      <ul>
        <li>
          <router-link to="/" @click="closeMenu">
            <i class="fas fa-home"></i> Home
          </router-link>
        </li>
        <li>
          <router-link to="/world" @click="closeMenu">
            <i class="fas fa-globe"></i> World
          </router-link>
        </li>
        <li>
          <router-link to="/politics" @click="closeMenu">
            <i class="fas fa-user-shield"></i> Politics
          </router-link>
        </li>
        <li>
          <router-link to="/business" @click="closeMenu">
            <i class="fas fa-briefcase"></i> Business
          </router-link>
        </li>
        <li>
          <router-link to="/technology" @click="closeMenu">
            <i class="fas fa-laptop-code"></i> Technology
          </router-link>
        </li>
        <li @click="toggleCategories" class="dropdown">
          <span>
            <i class="fas fa-th-list"></i> Categories
            <i :class="['fas', isCategoriesOpen ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
          </span>
          <ul v-if="isCategoriesOpen" class="dropdown-menu">
  <li v-for="category in categories" :key="category.side_menu_index_id">
    <router-link :to="`/${category.slug}`" @click="closeMenu">
      {{ category.name }} <!-- Use category.name instead of order_index -->
    </router-link>
  </li>
</ul>

        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SidebarComponent',
  props: {
    isMenuOpen: Boolean,
  },
  data() {
    return {
      categories: [],
      isCategoriesOpen: false,
    };
  },
  methods: {
    closeMenu() {
      this.$emit('toggleMenu');
    },
    toggleCategories() {
      this.isCategoriesOpen = !this.isCategoriesOpen;
      if (this.categories.length === 0) {
        this.fetchCategories();
      }
    },
    async fetchCategories() {
      try {
        const response = await axios.get('https://blog.tourismofkashmir.com/api_get_categories.php');
        this.categories = response.data; // Assuming the response has the categories directly
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    },
  },
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  background-color: #ffffff;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  transform: translateX(-100%);
  z-index: 9;
}

.sidebar.active {
  transform: translateX(0);
  border-right: 5px solid #007bff;
}

.logo-wrapper {
  overflow: hidden;
  transition: transform 0.9s ease;
  transform: translateX(100%);
}

.logo-wrapper.active {
  transform: translateX(0);
}

.nav {
  padding: 10px 20px;
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.logo img {
  width: 40px;
  height: auto;
  margin-right: 10px;
}

.logo span {
  font-size: 24px;
  font-weight: 600;
  color: #343a40;
}

.nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav li {
  margin: 15px 0;
}

.nav a {
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  transition: background-color 0.3s, color 0.3s, padding 0.3s;
  padding: 12px 20px;
  border-radius: 5px;
  display: flex;
  align-items: center;
}

.nav a i {
  margin-right: 10px;
  transition: transform 0.3s;
}

.nav a:hover {
  background-color: #e9ecef;
  color: #007bff;
}

.nav a:hover i {
  transform: translateX(5px);
}

.nav a.active {
  background-color: #007bff;
  color: white;
}

.dropdown {
  cursor: pointer;
}

.dropdown-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: 10px;
  background-color: #f8f9fa;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.dropdown-menu li {
  margin: 5px 0;
}

.dropdown-menu a {
  padding: 10px 20px;
}

.dropdown-menu a:hover {
  background-color: #e9ecef;
}

@media (prefers-color-scheme: dark) {
  .sidebar {
    background-color: #1e1e1e; /* Dark background */
    box-shadow: 2px 0 15px rgba(0, 0, 0, 0.5);
  }

  .sidebar.active {
    border-right: 5px solid #bb86fc; /* Dark mode active color */
  }

  .logo span {
    color: #ffffff; /* Light text for logo */
  }

  .nav a {
    color: #e0e0e0; /* Light text color for links */
  }

  .nav a:hover {
    background-color: #333; /* Darker hover background */
    color: #bb86fc; /* Light color on hover */
  }

  .nav a.active {
    background-color: #bb86fc; /* Active link color */
    color: #ffffff; /* Light text for active link */
  }

  .dropdown-menu {
    background-color: #2c2c2c; /* Dark background for dropdown */
  }

  .dropdown-menu a {
    color: #e0e0e0; /* Light text for dropdown links */
  }

  .dropdown-menu a:hover {
    background-color: #333; /* Darker hover background for dropdown links */
  }
}

</style>
