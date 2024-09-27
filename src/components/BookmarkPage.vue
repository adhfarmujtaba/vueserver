<template>
  <div>
    <h1>Your Bookmarks</h1>
    <div v-if="loading">Loading bookmarks...</div>
    <div v-else>
      <ul>
        <li v-for="bookmark in bookmarks" :key="bookmark.id" class="bookmark-item">
          <img :src="bookmark.full_image_url" alt="Post Image" class="bookmark-image" />
          <div class="bookmark-details">
            <h3>{{ bookmark.title }}</h3>
            <button @click="removeBookmark(bookmark.id)">Remove</button>
          </div>
        </li>
      </ul>
      <div v-if="bookmarks.length === 0">No bookmarks found.</div>
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
    const userId = 1; // Replace this with the actual user ID

    const fetchBookmarks = async () => {
      try {
        const response = await axios.get('https://blog.tourismofkashmir.com/bookmark_view_api.php', {
          params: { user_id: userId },
        });
        bookmarks.value = response.data; // Ensure the response includes an imageUrl field
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      } finally {
        loading.value = false;
      }
    };

    const removeBookmark = async (bookmarkId) => {
      try {
        await axios.delete('https://blog.tourismofkashmir.com/bookmark_view_api.php', {
          params: { user_id: userId, action: 'delete', post_id: bookmarkId },
        });
        bookmarks.value = bookmarks.value.filter(b => b.id !== bookmarkId);
      } catch (error) {
        console.error('Error removing bookmark:', error);
      }
    };

    onMounted(fetchBookmarks);

    return {
      bookmarks,
      loading,
      removeBookmark,
    };
  },
};
</script>

<style scoped>
.bookmark-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.bookmark-image {
  width: 100px; /* Adjust size as needed */
  height: auto;
  margin-right: 20px; /* Space between image and title */
}

.bookmark-details {
  flex-grow: 1; /* Allow details to take available space */
}

.bookmark-details h3 {
  margin: 0;
}
</style>
