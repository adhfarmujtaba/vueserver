<template>
  <div class="category-list" @scroll="handleScroll">
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

    <div v-if="isEmptyinitial" class="empty-category-message">
      <p>There are no more posts in this category.</p>
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
      <div v-if="isLoadingMore" class="loading-more" style="text-align: center; margin-top: 20px;">
        <img src="https://blog.tourismofkashmir.com/kOnzy.gif" alt="Loading..." class="infinite-scroll-loader" />
      </div>
      <div v-if="isEmpty" class="empty-category-message">
  <p> no more posts.</p>
</div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import debounce from 'lodash/debounce';

export default {
  name: 'CategoryList',
  setup() {
    const categoryPosts = ref([]);
    const isEmptyinitial = ref(false);
    const isEmpty = ref(false);
    const isLoading = ref(true);
    const isLoadingMore = ref(false);
    const canLoadMore = ref(true); // New variable to track loading status
    const route = useRoute();
    const currentPage = ref(1);
    
    const fetchCategoryPosts = async (page = 1) => {
      isLoading.value = page === 1; 
      isLoadingMore.value = page > 1; 
      try {
        const categorySlug = route.params.categorySlug;
        const response = await axios.get(`https://blog.tourismofkashmir.com/apis?category_slug=${categorySlug}&page=${page}`);

        if (Array.isArray(response.data)) {
          if (response.data.length > 0) {
            if (page === 1) {
              categoryPosts.value = response.data;
            } else {
              categoryPosts.value.push(...response.data);
            }
            isEmptyinitial.value = false; 
          } else {
            // If the response is an empty array for any page
            if (page === 1) {
              isEmptyinitial.value = true; 
            } else {
              isEmpty.value = true; 
              canLoadMore.value = false; // No more posts to load
            }
          }
        }
      } catch (error) {
        console.error('Error fetching category posts:', error);
      } finally {
        isLoading.value = false; 
        isLoadingMore.value = false; 
      }
    };

    const handleScroll = debounce(() => {
      const scrollableHeight = document.documentElement.scrollHeight;
      const currentScroll = window.innerHeight + window.scrollY;

      if (currentScroll >= scrollableHeight - 100 && !isLoading.value && !isLoadingMore.value && canLoadMore.value) {
        currentPage.value++;
        fetchCategoryPosts(currentPage.value);
      }
    }, 200);

    watch(() => route.params.categorySlug, () => {
      currentPage.value = 1; 
      canLoadMore.value = true; // Reset loading status on category change
      fetchCategoryPosts(); 
    });

    onMounted(() => {
      fetchCategoryPosts();
      window.addEventListener('scroll', handleScroll);
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
      isEmptyinitial,
      isEmpty,
      isLoading,
      isLoadingMore,
      formatViews,
      formatDate,
    };
  },
};
</script>


<style>
.loading-more {
  text-align: center;
  padding: 10px;
  font-size: 1.2rem;
}
.empty-category-message {
  text-align: center;
  padding: 10px;
  font-size: 1.2rem;
  color: #666;
}

.infinite-scroll-loader {
  width: 40px;
  height: 40px;
}
</style>
