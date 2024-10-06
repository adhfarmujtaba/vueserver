<template>
  <div class="tag-details-container" @scroll="handleScroll">
    <h2>Posts tagged with {{ tagName }}</h2>

    

    <div v-if="isLoading && posts.length === 0" class="skeleton-loading-container">
      <div class="skeleton-row" v-for="index in numberOfSkeletonRows" :key="index">
        <div class="skeleton-image"></div>
        <div class="skeleton-text">
          <div class="skeleton-title"></div>
          <div class="skeleton-description"></div>
        </div>
      </div>
    </div>
    <div v-if="isLoading && posts.length === 0" class="tag-details-loading">
      Loading posts...
    </div>
    <div v-else>
      <div class="tag-details-posts-container">
        <router-link
          v-for="(post, index) in posts"
          :key="index"
          :to="`/${post.category_slug}/${post.slug}`"
          class="tag-details-post-link"
        >
          <div class="tag-details-post-row">
            <div class="tag-details-image-container">
              <img :src="post.image" :alt="post.title" class="tag-details-post-image" />
              <div class="tag-details-read-time-overlay">{{ post.read_time }} min read</div>
            </div>
            <h3 class="tag-details-post-title">{{ trimTitle(post.title) }}</h3>
          </div>
        </router-link>
      </div>
      <p v-if="posts.length === 0" style="text-align: center;">No posts available.</p>
      <p v-if="!hasMorePosts && posts.length > 0" style="text-align: center;">No more posts to load.</p>
    </div>

    <div v-if="isLoadingMore" style="text-align: center; margin-top: 20px;">
      <img src="https://blog.tourismofkashmir.com/kOnzy.gif" alt="Loading..." class="infinite-scroll-loader" />
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
      tagName: '',
      isLoading: true,
      isLoadingMore: false,
      hasMorePosts: true,
      numberOfSkeletonRows: 5,
      page: 1,
    };
  },
  methods: {
    async fetchTagDetails() {
      this.isLoadingMore = this.page > 1; // Set loading more state based on the page
      this.isLoading = this.page === 1; // Only show loading for the initial fetch
      try {
        const response = await axios.get(`https://blog.tourismofkashmir.com/apis.php?tag_slug=${this.$route.params.tagSlug}&page=${this.page}`);
        const data = response.data;

        if (data.length > 0) {
          this.posts = [...this.posts, ...data]; // Append new posts
          this.tagName = data[0].tag_name;
        } else {
          this.hasMorePosts = false; // No more posts
        }
      } catch (error) {
        console.error('Error fetching tag details:', error);
      } finally {
        this.isLoading = false; // Hide initial loading indicator
        this.isLoadingMore = false; // Hide loading for more posts
      }
    },
    trimTitle(title, maxLength = 50) {
      return title.length <= maxLength ? title : `${title.substring(0, maxLength)}...`;
    },
    handleScroll() {
      const scrollPosition = window.innerHeight + window.scrollY;
      const bottomPosition = document.documentElement.offsetHeight;

      if (scrollPosition >= bottomPosition - 10 && !this.isLoading && !this.isLoadingMore && this.hasMorePosts) {
        this.loadMorePosts();
      }
    },
    loadMorePosts() {
      if (!this.hasMorePosts) return;

      this.isLoadingMore = true;
      this.page += 1; // Increment the page number
      this.fetchTagDetails(); // Fetch more posts
    },
  },
  created() {
    this.fetchTagDetails();
    window.addEventListener('scroll', debounce(this.handleScroll, 200));
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
};
</script>

<style scoped>
.tag-details-container {
    padding: 20px;
    max-width: 800px; /* Limit the maximum width for better readability on larger screens */
    margin: auto; /* Center the container on the page */
}

.tag-details-posts-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.loading-more {
  text-align: center;
  padding: 20px;
}

.tag-details-post-row {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 10px;
    border-radius: 10px; /* More pronounced rounded corners for a modern look */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
    transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out; /* Smooth transition for shadow and transform */
    background-color: #fff; /* White background for each post row */
}

.tag-details-post-row:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); /* Larger shadow on hover for a "lifted" effect */
    transform: translateY(-5px); /* Slight upward shift on hover */
}

.tag-details-post-image {
    width: 100px;
    height: 60px;
    object-fit: cover;
    border-radius: 5px;
    flex-shrink: 0; /* Prevent the image from shrinking */
}

