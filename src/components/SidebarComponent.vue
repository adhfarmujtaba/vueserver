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
      </ul>
    </nav>
  </aside>
</template>

<script>
export default {
  name: 'SidebarComponent',
  props: {
    isMenuOpen: Boolean,
  },
  methods: {
    closeMenu() {
      this.$emit('toggleMenu');
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
  background-color: #ffffff; /* Light background */
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  transform: translateX(-100%); /* Start hidden */
  z-index: 9;
}

.sidebar.active {
  transform: translateX(0); /* Slide in when active */
  border-right: 5px solid #007bff; /* Subtle border for active state */
}

.logo-wrapper {
  overflow: hidden; /* Ensure the logo doesn't show when hidden */
  transition: transform 0.9s ease;
  transform: translateX(100%); /* Start hidden to the right */
}

.logo-wrapper.active {
  transform: translateX(0); /* Slide in when active */
}

.nav {
  padding: 10px 20px; /* Increased padding */
}

.logo {
  display: flex; /* Flex for logo alignment */
  align-items: center; /* Center vertically */
  margin-bottom: 30px; /* Space below logo */
}

.logo img {
  width: 40px; /* Adjust logo size */
  height: auto; /* Maintain aspect ratio */
  margin-right: 10px; /* Space between logo and text */
}

.logo span {
  font-size: 24px;
  font-weight: 600;
  color: #343a40; /* Darker title color */
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
  color: #495057; /* Darker link color */
  font-weight: 500; /* Slightly lighter */
  transition: background-color 0.3s, color 0.3s, padding 0.3s;
  padding: 12px 20px; /* Increased padding */
  border-radius: 5px; /* Subtle rounding */
  display: flex; /* Flex for icon and text alignment */
  align-items: center; /* Center items vertically */
}

.nav a i {
  margin-right: 10px; /* Space between icon and text */
  transition: transform 0.3s; /* Animation on hover */
}

.nav a:hover {
  background-color: #e9ecef; /* Soft hover effect */
  color: #007bff; /* Consistent hover color */
}

.nav a:hover i {
  transform: translateX(5px); /* Slight move on hover */
}

.nav a.active {
  background-color: #007bff; /* Blue background for active link */
  color: white; /* White text for active link */
}
</style>
