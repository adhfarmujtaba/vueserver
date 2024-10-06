<template>
    <div class="container">
        <h1>Edit Post</h1>
        <div v-if="isLoading" class="loading-message">Loading...</div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <form v-if="post" @submit.prevent="updatePost" class="post-form">
            <div class="form-group">
                <label for="title">Title</label>
                <input type="text" id="title" v-model="post.title" required class="form-input" />
            </div>

            <div class="form-group">
                <label for="content">Content</label>
                <div ref="editor" class="quill-editor"></div>
            </div>

            <button type="submit" class="submit-button">Save Changes</button>
        </form>
    </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router'; // Import useRoute for route parameters
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

export default {
    setup() {
        const post = ref(null);
        const isLoading = ref(true);
        const errorMessage = ref(null);
        const editor = ref(null);
        let quillInstance = null;
        const route = useRoute(); // Access the current route

        const fetchPost = async () => {
            isLoading.value = true;
            const postId = route.params.id; // Get the post ID from the route parameters
            try {
                const response = await axios.get(`https://blog.tourismofkashmir.com/getpostdetailsapi.php?id=${postId}`);
                post.value = response.data.post;

                if (!post.value) {
                    throw new Error('Post not found');
                }
            } catch (error) {
                console.error('Error fetching post details:', error);
                errorMessage.value = 'Failed to load post details.';
            } finally {
                isLoading.value = false;
            }
        };

        const initializeQuill = () => {
            quillInstance = new Quill(editor.value, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ header: [1, 2, false] }],
                        ['bold', 'italic', 'underline'],
                        ['image', 'code-block'],
                        ['clean'],
                    ],
                },
            });

            if (post.value && post.value.content) {
                quillInstance.root.innerHTML = post.value.content;
            }
        };

        const updatePost = async () => {
            try {
                const content = quillInstance.root.innerHTML;
                const response = await axios.post('https://blog.tourismofkashmir.com/update_post.php', {
                    id: post.value.id,
                    title: post.value.title,
                    content,
                });
                if (response.data.success) {
                    alert('Post updated successfully!');
                }
            } catch (error) {
                console.error('Error updating post:', error);
                errorMessage.value = 'Failed to update post.';
            }
        };

        onMounted(async () => {
            await fetchPost();
            nextTick(() => {
                if (editor.value) {
                    initializeQuill();
                }
            });
        });

        return {
            post,
            isLoading,
            errorMessage,
            editor,
            updatePost,
        };
    },
};
</script>

<style scoped>
.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Arial', sans-serif;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
    color: #333;
    margin-bottom: 20px;
    text-align: center;
}

.loading-message,
.error-message {
    color: #ff4d4d;
    text-align: center;
    margin: 10px 0;
}

.post-form {
    display: flex;
    flex-direction: column;
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
}

.form-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 16px;
    transition: border-color 0.3s;
}

.form-input:focus {
    border-color: #007bff;
    outline: none;
}

.quill-editor {
    height: 400px; /* Set a height for the editor */
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 10px;
}

.submit-button {
    padding: 12px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s, transform 0.2s;
}

.submit-button:hover {
    background-color: #0056b3;
    transform: scale(1.05);
}
</style>
