<template>
  <div class="notification-page">
    <div class="header">
      <div class="back-button" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </div>
      <h1>Notifications</h1>
    </div>

    <div v-if="loading" class="skeleton-loader">
      <!-- Skeleton loader items -->
      <div class="skeleton-item" v-for="n in 10" :key="n">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-text">
          <div class="skeleton-message"></div>
          <div class="skeleton-date"></div>
        </div>
      </div>
    </div>

    <div v-if="!loading && notifications.length === 0" class="no-notifications">No notifications found.</div>
    
    <ul v-if="!loading && notifications.length > 0">
      <li v-for="notification in notifications" :key="notification.id" class="notification-item">
        <div class="notification-user" v-if="notification.fromAvatar || notification.fromUsername">
          <img v-if="notification.fromAvatar" :src="notification.fromAvatar" alt="User Avatar" class="avatar" />
          <strong v-if="notification.fromUsername">{{ notification.fromUsername }}</strong>
        </div>
        <div class="notification-content">
          <p>{{ notification.message }}</p>
          <small>{{ formatDate(notification.created_at) }}</small>
        </div>
        <div class="notification-delete" @click="deleteNotification(notification.id)">
          <i class="fas fa-trash-alt"></i>
        </div>
      </li>
    </ul>

    <div v-if="loading && hasMore" class="spinner"></div> <!-- Spinner for loading more notifications -->

    <div v-if="noMoreMessage" class="no-more-notifications">{{ noMoreMessage }}</div>
  </div>

</template>

<script>
import axios from 'axios';
import './notification.css';

export default {
  data() {
    return {
      userId: null,
      notifications: [],
      loading: true,
      page: 1,
      perPage: 10,
      hasMore: true,
      noMoreMessage: '',
    };
  },
  created() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      this.userId = user.id;
      this.fetchNotifications();
    } else {
      this.$router.push("/login");
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    async fetchNotifications(page = 1) {
      if (!this.userId || !this.hasMore) return;

      const url = `https://blog.tourismofkashmir.com/apinotification.php?get_notifications&user_id=${this.userId}&page=${page}&per_page=${this.perPage}`;

      try {
        const response = await axios.get(url);
        const fetchedNotifications = response.data;

        if (Array.isArray(fetchedNotifications)) {
          this.notifications.push(...fetchedNotifications);

          if (fetchedNotifications.length < this.perPage) {
            this.hasMore = false;
            this.noMoreMessage = 'No more notifications available.';
          }
        } else if (fetchedNotifications.message) {
          this.noMoreMessage = fetchedNotifications.message;
          this.hasMore = false;
        } else {
          console.warn('Unexpected response format:', fetchedNotifications);
        }

        if (page === 1) await this.markAllAsRead();
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        this.loading = false;
      }
    },
    async markAllAsRead() {
      const url = `https://blog.tourismofkashmir.com/apinotification.php?update_all_notifications&user_id=${this.userId}`;
      try {
        await axios.get(url);
        this.notifications.forEach(notification => (notification.is_read = 1));
      } catch (error) {
        console.error('Error updating notifications:', error);
      }
    },
    async deleteNotification(notificationId) {
      const url = `https://blog.tourismofkashmir.com/apinotification.php?delete_notification&user_id=${this.userId}&notification_id=${notificationId}`;
      try {
        await axios.get(url);
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    goBack() {
      this.$router.go(-1);
    },
    handleScroll() {
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 500;

      if (scrollPosition >= threshold && !this.loading && this.hasMore) {
        this.page++;
        this.loading = true;
        this.fetchNotifications(this.page);
      }
    },
  },
};
</script>

<style scoped>
/* Add spinner styles here */
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 30px;
  height: 30px;
  position : relative;
  animation: spin 1s linear infinite;
  margin: 20px auto; /* Center the spinner */
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
