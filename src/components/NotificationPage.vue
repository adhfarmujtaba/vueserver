<template>
  <div class="notification-page">
  <div class="header">
      <div class="back-button" @click="goBack">
        <i class="fas fa-arrow-left"></i> <!-- Font Awesome Back Arrow Icon -->
      </div>
    <h1>Notifications</h1>
    </div>
    <div v-if="loading" class="skeleton-loader">
      <div class="skeleton-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-text">
          <div class="skeleton-message"></div>
          <div class="skeleton-date"></div>
        </div>
      </div>
      <div class="skeleton-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-text">
          <div class="skeleton-message"></div>
          <div class="skeleton-date"></div>
        </div>
      </div>
      <div class="skeleton-item">
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
          <i class="fas fa-trash-alt"></i> <!-- Font Awesome Trash Icon -->
        </div>
      </li>
    </ul>
  </div>
</template>



<script>
import axios from 'axios';

export default {
  data() {
    return {
      userId: null, // Initialize userId to null
      notifications: [],
      loading: true,
    };
  },
  created() {
    const user = JSON.parse(localStorage.getItem("user")); // Retrieve user data
    if (user && user.id) {
      this.userId = user.id; // Set user ID
      this.fetchNotifications();
    } else {
      this.$router.push("/login"); // Redirect to login if user is not found
    }
  },
  methods: {
    async fetchNotifications() {
      if (!this.userId) return; // Prevent fetching if userId is not set

      const url = `https://blog.tourismofkashmir.com/apinotification.php?get_notifications&user_id=${this.userId}`; // Construct URL

      try {
        const response = await axios.get(url);
        this.notifications = response.data;
        // Automatically mark all notifications as read
        await this.markAllAsRead();
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
        this.notifications.forEach(notification => notification.is_read = 1);
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
      this.$router.go(-1); // Go back to the previous page
    },
  },
};
</script>

<style scoped>
.notification-page {
  background-color: #fafafa;
  padding: 20px;
  max-width: 600px;
  margin: auto;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Space between skeleton items */
}

.skeleton-item {
  display: flex;
  align-items: center; /* Align avatar and text */
  gap: 10px; /* Space between avatar and text */
  padding: 10px;
}

.skeleton-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #e0e0e0; /* Light gray for the avatar */
  animation: pulse 1.5s infinite; /* Pulse effect */
}

.skeleton-text {
  flex-grow: 1; /* Allow text to take available space */
}

.skeleton-message,
.skeleton-date {
  height: 15px;
  border-radius: 4px;
  background-color: #e0e0e0; /* Light gray */
  animation: pulse 1.5s infinite; /* Pulse effect */
}

.skeleton-message {
  width: 80%; /* Wider for the message */
}

.skeleton-date {
  width: 50%; /* Narrower for the date */
  margin-top: 5px; /* Space above date */
}

@keyframes pulse {
  0% {
    background-color: #e0e0e0;
  }
  50% {
    background-color: #d0d0d0; /* Slightly darker */
  }
  100% {
    background-color: #e0e0e0;
  }
}

.notification-item {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Space between content and icon */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.notification-item:hover {
  transform: scale(1.01);
}

.notification-user {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.notification-content {
  flex-grow: 1;
}

.notification-content p {
  margin: 0;
  font-weight: 500;
  color: #262626;
}

.notification-content small {
  display: block;
  margin-top: 5px;
  color: #999;
}

.notification-delete {
  cursor: pointer;
  color: #ff3b30; /* Red color for delete icon */
  transition: color 0.3s;
}

.notification-delete:hover {
  color: #e63946; /* Darker red on hover */
}

.loading, .no-notifications {
  text-align: center;
  color: #999;
  font-size: 16px;
}
.header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.back-button {
  cursor: pointer;
  margin-right: 15px;
  color: #333;
  font-size: 24px;
  transition: color 0.3s;
}

.back-button:hover {
  color: #007bff; /* Change color on hover */
}
h1 {
  font-size: 28px;
  color: #333;
}
</style>
