<template>
  <div>
    <header class="header">
      <div class="menu-icon" @click="toggleMenu">
        <span :class="{ 'active': isMenuOpen }"></span>
        <span :class="{ 'active': isMenuOpen }"></span>
        <span :class="{ 'active': isMenuOpen }"></span>
      </div>
      <router-link 
        to="/" 
        class="logo" 
        :class="{ visible: !isMenuOpen, hidden: isMenuOpen }"
      >
        <img src="@/assets/logo.png" alt="Leak News" />
        <span>Leak News</span>
      </router-link>
      <div class="icons">
        <div class="icon notification-icon" @click="handleNotificationClick">
  <i class="fas fa-bell"></i>
  <span v-if="unreadCount > 0" class="unread-count">{{ unreadCount }}</span>
</div>

        <div class="icon" @click="openSearchModal">
          <i class="fas fa-search"></i>
        </div>
        <div class="icon" @click="handleUserClick">
          <i class="fas fa-user"></i>
        </div>
      </div>
    </header>

    <!-- Category Tags Section -->
    <div class="category-tags">
      <template v-if="!loadingCategories">
        <router-link 
          to="/" 
          class="category-tag" 
          :class="{ active: isActive('/') }"
        >
          All
        </router-link>
      </template>
      
      <template v-if="loadingCategories">
        <div class="category-tags-loading">
          <div class="loading-tag" style="width: 50px; height: 35px;"></div>
          <div class="loading-tag" style="width: 120px; height: 35px;"></div>
          <div class="loading-tag" style="width: 90px; height: 35px;"></div>
          <div class="loading-tag" style="width: 110px; height: 35px;"></div>
          <div class="loading-tag" style="width: 120px; height: 35px;"></div>
          <div class="loading-tag" style="width: 100px; height: 35px;"></div>
        </div>
      </template>
      
      <template v-else>
        <router-link 
          v-for="category in categories" 
          :key="category.id" 
          :to="`/${category.slug}`" 
          class="category-tag" 
          :class="{ active: isActive(`/${category.slug}`) }"
        >
          {{ category.name }}
        </router-link>
      </template>
    </div>

    <!-- Search Modal -->
    <transition name="fade">
      <div class="search-modal" v-if="isSearching">
        <div class="modal-content">
          <span class="close" @click="closeSearchModal">&times;</span>
          <input 
            type="text" 
            v-model="query" 
            @input="fetchResults" 
            placeholder="Search..."
          />
          
          <div class="search-results" v-if="results.length > 0">
            <ul>
              <li v-for="result in results" :key="result.id">
                <span 
                  class="search-result-link" 
                  @click="navigateToResult(result)"
                >
                  <img :src="result.image" alt="Result Image" class="result-image" />
                  <span>{{ result.title }}</span>
                </span>
              </li>
            </ul>
          </div>
          
          <!-- Spinner while loading -->
          <div v-if="loadingResults" class="spinner">
            <i class="fas fa-spinner fa-spin"></i> <!-- Using FontAwesome spinner -->
          </div>
        </div>
      </div>
    </transition>




  

    <!-- Commented out overlay -->
    <!-- <div class="overlay" :class="{ 'active': isMenuOpen }" @click="toggleMenu"></div> -->
  </div>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';

