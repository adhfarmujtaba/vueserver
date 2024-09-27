import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/styles.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { faEye, faClock, faCalendarAlt, faShare, faHeart, faBookmark, faClipboard } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart, faBookmark as farBookmark, faCommentDots as farCommentDots } from '@fortawesome/free-regular-svg-icons';
import { faFacebookF, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons'; 

import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import 'simplebar/dist/simplebar.css';

// Add all solid icons
library.add(fas, faEye, faClock, faCalendarAlt, faShare, faHeart, faBookmark, faClipboard);
library.add(farHeart, farBookmark, farCommentDots);
library.add(faFacebookF, faTwitter, faWhatsapp);

const app = createApp(App);

const toastOptions = {
    position: 'top-center',
    timeout: 2000,
    closeOnClick: true,
    pauseOnHover: true,
};

app.component('font-awesome-icon', FontAwesomeIcon);
app.use(router);
app.use(Toast, toastOptions);
app.mount('#app');
