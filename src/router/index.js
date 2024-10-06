// src/router/index.js
const { createRouter, createWebHistory } = require('vue-router');

// Importing components
const NewsList = require('../components/NewsList.vue');
const PostDetail = require('../components/NewsDetail.vue');
const CategoryList = require('../components/CategoryList.vue');
const LoginPage = require('../components/LoginPage.vue');
const NotificationPage = require('../components/NotificationPage.vue');
const BookmarkPage = require('../components/BookmarkPage.vue');
const ProfilePage = require('../components/ProfilePage.vue');
const PageViewer = require('../components/PageViewer.vue');
const TagDetails = require('../components/TagDetails.vue');
const DashboardPage = require('../Dashboard/DashboardPage.vue');
const CreatePost = require('../Dashboard/CreatePost.vue');
const PostList = require('../Dashboard/PostList.vue');
const EditPost = require('../Dashboard/EditPost.vue');

// Define routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: NewsList,
  },
  {
    path: '/:categorySlug',
    name: 'Category',
    component: CategoryList,
  },
  {
    path: '/:category_slug/:slug',
    name: 'PostDetail',
    component: PostDetail,
    props: true,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/notification',
    name: 'Notifications',
    component: NotificationPage,
  },
  {
    path: '/bookmark',
    name: 'Bookmark',
    component: BookmarkPage,
  },
  {
    path: '/profile/:username',
    name: 'Profile',
    component: ProfilePage,
    props: true,
  },
  {
    path: '/page/:slug',
    name: 'PageViewer',
    component: PageViewer,
  },
  {
    path: '/tags/:tagSlug',
    name: 'TagDetails',
    component: TagDetails,
    props: true,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
  },
  {
    path: '/dashboard/create-post',
    name: 'CreatePost',
    component: CreatePost,
  },
  {
    path: '/dashboard/post-list',
    name: 'PostList',
    component: PostList,
  },
  {
    path: '/dashboard/edit-post/:id',
    name: 'EditPost',
    component: EditPost,
    props: true,
  },
];

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Export the router instance
module.exports = router; // Use CommonJS export