export default {
  name: 'HeaderComponent',
  props: {
    isMenuOpen: Boolean,
  },
 data() {
  return {
    categories: [],
    loadingCategories: true,
    isSearching: false,
    query: '',
    results: [],
    loadingResults: false,
    page: 1, // Track the current page
    hasMoreResults: true, // To check if more results are available
    unreadCount: 0,
    unreadCountInterval: null,
  };
},

  computed: {
    ...mapState(['currentRoute']),
  },
  methods: {
    toggleMenu() {
      this.$emit('toggleMenu');
    },
     handleNotificationClick() {
      this.$router.push('/notification'); // Navigate to the notification route
      this.unreadCount = 0;
    },
    handleUserClick() {},
    openSearchModal() {
      this.isSearching = true;
    },
    closeSearchModal() {
      this.isSearching = false;
      this.query = '';
      this.results = [];
    },
      async fetchUnreadCount() {
      const user = JSON.parse(localStorage.getItem("user")); // Get user from localStorage
      if (user && user.id) {
        const userId = user.id; // Use the user ID from the stored user object
        try {
          const response = await axios.get(`https://blog.tourismofkashmir.com/api_unreadcountnotification.php?user_id=${userId}`);
          this.unreadCount = response.data.unread_count; // Update unread count
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      }
    },
    
    async fetchResults() {
  if (this.query.length > 0 && this.hasMoreResults) {
    this.loadingResults = true; // Set loading to true
    try {
      const response = await axios.get(`https://blog.tourismofkashmir.com/apisearch?search=${this.query}&page=${this.page}`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        this.results.push(...response.data); // Append new results
        this.page++; // Increment the page number for next fetch
      } else {
        this.hasMoreResults = false; // No more results
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      this.results = [];
    } finally {
      this.loadingResults = false; // Set loading to false
    }
  } else {
    this.results = [];
    this.loadingResults = false; // Ensure loading is false if no query
  }
},

  
    async fetchCategories() {
      this.loadingCategories = true;
      try {
        const response = await axios.get('https://blog.tourismofkashmir.com/apis?categories&order_index=asc&header_menu_is_included=TRUE');
        this.categories = response.data;
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        this.loadingCategories = false;
      }
    },
    isActive(route) {
      return this.$route.path === route;
    },
    navigateToResult(result) {
      this.closeSearchModal(); // Close the modal
      this.$router.push(`/${result.categorySlug}/${result.postSlug}`); // Navigate to the result
    },
  },
  mounted() {
    this.fetchCategories();
    this.fetchUnreadCount(); // Fetch unread count when the component mounts
    
    // Set up an interval to refresh the unread count every 5 seconds
    this.unreadCountInterval = setInterval(this.fetchUnreadCount, 5000);
  },
  beforeUnmount() {
  // Clear the interval when the component is unmounted
  clearInterval(this.unreadCountInterval);
},

};
</script>




<style scoped>
.header {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 10px 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;

}

.menu-icon {
  cursor: pointer;
  position: relative;
  width: 30px;
  margin-right: 15px;
  margin-left: 4px;
  height: 20px;
}

.menu-icon span {
  position: absolute;
  width: 100%;
  height: 4px;
  background-color: #333;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.menu-icon span:nth-child(1) {
  top: 0;
}

.menu-icon span:nth-child(2) {
  top: 50%;
  transform: translateY(-50%);
}

.menu-icon span:nth-child(3) {
  bottom: 0;
}

.menu-icon span.active:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.menu-icon span.active:nth-child(2) {
  opacity: 0;
}

.menu-icon span.active:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}


.logo {
  display: flex; /* Flex for logo alignment */
  align-items: center; /* Center vertically */
  text-decoration : none;
}

.icons {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.icon {
  font-size: 20px;
  margin-left: 20px;
  cursor: pointer;
  transition: color 0.3s;
}

.icon:hover {
  color: #007bff;
}



.category-tags {
  display: flex;
  overflow-x: auto; /* Enable horizontal scrolling */
  padding: 10px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd; /* Add a subtle bottom border */
  white-space: nowrap; /* Prevent wrapping */
}

.category-tag {
  margin: 5px;
  padding: 8px 16px; /* Increased padding for better touch targets */
  border-radius: 20px; /* More rounded corners */
  background-color: #e2e6ea;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s, transform 0.2s; /* Added transform for effect */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

.category-tag:hover {
  background-color: #0056b3; /* Darker shade for hover */
  color: #fff;
  transform: scale(1.05); /* Slightly scale up on hover */
}

.category-tag.active {
  background-color: #007bff; /* Active tag background */
  color: #fff; /* Active tag text color */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Enhanced shadow for active tag */
}

/* Optional: Hide scrollbar for a cleaner look */
.category-tags::-webkit-scrollbar {
  display: none; /* Hide scrollbar for a cleaner appearance */
}
.category-tags-loading {
  display: flex;
  padding: 5px;
}

.loading-tag {
  background-color: #e2e6ea;
  border-radius: 20px; /* Rounded corners */
  margin: 0 5px; /* Space between tags */
  animation: pulse 1.5s infinite; /* Pulse animation */
}

@keyframes pulse {
  0% {
    background-color: #e2e6ea;
  }
  50% {
    background-color: #d0d0d0; /* Slightly darker shade */
  }
  100% {
    background-color: #e2e6ea;
  }
}
.logo {
  position: relative; /* Ensure it can be moved */
  
}

.hidden {
  transform: translateX(-100%); /* Slide to the left */
  opacity: 0; /* Fade out */
}

.visible {
  transition: transform 1.2s , opacity 1s ease; /* Set to 1 second */
  
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
.search-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8); /* Darker overlay for emphasis */
  display: flex;
  justify-content: center;
  align-items: center;
  color : #fff;
  z-index: 1000;
}

.modal-content {
  padding: 24px; /* More padding for a spacious feel */
  border-radius: 20px; /* Soft rounded corners */
  width: 90%; /* Responsive width */
  max-width: 450px; /* Max width for larger screens */
  box-shadow: 0 10px 30px rgb(255 255 255 / 50%); /* Softer, deeper shadow */
  overflow: hidden; /* Ensures no overflow */
  color : white;
  height :400px;
}

.close {
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;
  font-size: 49px; /* Larger close button */
  color: #fff; /* Subtle color for the close icon */
  transition: color 0.3s; /* Smooth color transition */
}

.close:hover {
  color: #333; /* Darker on hover */
}

input {
  width: 100%;
  padding: 12px; /* Adequate padding */
  margin-top: 20px;
  background : transparent;
  color : white;
   box-shadow: 0 10px 30px rgb(255 255 255 / 90%); 
  border: none; /* Light border */
  border-radius: 10px; /* More rounded */
  font-size: 16px; /* Clear font size */
  border-bottom : 2px solid red;
  box-sizing: border-box; /* Include padding and border in element's total width and height */
}
input::placeholder {
  color: #999; /* Change this to your desired color */
  opacity: 0.9; /* You can set this to 0.5 or any value between 0 and 1 for transparency */
}

input:focus {
  border: none; /* Remove border on focus */
  border-bottom : 1px solid  rgba(0, 123, 255, 0.5);
  outline: none; /* Remove default outline */
}

.search-results {
  margin-top: 15px; /* Space above results */
  max-height: 300px; /* Set a max height for scrolling */
  overflow-y: auto; /* Enable vertical scrolling */
  padding-right: 10px; /* Space for scrollbar */
    color : white;

}

.search-results ul {
  list-style: none;
  padding: 0;
  margin: 0; /* No margin */
}

.search-results li {
  display: flex;
  align-items: center; /* Vertical alignment */
  padding: 12px 0; /* Adequate padding */
  border-bottom: 1px solid #eee; /* Light separator */
  transition: background-color 0.2s; /* Smooth background transition */
}
.search-result-link {
  display: flex;
  align-items: center; /* Align image and text */
  text-decoration: none; /* Remove underline */
  color: inherit; /* Inherit color from parent */
  padding: 12px 0; /* Adequate padding */
}

.search-results li:hover {
 border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1); /* Subtle hover effect */
  border: 1px solid rgba(255, 255, 255, 0.9); /* Light border on hover */
}

.result-image {
  width: 60px; /* Fixed size for images */
  height: 60px; /* Maintain square aspect */
  border-radius: 10px; /* Rounded corners */
  margin-right: 12px; /* Space between image and text */
}

.result-title {
  font-size: 16px; /* Consistent title size */
  color: #333; /* Dark text for contrast */
  line-height: 1.5; /* Improved line height */
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
.spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px; /* Space above spinner */
  color: white; /* Spinner color */
  font-size: 24px; /* Size of the spinner */
}
/* Custom scrollbar styles for WebKit browsers */
.search-results::-webkit-scrollbar {
  width: 8px; /* Width of the scrollbar */
}

.search-results::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1); /* Background of the scrollbar track */
  border-radius: 10px; /* Rounded corners */
}

.search-results::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.5); /* Color of the scrollbar thumb */
  border-radius: 10px; /* Rounded corners */
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.7); /* Color on hover */
}

/* Custom scrollbar styles for Firefox */
.search-results {
  scrollbar-width: thin; /* Use 'thin' for a thin scrollbar */
  scrollbar-color: rgba(255, 255, 255, 0.5) rgba(255, 255, 255, 0.1); /* Thumb and track colors */
}

.notification-icon {
  position: relative;
}

.unread-count {
  position: absolute;
  top: -5px;
  right: -10px;
  background-color: red;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

</style>
