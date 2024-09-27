<template>
  <div :class="['modal', { show: isOpen, 'modal-visible': isOpen }]" class="custom-comment-modal">
    <div class="custom-modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Comments</h2>
        <span class="custom-close-button" @click="onClose">&times;</span>
      </div>
      <div class="modal-body" @scroll="handleScroll" ref="modalBody">
        
    <div v-if="initialLoading" class="aly-loading-placeholder">
  <div class="aly-loading-comment" v-for="index in 7" :key="index">
    <div class="aly-loading-avatar"></div>
    <div class="aly-loading-details">
      <div class="aly-loading-line aly-loading-name"></div>
      <div class="aly-loading-line aly-loading-message"></div>
    </div>
  </div>
</div>

        <div v-else>
          <div v-if="comments.length === 0" class="no-comments-message">No comments yet.</div>
          <div v-else>
            <div v-for="(comment, index) in comments" :key="comment.id" class="custom-comment-item">
              <div class="custom-comment-avatar">
                <img :src="comment.avatar" alt="Avatar"/>
              </div>
              <div class="custom-comment-content">
                <div class="custom-comment-header">
                  <a class="custom-comment-author" :href="'#' + comment.username">
                    {{ comment.username }}
                  </a>
                  <span class="custom-comment-date">
                    {{ formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) }}
                  </span>
                </div>
                <div class="custom-comment-text">
                  <span v-if="showFullComment[index]">
                    {{ comment.content }}
                    <a href="#!" class="custom-read-more-link" @click="toggleFullComment(index)">Read less</a>
                  </span>
                  <span v-else>
                    {{ comment.content.length > 100 ? `${comment.content.substring(0, 100)}...` : comment.content }}
                    <a v-if="comment.content.length > 100" href="#!" class="custom-read-more-link" @click="toggleFullComment(index)">Read more</a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="infiniteLoading && comments.length > 0 && !initialLoading" class="custom-loading-spinner">
          <div class="spinner"></div>
        </div>
      </div>

      <div class="comment-input-container">
  <input 
    v-model="newComment" 
    placeholder="Write a comment..." 
    class="custom-comment-input" 
    type="text" />
  <button @click="postComment" class="custom-post-button">Post</button>
</div>

    </div>
  </div>
</template>




<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import './comment.css';
import _ from 'lodash';

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    onClose: {
      type: Function,
      required: true,
    },
    postId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const comments = ref([]);
    const initialLoading = ref(true);
    const infiniteLoading = ref(false);
    const newComment = ref('');
    const showFullComment = ref([]);
    const offset = ref(0);
    const limit = ref(10);
    const canLoadMore = ref(true);
    const modalBody = ref(null);

    const fetchComments = async () => {
      if (!canLoadMore.value) return;

      infiniteLoading.value = true;
      try {
        const response = await axios.get(`https://blog.tourismofkashmir.com/api_comments.php?post_id=${props.postId}&offset=${offset.value}&limit=${limit.value}`);
        if (response.data.length < limit.value) {
          canLoadMore.value = false;
        }
        comments.value.push(...response.data);
        showFullComment.value = showFullComment.value.concat(new Array(response.data.length).fill(false));
        offset.value += response.data.length;
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        initialLoading.value = false; // Set this to false after initial fetch
        infiniteLoading.value = false; // Set this to false after fetching more comments
      }
    };

    const postComment = async () => {
  const loggedInUser = localStorage.getItem('user');
  if (!loggedInUser) {
    alert("Please log in to post a comment");
    return;
  }

  if (!newComment.value.trim()) return;

  const user = JSON.parse(loggedInUser);
  const commentData = {
    post_id: props.postId,
    user_id: user.id,
    content: newComment.value,
    created_at: new Date().toISOString(), // Add the current timestamp
  };

  try {
    const response = await axios.post('https://blog.tourismofkashmir.com/api_comments.php', commentData);
    
    // Prepend the new comment to the comments array
    comments.value.unshift({
      id: response.data.id, // Assuming your API returns the new comment's ID
      avatar: user.avatar, // Add user's avatar or a default one
      username: user.username, // Add user's username
      content: newComment.value,
      created_at: commentData.created_at, // Use the created_at timestamp
    });
    
    newComment.value = ''; // Clear the input
  } catch (error) {
    console.error("Error posting comment:", error);
  }
};

    const toggleFullComment = (index) => {
      showFullComment.value[index] = !showFullComment.value[index];
    };

    const handleScroll = _.throttle(() => {
      const scrollTop = modalBody.value.scrollTop;
      const scrollHeight = modalBody.value.scrollHeight;
      const clientHeight = modalBody.value.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 10) {
        fetchComments();
      }
    }, 200);

    onMounted(() => {
      fetchComments();
    });

    return {
      comments,
      initialLoading,
      infiniteLoading,
      newComment,
      postComment,
      showFullComment,
      toggleFullComment,
      formatDistanceToNow,
      handleScroll,
      modalBody,
    };
  },
};
</script>




