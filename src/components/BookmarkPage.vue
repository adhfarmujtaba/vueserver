<template>
  <div class="bookmarks-container">
    <h1>Your Bookmarks</h1>
    <div v-if="loading" class="loading-message">Loading bookmarks...</div>
    <div v-else>
      <div class="grid">
        <div v-for="bookmark in bookmarks" :key="bookmark.id" class="bookmark-card">
          <div class="image-container">
            <router-link :to="`/${bookmark.category_slug}/${bookmark.slug}`" class="bookmark-link">
              <img :src="bookmark.full_image_url" alt="Post Image" class="bookmark-image" />
            </router-link>
            <i @click="removeBookmark(bookmark.id)" class="fas fa-trash remove-icon"></i>
          </div>
          <div class="bookmark-details">
            <h3>
              <router-link :to="`/${bookmark.category_slug}/${bookmark.slug}`" class="bookmark-link">
                {{ truncateTitle(bookmark.title, 30) }} <!-- Limit to 30 characters -->
              </router-link>
            </h3>
          </div>
        </div>
      </div>
      <div v-if="bookmarks.length === 0" class="no-bookmarks">No bookmarks found.</div>
    </div>
  </div>
</template>



<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const bookmarks = ref([]);
    const loading = ref(true);

    const loggedInUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const userId = loggedInUser ? JSON.parse(loggedInUser).id : null;

    const fetchBookmarks = async () => {
      if (!userId) {
        console.error('No user ID found');
        loading.value = false;
        return;
      }

      try {
        const response = await axios.get('https://blog.tourismofkashmir.com/bookmark_view_api.php', {
          params: { user_id: userId },
        });
        bookmarks.value = response.data; // Ensure the response includes the required fields
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      } finally {
        loading.value = false;
      }
    };

    const removeBookmark = async (bookmarkId) => {
      if (!userId) return;

      try {
        await axios.delete('https://blog.tourismofkashmir.com/bookmark_view_api.php', {
          params: { user_id: userId, action: 'delete', post_id: bookmarkId },
        });
        bookmarks.value = bookmarks.value.filter(b => b.id !== bookmarkId);
      } catch (error) {
        console.error('Error removing bookmark:', error);
      }
    };

    const truncateTitle = (title, maxLength) => {
      if (title.length > maxLength) {
        return title.substring(0, maxLength) + '...';
      }
      return title;
    };

    onMounted(fetchBookmarks);

    return {
      bookmarks,
      loading,
      removeBookmark,
      truncateTitle,
    };
  },
};
</script>


<style scoped>
.bookmarks-container {
  padding: 20px;
  max-width: 800px;
  margin: auto;
  font-family: 'Arial', sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.loading-message {
  text-align: center;
  font-size: 18px;
  color: #999;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.bookmark-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s;
}

.bookmark-card:hover {
  transform: translateY(-5px);
}

.image-container {
  position: relative; /* Enables absolute positioning for child elements */
}

.bookmark-image {
  width: 100%;
  height: auto;
}

.remove-icon {
  color: black;
  font-size: 18px;
  cursor: pointer;
  position: absolute;
  right: 10px; /* Adjust for positioning */
  top: 10px;  /* Adjust for positioning */
  transition: color 0.2s;
}

.remove-icon:hover {
  color: #c0392b;
}

.bookmark-details {
  padding: 10px;
}

.bookmark-details h3 {
  margin: 10px 0;
  font-size: 18px;
  color: #333;
}

.bookmark-link {
  text-decoration: none;
  color: #2e86de;
  transition: color 0.2s;
}

.bookmark-link:hover {
  color: #1e60b0;
}

.no-bookmarks {
  text-align: center;
  color: #999;
  font-size: 18px;
  margin-top: 20px;
}
</style>
