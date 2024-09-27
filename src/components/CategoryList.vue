<template>
  <div class="category-list">
    <div v-if="isLoading" class="skeleton-container">
      <div v-for="index in 10" :key="index" class="card skeleton-card">
        <div class="skeleton-image"></div>
        <div class="card-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-content"></div>
          <div style="display: flex; align-items: center;">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-username"></div>
            <div class="skeleton-date"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="isEmpty" class="empty-category-message">
      <p>There are no posts in this category.</p>
    </div>

    <div v-else>
      <div v-for="post in categoryPosts" :key="post.id" class="card" @contextmenu.prevent>
        <RouterLink :to="`/${post.category_slug}/${post.slug}`" class="news-item-link">
          <div class="image-container" style="position: relative;">
            <img :src="post.image" :alt="post.title" class="news-item-image" style="width: 100%; height: 180px; object-fit: cover;" />
            <div style="position: absolute; bottom: 10px; right: 10px; background-color: rgba(0, 0, 0, 0.5); color: white; padding: 5px; border-radius: 5px; font-size: 0.8rem;">
              {{ post.read_time }} min read
            </div>
          </div>
          <div class="card-content">
            <h2>{{ post.title }}</h2>
            <p>{{ post.meta_description }}</p>
          </div>
        </RouterLink>
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <RouterLink :to="`/profile/${post.username}`" style="text-decoration: none; color: inherit; display: flex; align-items: center;">
            <img :src="`https://blog.tourismofkashmir.com/${post.avatar}`" alt="Avatar" class="avatar" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 5px;" />
            <span class="username">{{ post.username }}</span>
          </RouterLink>
          <span class="views">. {{ formatViews(post.views) }} views</span>
          <span class="date">{{ formatDate(post.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

export default {
  name: 'CategoryList',
  setup() {
    const categoryPosts = ref([]);
    const isEmpty = ref(false);
    const isLoading = ref(true); // New loading state
    const route = useRoute();

    const fetchCategoryPosts = async () => {
      isLoading.value = true; // Start loading
      try {
        const categorySlug = route.params.categorySlug;
        console.log("Current category slug:", categorySlug); // Log current slug

        const response = await axios.get(`https://blog.tourismofkashmir.com/apis?category_slug=${categorySlug}`);
        console.log("Fetched posts:", response.data); // Log the response

        if (Array.isArray(response.data) && response.data.length > 0) {
          categoryPosts.value = response.data;
          isEmpty.value = false;
        } else {
          isEmpty.value = true;
        }
      } catch (error) {
        console.error('Error fetching category posts:', error);
        isEmpty.value = true;
      } finally {
        isLoading.value = false; // Stop loading
      }
    };

    watch(() => route.params.categorySlug, () => {
      categoryPosts.value = [];
      isEmpty.value = false;
      fetchCategoryPosts();
    });

    onMounted(() => {
      fetchCategoryPosts();
    });

    // Utility functions
    const formatViews = (views) => {
      if (views >= 10000000) {
        return Math.floor(views / 10000000) + ' cr';
      } else if (views >= 1000000) {
        return Math.floor(views / 1000000) + ' M';
      } else if (views >= 100000) {
        return Math.floor(views / 100000) + ' L';
      } else if (views >= 1000) {
        return Math.floor(views / 1000) + ' k';
      } else {
        return views;
      }
    };

    const formatDate = (date) => {
      const currentDate = new Date();
      const postDate = new Date(date);

      const timeDifference = currentDate - postDate;
      const seconds = Math.floor(timeDifference / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) {
        return seconds + ' sec ago';
      } else if (minutes < 60) {
        return minutes + ' mins ago';
      } else if (hours < 24) {
        return hours + ' hours ago';
      } else if (days < 7) {
        return days + ' days ago';
      } else if (days < 30) {
        const weeks = Math.floor(days / 7);
        return weeks + ' weeks ago';
      } else if (days < 365) {
        return Math.floor(days / 30) + ' months ago';
      } else {
        return Math.floor(days / 365) + ' years ago';
      }
    };

    return {
      categoryPosts,
      isEmpty,
      isLoading, // Expose loading state
      formatViews,
      formatDate,
    };
  },
};
</script>
