import { createRouter, createWebHistory } from 'vue-router';
import NewsList from '../components/NewsList.vue'; // Adjust the path based on your folder structure
import PostDetail from '../components/NewsDetail.vue'; // Adjust the path based on your folder structure
import CategoryList from '../components/CategoryList.vue'; // Import the CategoryList component
import LoginPage from '../components/LoginPage.vue';
import NotificationPage from '../components/NotificationPage.vue'; // Import the NotificationPage component
import BookmarkPage from '../components/BookmarkPage.vue'; // Import the BookmarkPage component

const routes = [
  {
    path: '/',
    name: 'Home',
    component: NewsList,
  },
  {
    path: '/:categorySlug',
    component: CategoryList,
  },
  {
    path: '/:category_slug/:slug',
    name: 'PostDetail',
    component: PostDetail,
    props: true, // Pass route params as props to the component
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/notification',
    name: 'notifications', // Ensure this name matches the computed property check
    component: NotificationPage, // Add the new notification route
  },
  {
    path: '/bookmark',
    name: 'Bookmark',
    component: BookmarkPage, // Add the new bookmark route
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
