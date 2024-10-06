<template>
    <div class="no-internet">
      <img src="@/assets/no-internet.gif" alt="No Internet" class="icon" />
      <h1>No Internet Connection</h1>
      <p>Please check your connection and try again.</p>
      <button @click="refreshPage" class="retry-button">Retry</button>
    </div>
  </template>
  
  <script>
  import { useRouter } from 'vue-router';
  import { ref, onMounted } from 'vue';
  import Toastify from 'toastify-js'; // Import Toastify
  import 'toastify-js/src/toastify.css'; // Import Toastify CSS
  
  export default {
    name: 'NoInternetPage',
    setup() {
      const router = useRouter();
      const isOnline = ref(navigator.onLine); // Track online status
  
      const updateOnlineStatus = () => {
        isOnline.value = navigator.onLine;
        if (isOnline.value) {
          Toastify({
            text: "Internet connection restored!",
            duration: 3000, // Duration in milliseconds
            gravity: "top", // Top or bottom
            position: 'center', // Left, center or right
            backgroundColor: "#28a745", // Green for success
            className: "toast-success",
          }).showToast();
        }
      };
  
      const refreshPage = () => {
        updateOnlineStatus(); // Update online status before routing
        if (isOnline.value) {
          router.push('/'); // Redirect to root if online
        } else {
          Toastify({
            text: "Still no internet connection. Please check your network.",
            duration: 3000, // Duration in milliseconds
            gravity: "top", // Top or bottom
            position: 'center', // Left, center or right
            backgroundColor: "#dc3545", // Red color for urgency
            className: "toast-error",
          }).showToast();
        }
      };
  
      // Set up event listeners for online/offline
      onMounted(() => {
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
      });
  
      return {
        refreshPage,
      };
    },
  };
  </script>
  
  <style scoped>
  .no-internet {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh; /* Full viewport height */
    background: linear-gradient(135deg, #f0f4f8, #cce4ff); /* Soft gradient background */
    text-align: center;
    padding: 20px;
    color: #343a40; /* Dark text color */
    font-family: 'Roboto', sans-serif; /* Use a more modern font */
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
    border-radius: 15px; /* Rounded corners */
    overflow: hidden; /* Prevent overflow */
  }
  
  .icon {
    width: 150px; /* Adjust size as needed */
    margin-bottom: 20px;
  }
  
  h1 {
    font-size: 2.5rem; /* Larger header */
    margin: 0;
    color: #dc3545; /* Red color for urgency */
    font-weight: bold; /* Bold text for emphasis */
  }
  
  p {
    font-size: 1.2rem; /* Larger font size */
    margin-bottom: 20px;
    color: #6c757d; /* Muted text color */
  }
  
  .retry-button {
    padding: 12px 25px; /* More padding for a button */
    background-color: #007bff; /* Primary button color */
    color: white;
    border: none;
    border-radius: 25px; /* Fully rounded button */
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease, transform 0.2s ease;
    box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3); /* Shadow effect */
  }
  
  .retry-button:hover {
    background-color: #0056b3; /* Darker shade on hover */
    transform: translateY(-2px); /* Slight lift effect */
  }
  
  .retry-button:active {
    transform: translateY(1px); /* Pressed effect */
  }
  </style>
  