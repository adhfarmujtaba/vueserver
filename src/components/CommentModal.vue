<template>
  <div :class="['modal', { show: isOpen, 'modal-visible': isOpen }]" class="custom-comment-modal">
    <div class="custom-modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Comments</h2>
        <span class="custom-close-button" @click="onClose">&times;</span>
      </div>
      <div class="modal-body">
        <div v-if="loadingComments" class="custom-loading-comments-placeholder">
          <div class="custom-loading-comment-item" v-for="index in 7" :key="index">
            <div class="custom-loading-avatar"></div>
            <div class="custom-loading-details">
              <div class="custom-loading-line custom-loading-name"></div>
              <div class="custom-loading-line custom-loading-message"></div>
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
      </div>

      <div class="comment-input-container">
        <textarea 
          v-model="newComment" 
          placeholder="Write a comment..." 
          class="custom-comment-input" 
          rows="1">
        </textarea>
        <button @click="postComment" class="custom-post-button">Post</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

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
    const loadingComments = ref(true);
    const newComment = ref('');
    const showFullComment = ref([]);

    const fetchComments = async () => {
      loadingComments.value = true;
      try {
        const response = await axios.get(`https://blog.tourismofkashmir.com/api_comments.php?post_id=${props.postId}`);
        comments.value = response.data;
        showFullComment.value = new Array(response.data.length).fill(false);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        loadingComments.value = false;
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
      };

      try {
        await axios.post('https://blog.tourismofkashmir.com/api_comments.php', commentData);
        newComment.value = ''; // Clear the input
        fetchComments(); // Refresh comments
      } catch (error) {
        console.error("Error posting comment:", error);
      }
    };

    const toggleFullComment = (index) => {
      showFullComment.value[index] = !showFullComment.value[index];
    };

    onMounted(() => {
      fetchComments();
    });

    return {
      comments,
      loadingComments,
      newComment,
      postComment,
      showFullComment,
      toggleFullComment,
      formatDistanceToNow,
    };
  },
};
</script>

<style scoped>
.custom-comment-modal {
   display: flex;
    justify-content: center;
    align-items: flex-end; /* Align items to the bottom */
    position: fixed;
    top: -50px;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
 
   
    transition: opacity 0.4s ease-in-out;
    z-index: 90;
}

.custom-modal-content {
  background-color: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  height :400px;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #efefef;
}

.modal-title {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.custom-close-button {
  cursor: pointer;
  font-size: 24px;
}

.modal-body {
  flex-grow: 1;
  padding: 10px 15px;
  max-height: 400px; /* Limit the height of the comment section */
  overflow-y: auto;
}

.custom-loading-comments-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.custom-loading-comment-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.custom-loading-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
}

.custom-loading-details {
  margin-left: 10px;
}

.custom-loading-line {
  background-color: #e0e0e0;
  margin: 5px 0;
  border-radius: 4px;
}

.custom-comment-item {
  display: flex;
  margin: 15px 0;
}

.custom-comment-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.custom-comment-content {
  flex-grow: 1;
  margin-left: 10px;
}

.custom-comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-comment-author {
  color: #007bff;
  font-weight: bold;
  font-size: 14px;
  text-decoration: none;
}

.custom-comment-date {
  font-size: 12px;
  color: #777;
}

.custom-comment-text {
  margin-top: 5px;
  color: #555;
  font-size: 14px;
  line-height: 1.5;
}

.custom-read-more-link {
  color: #007bff;
  cursor: pointer;
  margin-left: 5px;
  text-decoration: none;
}

.comment-input-container {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9; /* Light background for input area */
  border-top: 1px solid #efefef;
}

.custom-comment-input {
  flex-grow: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  margin-right: 10px;
  font-size: 14px;
  resize: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.custom-post-button {
  background-color: #007bff;
  color: #ffffff;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.custom-post-button:hover {
  background-color: #0056b3;
}

.custom-post-button:active {
  transform: scale(0.95);
}
</style>
