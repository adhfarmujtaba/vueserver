<template>
  <div class="main-container">
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

    <div v-else>
      <div class="news-list">
        <div
          v-for="post in posts"
          :key="post.id"
          class="card"
          @contextmenu.prevent
        >
          <router-link :to="`${post.category_slug}/${post.slug}/`" class="news-item-link">
            <div class="image-container" style="position: relative">
              <img
                :src="post.image"
                :alt="post.title"
                class="news-item-image"
                style="width: 100%; height: 180px; object-fit: cover"
              />
              <div
                style="position: absolute; bottom: 10px; right: 10px; background-color: rgba(0, 0, 0, 0.5); color: white; padding: 5px; border-radius: 5px; font-size: 0.8rem;"
              >
                {{ post.read_time }} min read
              </div>
            </div>
            <div class="card-content">
              <h2>{{ truncateText(post.title, 10) }}</h2>
              <p>{{ truncateText(post.meta_description, 20) }}</p>
            </div>
          </router-link>
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <router-link :to="`/profile/${post.username}`" style="text-decoration: none; color: inherit; display: flex; align-items: center;">
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

      <div v-if="isLoadingMore" style="text-align: center; margin-top: 20px;">
        <img src="https://blog.tourismofkashmir.com/kOnzy.gif" alt="Loading..." class="infinite-scroll-loader" />
      </div>

      <div v-if="!hasMore" style="text-align: center; margin-top: 20px; color: #999;">No more posts found.</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { debounce } from 'lodash';

export default {
  data() {
    return {
      posts: [],
      hasMore: true,
      page: 1,
      loading: true,
      isLoadingMore: false,
    };
  },
  created() {
    this.fetchPosts();
    this.handleScroll = debounce(this.handleScroll, 200);
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    async fetchPosts() {
      if (this.isLoadingMore) return;

      this.isLoadingMore = true;
      try {
        const response = await axios.get(`https://blog.tourismofkashmir.com/apis?posts&page=${this.page}`);
        const newData = response.data;
        if (!Array.isArray(newData) || newData.length === 0) {
          this.hasMore = false;
        } else {
          this.posts.push(...newData);
        }
        this.loading = false;
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        this.isLoadingMore = false;
      }
    },
    handleScroll() {
      const scrollableHeight = document.documentElement.scrollHeight;
      const currentScroll = window.innerHeight + window.scrollY;

      if (currentScroll >= scrollableHeight - 100 && !this.isLoadingMore && this.hasMore) {
        this.page++;
        this.fetchPosts();
      }
    },
    truncateText(text, maxWords) {
      const wordsArray = text.split(' ');
      return wordsArray.length > maxWords ? wordsArray.slice(0, maxWords).join(' ') + '...' : text;
    },
    formatViews(views) {
      if (views >= 10000000) return Math.floor(views / 10000000) + 'cr';
      if (views >= 1000000) return Math.floor(views / 1000000) + 'M';
      if (views >= 100000) return Math.floor(views / 100000) + 'L';
      if (views >= 1000) return Math.floor(views / 1000) + 'k';
      return views;
    },
    formatDate(date) {
      const currentDate = new Date();
      const postDate = new Date(date);
      const seconds = Math.floor((currentDate - postDate) / 1000);
      if (seconds < 60) return seconds + ' sec ago';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return minutes + ' mins ago';
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return hours + ' hours ago';
      const days = Math.floor(hours / 24);
      if (days < 7) return days + ' days ago';
      const weeks = Math.floor(days / 7);
      return weeks < 4 ? weeks + ' weeks ago' : Math.floor(days / 30) + ' months ago';
    }
  }
};
</script>

<style scoped>
.infinite-scroll-loader {
  width: 40px;
  height: 40px;
}
</style>
