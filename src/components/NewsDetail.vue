<template>
  <div ref="topRef">
    <div v-if="loading">
      <div class="loading-skeleton">
        <div class="loading-skeleton-image"></div>
        <div class="loading-skeleton-title"></div>
        <div class="loading-skeleton-meta"></div>
        <div class="loading-skeleton-content"></div>
        <div class="loading-skeleton-related">
          <div class="loading-skeleton-related-item" v-for="index in 3" :key="index">
            <div class="loading-skeleton-related-image"></div>
            <div class="loading-skeleton-related-title"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="container_post" v-else>
      <div class="card_post" v-if="post">
        <img :src="post.image" class="card-img-top news-image" :alt="post.title" />
        <div class="card-body">
          <h5 class="card-title">{{ post.title }}</h5>
          <p class="card-text post-meta">
            <FontAwesomeIcon :icon="['fas', 'eye']" /> {{ formatViews(post.views) }} views •
            <FontAwesomeIcon :icon="['fas', 'calendar-alt']" /> {{ formattedDate }} •
            <FontAwesomeIcon :icon="['fas', 'clock']" /> {{ post.read_time }} min read
          </p>
          <div class="content_post" v-html="post.content"></div>

          <div v-if="relatedPosts.length" class="related-posts">
            <h2>Also Read</h2>
            <div class="related-posts-container">
              <div class="related-post-card" v-for="(relatedPost, index) in relatedPosts" :key="index">
                <div @click="navigateToPost(relatedPost)" class="image-container" style="cursor: pointer;">
                  <img :src="relatedPost.image" :alt="relatedPost.title" />
                  <div class="related_read-time-overlay">{{ relatedPost.read_time }} min read</div>
                </div>
                <div class="post-details">
                  <h3 class="post-title">{{ truncateTitle(relatedPost.title) }}</h3>
                  <p class="post-excerpt">{{ relatedPost.excerpt }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="post-category">
            <strong>Category:</strong> {{ post.category_name }}
          </div>
          <div v-if="post.tag_slugs">
            <strong>Tags:</strong>
            <span v-for="(tagSlug, index) in post.tag_slugs.split(',')" :key="index">
              <router-link :to="'/tags/' + tagSlug" class="tag-link">
                <span class="tag">{{ post.tag_names.split(',')[index].trim() }}</span>
              </router-link>
              <span v-if="index < post.tag_slugs.split(',').length - 1">, </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && topViewedPosts.length" class="you-might-like outside-container">
      <h2>You Might Like</h2>
      <div class="top-viewed-posts-container">
        <div class="top-viewed-post-card" v-for="(topViewedPost, index) in topViewedPosts" :key="index">
          <router-link :to="`/${topViewedPost.category_slug}/${topViewedPost.slug}`" class="card-link">
            <div class="image-container">
              <img :src="topViewedPost.image" :alt="topViewedPost.title" class="top-viewed-post-image" />
              <div class="read-time-overlay">{{ topViewedPost.read_time }} min read</div>
            </div>
            <div class="text-container">
              <h3 class="top-viewed-post-title">{{ truncateTitle(topViewedPost.title) }}</h3>
              <p class="top-viewed-post-category">{{ topViewedPost.category_name }}</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <div class="interaction-icons">
  <div @click="toggleLike" id="like-btn" class="icon-container">
    <FontAwesomeIcon :icon="isLikedByUser ? ['fas', 'heart'] : ['far', 'heart']" :class="isLikedByUser ? 'liked' : ''" />
    <span>{{ likeCount }} Like{{ likeCount !== 1 ? 's' : '' }}</span>
  </div>
   <div @click="openCommentModal" class="icon-container">
        <FontAwesomeIcon icon="comment" />
        <span>{{ commentCount }} Comment{{ commentCount !== 1 ? 's' : '' }}</span>
      </div>
  <div @click="handleBookmarkClick" class="icon-container">
    <FontAwesomeIcon :icon="isBookmarked ? ['fas', 'bookmark'] : ['far', 'bookmark']" />
    <span>{{ isBookmarked ? 'Bookmarked' : 'Bookmark' }}</span>
  </div>
  <div @click="openShareModal" class="icon-container">
    <FontAwesomeIcon icon="share" />
    <span>Share</span>
  </div>
</div>

<!-- Share Modal -->
<div v-if="isShareModalOpen" class="share-modal" @click="closeShareModal">
<span class="close" @click="closeShareModal">
  <FontAwesomeIcon icon="times" />
</span>

  <div class="modal-content" @click.stop>
    
    <h2>Share this post</h2>
    <div class="share-options">
      <div class="share-option" @click="shareOn('facebook')">
        <FontAwesomeIcon :icon="['fab', 'facebook-f']" class="share-option-icon" />
        Share on Facebook
      </div>
      <div class="share-option" @click="shareOn('twitter')">
        <FontAwesomeIcon :icon="['fab', 'twitter']" class="share-option-icon" />
        Share on Twitter
      </div>
      <div class="share-option" @click="shareOn('whatsapp')">
        <FontAwesomeIcon :icon="['fab', 'whatsapp']" class="share-option-icon" />
        Share on WhatsApp
      </div>
      <div class="share-option" @click="copyLink">
        <FontAwesomeIcon :icon="['fas', 'clipboard']" class="share-option-icon" />
        Copy Link
      </div>
    </div>
  </div>
</div>


 <!-- Comment Modal -->
    <CommentModal 
      v-if="isCommentModalOpen" 
      :postId="post.id" 
      @close="closeCommentModal" 
      @fetchComments="fetchComments" 
    />

  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Toastify from 'toastify-js'; // Import Toastify
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import CommentModal from './CommentModal.vue';
import './NewsDetail.css'; // Adjust the path as needed

export default {
  components: {
    FontAwesomeIcon,
    CommentModal
  },
  setup() {
    const topRef = ref(null);
    const post = ref(null);
    const relatedPosts = ref([]);
    const topViewedPosts = ref([]);
    const loading = ref(true);
    const likeCount = ref(0);
    const isLikedByUser = ref(false);
    const commentCount = ref(0);
    const isBookmarked = ref(false);
    const route = useRoute();
    const router = useRouter();
    const isShareModalOpen = ref(false);
    const isCommentModalOpen = ref(false);


    const fetchPost = async () => {
      const postSlug = route.params.slug;
      loading.value = true;
      try {
        const response = await axios.get(`https://blog.tourismofkashmir.com/apis?post_slug=${postSlug}`);
        post.value = response.data;
        updateMetaTags();
        await fetchRelatedPosts();
        await fetchTopViewedPosts();
        await fetchLikes();
        await fetchCommentCount();
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        loading.value = false;
        window.scrollTo(0, 0);
      }
    };

    const fetchRelatedPosts = async () => {
      if (post.value && post.value.category_name) {
        loading.value = true;
        try {
          const response = await axios.get(`https://blog.tourismofkashmir.com/related_api.php?related_posts=${post.value.category_name}&exclude_post_id=${post.value.id}`);
          relatedPosts.value = response.data;
        } catch (error) {
          console.error("Error fetching related posts:", error);
        } finally {
          loading.value = false;
        }
      }
    };

    const fetchTopViewedPosts = async () => {
      if (post.value) {
        loading.value = true;
        try {
          const response = await axios.get(`https://blog.tourismofkashmir.com/related_api.php?topviewpost=true&exclude_post_id=${post.value.id}`);
          topViewedPosts.value = response.data;
        } catch (error) {
          console.error("Error fetching top viewed posts:", error);
        } finally {
          loading.value = false;
        }
      }
    };

    const updateMetaTags = () => {
      if (post.value) {
        const title = post.value.title;
        const description = post.value.excerpt || post.value.content.substring(0, 150);
        const image = post.value.image;
        const url = window.location.href;

        document.title = title;
        document.querySelector('meta[name="description"]').setAttribute('content', description);
        document.querySelector('meta[property="og:title"]').setAttribute('content', title);
        document.querySelector('meta[property="og:description"]').setAttribute('content', description);
        document.querySelector('meta[property="og:image"]').setAttribute('content', image);
        document.querySelector('meta[property="og:url"]').setAttribute('content', url);
      }
    };

    const fetchLikes = async () => {
      try {
        const response = await axios.get(`https://blog.tourismofkashmir.com/api_likes?action=getLikeCount&post_id=${post.value.id}`);
        likeCount.value = response.data.like_count;

        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
          const userId = JSON.parse(loggedInUser).id;
          const likeStatusResponse = await axios.get(`https://blog.tourismofkashmir.com/api_likes?action=checkUserLike&post_id=${post.value.id}&user_id=${userId}`);
          isLikedByUser.value = likeStatusResponse.data.user_liked;
        }
      } catch (error) {
        console.error("Error fetching like data:", error);
      }
    };

    const toggleLike = async () => {
      const loggedInUser = localStorage.getItem('user');
      if (!loggedInUser) {
        showToast("Please log in to like the post");
        return;
      }

      const userId = JSON.parse(loggedInUser).id;
      try {
        await axios.post(`https://blog.tourismofkashmir.com/api_likes?toggle-like`, { post_id: post.value.id, user_id: userId });
        isLikedByUser.value = !isLikedByUser.value;
        likeCount.value += isLikedByUser.value ? 1 : -1;
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    };

    const fetchCommentCount = async () => {
      try {
        const response = await axios.get(`https://blog.tourismofkashmir.com/api_comment_count.php?post_id=${post.value.id}`);
        commentCount.value = response.data.comment_count;
      } catch (error) {
        console.error("Error fetching comment count:", error);
      }
    };

    const openCommentModal = () => {
      isCommentModalOpen.value = true;
    };

    const closeCommentModal = () => {
      isCommentModalOpen.value = false;
    };

    const handleBookmarkClick = async () => {
      const loggedInUser = localStorage.getItem('user');
      if (!loggedInUser) {
        showToast("Please log in to manage bookmarks");
        return;
      }

      const userId = JSON.parse(loggedInUser).id;
      const action = isBookmarked.value ? 'delete' : 'add';

      try {
        await axios.get(`https://blog.tourismofkashmir.com/api_bookmark.php?action=${action}&user_id=${userId}&post_id=${post.value.id}`);
        isBookmarked.value = !isBookmarked.value;
        showToast(isBookmarked.value ? "Bookmarked!" : "Bookmark removed.");
      } catch (error) {
        console.error("Error toggling bookmark:", error);
      }
    };

    const openShareModal = () => {
      isShareModalOpen.value = true;
    };

    const closeShareModal = () => {
      isShareModalOpen.value = false;
    };

   const shareOn = (platform) => {
  const url = window.location.href;
  let shareUrl = '';

  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      break;
    case 'whatsapp':
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
      break;
    default:
      break;
  }

  window.open(shareUrl, '_blank');
  closeShareModal();
};

const copyLink = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    showToast("Post link copied to clipboard!");
  });
  closeShareModal();
};


    const formatViews = (views) => {
      if (views >= 10000000) return Math.floor(views / 10000000) + 'cr';
      if (views >= 1000000) return Math.floor(views / 1000000) + 'M';
      if (views >= 100000) return Math.floor(views / 100000) + 'L';
      if (views >= 1000) return Math.floor(views / 1000) + 'k';
      return views.toString();
    };

    const truncateTitle = (title, maxLength = 50) => {
      return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
    };

    const navigateToPost = async (relatedPost) => {
      await router.push(`/${relatedPost.category_slug}/${relatedPost.slug}`);
      await fetchPost(); // Fetch the new post after navigating
    };

    const showToast = (message, type = 'info') => {
  const toastClass = `toast-${type}`;
  
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top", 
    position: 'right', 
    className: toastClass, // Apply the type-specific class
    stopOnFocus: true 
  }).showToast();
};


    onMounted(() => {
      fetchPost();
    });

    watch(() => route.params.slug, () => {
      post.value = null; // Clear current post while loading new one
      fetchPost(); // Fetch the new post
    });

    return {
      topRef,
      post,
      relatedPosts,
      topViewedPosts,
      loading,
      likeCount,
      isLikedByUser,
      commentCount,
       isCommentModalOpen,
      isBookmarked,
      formatViews,
      truncateTitle,
      navigateToPost,
      toggleLike,
      handleBookmarkClick,
         isShareModalOpen,
      openShareModal,
      closeShareModal,
      shareOn,
      copyLink,
     openCommentModal,
      closeCommentModal,
          };
  },
};
</script>

