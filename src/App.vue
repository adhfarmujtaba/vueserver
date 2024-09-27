<template>
  <div id="app">
    <SidebarComponent :isMenuOpen="isMenuOpen" @toggleMenu="toggleMenu" />
    <div class="content-wrapper" :class="{ 'shifted': isMenuOpen }">
      <Header v-if="!isNotificationPage" :isMenuOpen="isMenuOpen" @toggleMenu="toggleMenu" />
      <main>
        <transition name="slide-down-up" mode="out-in" appear>
          <router-view :key="$route.fullPath" />
        </transition>
        <div v-if="isPulling" class="pull-text">
          <i class="fas fa-arrow-down pull-icon"></i> Pull and release to refresh
        </div>
      </main>
    </div>
    <div class="overlay" v-if="isMenuOpen" @click="toggleMenu"></div>
  </div>
</template>

<script>
import Header from './components/Header.vue';
import SidebarComponent from './components/SidebarComponent.vue';

export default {
  name: 'App',
  components: {
    Header,
    SidebarComponent,
  },
  data() {
    return {
      isMenuOpen: false,
      isPulling: false,
      isNotificationPage: false, // New property
    };
  },
  watch: {
    $route(to) {
      // Set isNotificationPage based on route name or path
      this.isNotificationPage = to.name === 'notifications'; // Adjust this condition as needed
    },
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
  },
};
</script>

<style>
/* Pull text styles */
.pull-text {
  position: absolute;
  top: -50px; /* Adjust position as needed */
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #666; /* Optional: change text color */
}

.content-wrapper {
  transition: transform 0.3s ease; /* Use transform for smoother shifts */
}

.content-wrapper.shifted {
  transform: translateX(250px); /* Match this to sidebar width */
  margin-left: 10px; 
}

/* Prevents overflow during animation */
#app {
  overflow: hidden; 
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.0);
  z-index: 8; /* Below sidebar, above content */
  transition: opacity 0.3s ease;
}

.slide-down-up-enter-active,
.slide-down-up-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.slide-down-up-enter {
  opacity: 0;
  transform: translateY(20px);
}

.slide-down-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