.tag-details-post-title {
    margin: 0;
    font-size: 13px; /* Font size */
    color: #333; /* Text color */
    flex-grow: 1;
    overflow: visible; /* Keep overflow visible */
    text-overflow: clip; /* Clip the overflow without adding ellipsis */
    line-height: 1.5; /* Adjust line height for better readability of wrapped text */
    padding-right: 10px; /* Add some padding on the right for spacing */
    word-wrap: break-word; /* Break the words to prevent overflow */
    word-break: break-word; /* Ensures words break to prevent overflow - good for long words */
    white-space: normal; /* Ensure whitespace is handled normally to allow wrapping */
}


.tag-details-loading {
    text-align: center;
    padding: 20px;
    font-size: 18px;
}

.tag-details-image-container {
    position: relative; /* Establish a positioning context for the overlay */
    width: 100px; /* Match the width of the post-image */
    height: 60px; /* Match the height of the post-image */
}

.tag-details-read-time-overlay {
    position: absolute; /* Position the overlay within the image container */
    bottom: 2px; /* Align the overlay to the bottom of the container */
    left: 2px; /* Align the overlay to the left of the container */
    background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent overlay */
    color: #ffffff; /* Text color */
    padding: 2px 5px; /* Padding around the text */
    font-size: 10px; /* Smaller font size for the overlay text */
    border-radius: 3px;
}

.tag-details-post-link {
    text-decoration: none; /* Removes underline from links */
    color: inherit; /* Inherits the color from parent elements */
    display: block; /* Makes the entire area clickable */
}
/* Tag Details Skeleton Loading */

      /* Dark mode styles */
@media (prefers-color-scheme: dark) {
    .tag-details-container {
        background-color: #333; /* Dark background color */
        color: #fff; /* Light text color */
    }
.tag-details-container h3{
    color: #ffffff;
}
    .tag-details-post-row {
        background-color: #444; /* Darker background color for post rows */
        box-shadow: 0 5px 15px rgba(255,255,255,0.2); /* Lighter shadow for depth */
    }

    .tag-details-post-row:hover {
        box-shadow: 0 7px 20px rgba(255,255,255,0.2); /* Lighter shadow on hover */
    }

   .skeleton-loading-container {
        background-color: #444; /* Darker background for the loading container */
    }

    .skeleton-row {
        background-color: #555; /* Darker gray for skeleton rows */
    }

    .skeleton-image {
        background-color: #666; /* Gray placeholder for image in dark mode */
    }

    .skeleton-title {
        background-color: #777; /* Slightly lighter gray for title */
    }

    .skeleton-description {
        background-color: #777; /* Same color for description */
    }
    
   

   
}
.skeleton-loading-container {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Space between skeleton rows */
}

.skeleton-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 10px;
    background-color: #e0e0e0; /* Light gray background for skeleton */
    animation: pulse 1.5s infinite; /* Pulsing effect */
}

.skeleton-image {
    width: 100px;
    height: 60px;
    background-color: #ccc; /* Gray placeholder for image */
    border-radius: 5px; /* Rounded corners */
}

.skeleton-text {
    flex-grow: 1; /* Allow text to take remaining space */
}

.skeleton-title {
    height: 16px; /* Height of the title */
    background-color: #ddd; /* Slightly darker gray for title */
    border-radius: 4px; /* Rounded corners */
    margin-bottom: 6px; /* Space below the title */
}

.skeleton-description {
    height: 12px; /* Height of the description */
    background-color: #ddd; /* Same color for description */
    border-radius: 4px; /* Rounded corners */
}

@keyframes pulse {
    0% {
        background-color: #e0e0e0;
    }
    50% {
        background-color: #f0f0f0; /* Lighter gray for pulsing */
    }
    100% {
        background-color: #e0e0e0;
    }
}
@media (prefers-color-scheme: dark) {
    .skeleton-loading-container {
        background-color: #444; /* Darker background for the loading container */
    }

    .skeleton-row {
        background-color: #555; /* Darker gray for skeleton rows */
    }

    .skeleton-image {
        background-color: #666; /* Gray placeholder for image in dark mode */
    }

    .skeleton-title {
        background-color: #777; /* Slightly lighter gray for title */
    }

    .skeleton-description {
        background-color: #777; /* Same color for description */
    }
    
    @keyframes pulse {
        0% {
            background-color: #444; /* Start darker */
        }
        50% {
            background-color: #555; /* Lighter during the pulse */
        }
        100% {
            background-color: #444; /* Return to darker */
        }
    }
}



.infinite-scroll-loader {
  width: 40px;
  height: 40px;
}

</style>