<style scoped>
/* Add any additional styles for your component here */
.toast {
  border-radius: 8px; /* Slightly larger rounded corners */
  padding: 12px 20px; /* More padding for a spacious feel */
  color: #fff; /* White text for contrast */
  font-family: 'Roboto', sans-serif; /* Use a modern font */
  font-size: 14px; /* Slightly larger font size */
  text-align: center; /* Centered text for a balanced look */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); /* Soft shadow for depth */
  transition: transform 0.3s ease; /* Smooth hover effect */
}

/* Background color with gradient */
.toast-success {
  background: linear-gradient(90deg, #4caf50, #66bb6a); /* Green gradient */
}

.toast-error {
  background: linear-gradient(90deg, #f44336, #ef5350); /* Red gradient */
}

.toast-info {
  background: linear-gradient(90deg, #2196f3, #64b5f6); /* Blue gradient */
}

.toast-warning {
  background: linear-gradient(90deg, #ff9800, #ffb74d); /* Orange gradient */
}

/* Hover effect */
.toast:hover {
  transform: translateY(-2px); /* Lift effect on hover */
}

/* Share Modal */
.share-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8); /* Darker for better focus */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s; /* Fade-in animation */
  box-sizing: border-box;
}

/* Modal Content */
.modal-content {
 width: 90%; /* Responsive width */
    max-width: 500px; /* Max-width to prevent it from being too wide on large screens */
    background: #ffffff;
    padding: 20px;
    border-radius: 20px;
    gap: 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    align-items: center; /* Center children horizontally */
    gap: 20px;
  text-align: center;
  transition: transform 0.3s; /* Smooth scaling */
  transform: scale(0.95); /* Start slightly smaller */
   animation: scaleIn 0.3s ease-in-out; /* Animation for scaling in */
}

/* Show state for scaling */
.modal-content.show {
  transform: scale(1); /* Scale to normal size when shown */
}

/* Close Button */
.close {
  cursor: pointer;
  font-size: 24px; /* Larger close button */
  color: #fff; /* Softer color for visibility */
  position: absolute;
  top: 15px;
  right: 15px;
}

/* Share Options */
.share-options {
  display: flex;
  flex-direction: column; /* Stack buttons vertically */
  gap: 12px; /* Space between buttons */
}

/* Share Option Button */
.share-option {
  background-color: #f0f0f0; /* Light gray background */
  padding: 10px 15px; /* Padding for buttons */
  border-radius: 10px; /* Rounded corners */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s; /* Transition for effects */
  font-family: 'Montserrat', sans-serif; /* Different font for button text */
}

/* Hover effect for share options */
.share-option:hover {
  background-color: #e0e0e0; /* Darker gray on hover */
  transform: translateY(-2px); /* Lift effect */
}

/* Animation for modal fade-in */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

</style>
