<template>
    <div class="container">
        <h1>Post List</h1>
        <table class="post-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Post Status</th>
                    <th>Approval Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <template v-if="initialLoading">
                    <tr v-for="index in 10" :key="index">
                        <td><div class="skeleton-loader"></div></td>
                        <td><div class="skeleton-loader" style="width: 120px;"></div></td>
                        <td><div class="skeleton-loader" style="width: 120px;"></div></td>
                        <td><div class="skeleton-loader" style="width: 80px;"></div></td>
                    </tr>
                </template>
                <tr v-for="post in posts" :key="post.id">
                    <td>{{ post.title }}</td>
                    <td>{{ post.post_status }}</td>
                    <td>
                        <span class="approval-status">
                            <i :class="getApprovalIcon(post.status)"></i>
                            {{ formatApprovalStatus(post.status) }}
                        </span>
                    </td>
                    <td>
                        <button class="edit-button" @click="editPost(post.id)">Edit</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="loadingMore" class="spinner-container">
            <div class="spinner"></div>
        </div>
        <div v-if="!hasMorePosts && !initialLoading" class="no-more-posts">No more posts available.</div>
    </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { throttle } from 'lodash';

export default {
    setup() {
        const posts = ref([]);
        const initialLoading = ref(true);
        const loadingMore = ref(false);
        const offset = ref(0);
        const limit = 10;
        const hasMorePosts = ref(true);
        const router = useRouter();

        const fetchPosts = async () => {
            try {
                const response = await axios.get('https://blog.tourismofkashmir.com/list_posts.php', {
                    params: { offset: offset.value, limit },
                });

                if (response.data.length === 0) {
                    hasMorePosts.value = false;
                } else {
                    posts.value.push(...response.data);
                    offset.value += limit;
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                initialLoading.value = false;
                loadingMore.value = false;
            }
        };

        const handleScroll = throttle(() => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.offsetHeight;

            if (scrollTop + windowHeight >= documentHeight - 50 && !loadingMore.value && hasMorePosts.value) {
                loadingMore.value = true;
                fetchPosts();
            }
        }, 200);

        onMounted(() => {
            fetchPosts();
            window.addEventListener('scroll', handleScroll);
        });

        watch(() => posts.value, (newPosts) => {
            if (newPosts.length > 0) {
                loadingMore.value = false;
            }
        });

        const editPost = (id) => {
            router.push(`/dashboard/edit-post/${id}`);
        };

        const formatApprovalStatus = (status) => {
            switch (status) {
                case 'approved':
                    return 'Live';
                case 'rejected':
                    return 'Rejected';
                case 'pending':
                    return 'In Review';
                default:
                    return 'Unknown';
            }
        };

        const getApprovalIcon = (status) => {
            switch (status) {
                case 'approved':
                    return 'fas fa-check-circle'; // Green check
                case 'rejected':
                    return 'fas fa-times-circle'; // Red cross
                case 'pending':
                    return 'fas fa-clock'; // Yellow clock
                default:
                    return 'fas fa-question-circle'; // Unknown
            }
        };

        onBeforeUnmount(() => {
            window.removeEventListener('scroll', handleScroll);
        });

        return {
            posts,
            initialLoading,
            loadingMore,
            editPost,
            hasMorePosts,
            formatApprovalStatus,
            getApprovalIcon,
        };
    },
};
</script>

<style scoped>
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Arial', sans-serif;
}

h1 {
    color: #333;
    margin-bottom: 20px;
    font-size: 2rem;
    text-align: center;
}

.post-table {
    width: 100%;
    border-collapse: collapse;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
}

th,
td {
    border: 1px solid #ddd;
    padding: 15px;
    text-align: left;
}

th {
    background-color: #007bff;
    color: white;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

tr:hover {
    background-color: #f1f1f1;
}

.edit-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
}

.edit-button:hover {
    background-color: #0056b3;
    transform: scale(1.05);
}

.approval-status {
    display: flex;
    align-items: center;
    font-size: 1rem;
}

.approval-status i {
    margin-right: 5px;
    color: #333;
}

.no-more-posts {
    text-align: center;
    font-size: 1.2rem;
    color: #666;
    margin: 20px 0;
}

.spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    margin: 20px 0;
}

.spinner {
    text-align: center;
    font-size: 18px;
    color: #007bff;
}

/* Skeleton Loader Styles */
.skeleton-loader {
    width: 280px;
    height: 40px;
    background-color: #e0e0e0;
    border-radius: 4px;
    animation: shimmer 1.5s infinite linear;
    margin-bottom: 8px;
}

@keyframes shimmer {
    0% {
        background-position: -1000px 0;
    }
    100% {
        background-position: 1000px 0;
    }
}
</style>
