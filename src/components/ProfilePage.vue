<template>
  <div class="profile-page" v-if="!isLoading">
    <div class="header">
      <img :src="userData?.avatar" alt="User Avatar" class="avatar" />
      <div class="user-info">
        <h2 class="user-name">{{ userData?.name }}</h2>
        <p class="username">@{{ userData?.username }}</p>
        <div class="stats">
          <span><strong>{{ followersCount }}</strong> Followers</span>
          <span><strong>{{ followingCount }}</strong> Following</span>
        </div>
        <button
          v-if="!isSelf"
          class="follow-button"
          :class="{ disabled: isFollowing }"
          @click="isFollowing ? handleUnfollow() : handleFollow()"
          :disabled="isFollowing"
        >
          <FontAwesomeIcon :icon="isFollowing ? 'user-minus' : 'user-plus'" />
          {{ isFollowing ? 'Unfollow' : 'Follow' }}
        </button>
      </div>
    </div>

    <div class="user-posts">
      <h3>User Posts</h3>
      <div v-if="userPosts.length === 0" class="no-posts">No posts available.</div>
      <div class="posts-grid">
        <div
          v-for="post in userPosts"
          :key="post.id"
          class="post"
          @click="navigateToPost(post)"
        >
          <div class="post-image">
            <img :src="post.image" alt="Post image" />
            <span class="read-time">{{ post.read_time }} min read</span>
          </div>
          <div class="post-content">
            <h4>{{ truncateTitle(post.title, 70) }}</h4>
            <div class="post-meta">
              <p class="category">
                <FontAwesomeIcon :icon="['fas', 'tag']" /> {{ post.category_name }}
              </p>
              <p class="views">Views: {{ formatViews(post.views) }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Loading spinner for more posts -->
      <div v-if="isLoadingMore" style="text-align: center; margin-top: 20px;">
        <img src="https://blog.tourismofkashmir.com/kOnzy.gif" alt="Loading..." class="infinite-scroll-loader" />
      </div>

      <!-- Message indicating end of posts -->
      <div v-if="!hasMorePosts && !isLoadingMore" class="end-of-posts">
        <p>No more posts to load.</p>
      </div>
    </div>
  </div>

  <SkeletonLoader v-else />
</template>

<script>
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import SkeletonLoader from './SkeletonLoader.vue';
import { debounce } from 'lodash';

export default {
  components: {
    FontAwesomeIcon,
    SkeletonLoader,
  },
  data() {
    return {
      userData: null,
      userPosts: [],
      followersCount: 0,
      followingCount: 0,
      isFollowing: null,
      isLoggedIn: false,
      currentUserID: null,
      isLoading: true,
      isLoadingMore: false,
      offset: 0,
      limit: 10,
      hasMorePosts: true, // New flag to track if more posts are available
    };
  },
  computed: {
    username() {
      return this.$route.params.username;
    },
    isSelf() {
      return this.currentUserID === this.userData?.id;
    },
  },
  created() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.isLoggedIn = true;
      this.currentUserID = user.id;
    }
    this.fetchUserData();
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    async fetchUserData() {
      this.isLoading = true;
      try {
        const response = await axios.get(`https://blog.tourismofkashmir.com/api_profile.php?username=${this.username}&requesting_user_id=${this.currentUserID}&offset=${this.offset}&limit=${this.limit}`);
        const { user, posts, is_following, followers_count, following_count } = response.data;
        this.userData = user;
        this.userPosts = posts;
        this.followersCount = followers_count;
        this.followingCount = following_count;
        this.isFollowing = is_following;
        this.hasMorePosts = posts.length === this.limit; // Check if more posts are available
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchMorePosts() {
      if (this.isLoadingMore || !this.hasMorePosts) return; // Disable if no more posts
      this.isLoadingMore = true;
      this.offset += this.limit; // Increment offset for next fetch

      try {
        const response = await axios.get(`https://blog.tourismofkashmir.com/api_profile.php?username=${this.username}&requesting_user_id=${this.currentUserID}&offset=${this.offset}&limit=${this.limit}`);
        const newPosts = response.data.posts;

        if (newPosts.length > 0) {
          this.userPosts.push(...newPosts);
          this.hasMorePosts = newPosts.length === this.limit; // Check if more posts are available
        } else {
          this.hasMorePosts = false; // No more posts to load
        }
      } catch (error) {
        console.error('Error fetching more posts:', error);
      } finally {
        this.isLoadingMore = false;
      }
    },
    handleScroll: debounce(function() {
      const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (bottom) {
        this.fetchMorePosts();
      }
    }, 300),
    async handleFollow() {
      try {
        await axios.get(`https://blog.tourismofkashmir.com/api_followandunfollow.php?follow=true&follower_id=${this.currentUserID}&followee_id=${this.userData.id}`);
        this.isFollowing = true;
        this.followersCount += 1;
      } catch (error) {
        console.error('Error following user:', error);
      }
    },
    async handleUnfollow() {
      try {
        await axios.get(`https://blog.tourismofkashmir.com/api_followandunfollow.php?removefollower=true&follower_id=${this.currentUserID}&followee_id=${this.userData.id}`);
        this.isFollowing = false;
        this.followersCount -= 1;
      } catch (error) {
        console.error('Error unfollowing user:', error);
      }
    },
    navigateToPost(post) {
      this.$router.push(`/${post.category_slug}/${post.post_slug}`);
    },
    formatViews(views) {
      if (views >= 10000000) return Math.floor(views / 10000000) + 'cr';
      else if (views >= 1000000) return Math.floor(views / 1000000) + 'M';
      else if (views >= 100000) return Math.floor(views / 100000) + 'L';
      else if (views >= 1000) return Math.floor(views / 1000) + 'k';
      else return views;
    },
    truncateTitle(title, maxLength) {
      return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
    },
  },
};
</script>

<style scoped>
.end-of-posts {
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
  color: #555;
}

.infinite-scroll-loader {
  width: 50px; /* Adjust the size as needed */
  height: 50px;
}

.profile-page {
  font-family: 'Arial', sans-serif;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid #f1f1f1;
  margin-right: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.75em;
  margin: 0;
  color: #333;
}

.username {
  color: #888;
}

.stats {
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.follow-button {
  background-color: #0095f6;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
  font-weight: bold;
}

.follow-button:hover:not(.disabled) {
  background-color: #007bb5;
  transform: scale(1.05);
}

.follow-button.disabled {
  background-color: #e0e0e0;
  color: #aaa;
  cursor: not-allowed;
}

.user-posts {
  margin-top: 20px;
}

.no-posts {
  text-align: center;
  color: #999;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.post {
  background-color: #fafafa;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

.post:hover {
  transform: translateY(-5px);
}

.post-image {
  position: relative;
}

.post-image img {
  width: 100%;
  height: 120px;
  display: block;
  border-bottom: 1px solid #eaeaea;
}

.read-time {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 8px;
  border-radius: 5px;
  font-size: 0.85em;
}

.post-content {
  padding: 5px;
}

.post-content h4 {
  margin: 0 0 10px;
  color: #333;
  font-size : 14px;
  font-weight : 500;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.category {
  color: #555;
  font-size: 0.9em;
}

.views {
  color: #888;
  font-size: 0.9em;
}

.loading {
  text-align: center;
  margin-top: 20px;
  color: #0095f6;
  font-weight: bold;
  font-size: 1.2em;
}
</style>
