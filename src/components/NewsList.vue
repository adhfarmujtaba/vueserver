<template>
  <div>
    <div v-if="loading" class="skeleton-container">
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
    <div class="news-list" v-else>
      <div
        v-for="post in posts"
        :key="post.id"
        class="card"
        @contextmenu.prevent
      >
        <div class="news-item-link" @click="navigateToPost(post)">
          <div class="image-container" style="position: relative">
            <img
              :src="post.image"
              :alt="post.title"
              class="news-item-image"
              style="width: 100%; height: 180px; object-fit: cover"
            />
            <div
              style="position: absolute; bottom: 10px; right: 10px; background-color: rgba(0, 0, 0, 0.5); color: white; padding: 5px; border-radius: 5px; font-size: 0.8rem"
            >
              {{ post.read_time }} min read
            </div>
          </div>
          <div class="card-content">
            <h2>{{ truncateText(post.title, 10) }}</h2>
            <p>{{ truncateText(post.meta_description, 20) }}</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px">
          <router-link :to="`/profile/${post.username}`" style="text-decoration: none; color: inherit; display: flex; align-items: center">
            <img
              :src="`https://blog.tourismofkashmir.com/${post.avatar}`"
              alt="Avatar"
              class="avatar"
              style="width: 30px; height: 30px; border-radius: 50%; margin-right: 5px"
            />
            <span class="username">{{ post.username }}</span>
          </router-link>
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
import { useRouter } from 'vue-router';

export default {
  setup() {
    const posts = ref([]);
    const hasMore = ref(true);
    const page = ref(1);
    const loading = ref(true); // Loading flag
    const router = useRouter();

    const fetchPosts = async () => {
      loading.value = true; // Set loading to true when fetching
      try {
        const response = await axios.get(`https://blog.tourismofkashmir.com/apis?posts&page=${page.value}`);
        const newData = response.data;
        if (!Array.isArray(newData) || newData.length === 0) {
          hasMore.value = false;
        } else {
          posts.value.push(...newData);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        loading.value = false; // Set loading to false after fetching
      }
    };

    const navigateToPost = (post) => {
      router.push(`/${post.category_slug}/${post.slug}`);
    };

    const truncateText = (text, maxWords) => {
      const wordsArray = text.split(' ');
      return wordsArray.length > maxWords ? wordsArray.slice(0, maxWords).join(' ') + '...' : text;
    };

    const formatViews = (views) => {
      if (views >= 10000000) return Math.floor(views / 10000000) + 'cr';
      if (views >= 1000000) return Math.floor(views / 1000000) + 'M';
      if (views >= 100000) return Math.floor(views / 100000) + 'L';
      if (views >= 1000) return Math.floor(views / 1000) + 'k';
      return views.toString();
    };

    const formatDate = (date) => {
      const currentDate = new Date();
      const postDate = new Date(date);
      const timeDifference = currentDate - postDate;
      const seconds = Math.floor(timeDifference / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) return seconds + ' sec ago';
      else if (minutes < 60) return minutes + ' mins ago';
      else if (hours < 24) return hours + ' hours ago';
      else if (days < 7) return days + ' days ago';
      else if (days < 30) return Math.floor(days / 7) + ' weeks ago';
      else if (days < 365) return Math.floor(days / 30) + ' months ago';
      return Math.floor(days / 365) + ' years ago';
    };

    onMounted(() => {
      fetchPosts();
    });

    watch(page, fetchPosts);

    return { posts, hasMore, loading, truncateText, formatViews, formatDate, navigateToPost };
  }
};
</script>

<style>
.skeleton-meta{
 display: 'flex';
 alignItems: 'center';
}
</style>
