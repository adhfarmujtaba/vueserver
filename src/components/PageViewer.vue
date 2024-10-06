<template>
  <div class="container">
    <div class="spinner-container" v-if="isLoading">
      <div class="spinner"></div>
    </div>

    <div class="content" v-else-if="page">
      <h1>{{ page.name }}</h1>
      <div v-html="page.content"></div>
    </div>
    
    <div v-else>
      <p>Page not found.</p>
    </div>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  data() {
    return {
      page: null,
      isLoading: true, // Track loading state
    };
  },
  created() {
    this.fetchPageData();
  },
  methods: {
    async fetchPageData() {
      const slug = this.$route.params.slug;
      try {
        const response = await axios.get('https://blog.tourismofkashmir.com/get_pages.php'); // Update to your API URL
        const pages = response.data;
        this.page = pages.find(p => p.slug === slug) || null; // Find the page by slug
      } catch (error) {
        console.error("Error fetching page data:", error);
      } finally {
        this.isLoading = false; // Set loading to false after fetching data
      }
    },
  },
};
</script>

<style scoped>


.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
   height: 100vh;
}

.spinner {
  border: 2px solid rgba(0, 0, 0, 0.1); /* Thinner border */
  border-top: 2px solid #007BFF; /* Vibrant blue for the top border */
  border-radius: 50%;
  width: 30px; /* Slightly smaller size */
  height: 30px; /* Slightly smaller size */
  animation: spin 1s linear infinite;
}



@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content {
  max-width: 800px; /* Limit the width of the content */
  margin: 20px; /* Add some margin */
  padding: 20px; /* Add padding for better spacing */
  background-color: #ffffff; /* White background for content */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  height: 100%; /* Use full height */
  overflow-y: auto; /* Allow vertical scrolling */
}

h1 {
  font-size: 2em; /* Larger font size for the main heading */
  margin-bottom: 20px; /* Space below the heading */
  color: #333; /* Darker color for the heading */
}

p {
  line-height: 1.6; /* Better line spacing for readability */
  color: #555; /* Slightly lighter color for paragraph text */
}

h2 {
  margin-top: 30px; /* Space above subheadings */
  margin-bottom: 10px; /* Space below subheadings */
  color: #333; /* Consistent color for subheadings */
}
</style>