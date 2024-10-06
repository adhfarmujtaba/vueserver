<template>
  <div class="create-post">
    <h1>Create New Post</h1>
    <form @submit.prevent="submitPost">
      <div>
        <label for="title">Title:</label>
        <input type="text" v-model="title" required />
      </div>
      <div>
        <label>Slug:</label>
        <span>{{ slug }}</span>
      </div>
      <div>
        <label for="content">Content:</label>
        <div id="editor" ref="quillEditor"></div>
      </div>
      <div>
        <label for="category_id">Category:</label>
        <select v-model="category_id" required>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <input type="text" v-model="newCategory" placeholder="Add new category" />
        <button type="button" @click="addCategory">Add Category</button>
      </div>
      <div>
        <label for="tags">Tags:</label>
        <input type="text" v-model="tagsInput" @input="filterTags" />
        <ul v-if="filteredTags.length">
          <li v-for="tag in filteredTags" :key="tag.id" @click="addTag(tag.name)">
            {{ tag.name }}
          </li>
        </ul>
        <input type="text" v-model="newTag" placeholder="Add new tag" />
        <button type="button" @click="createTag">Add Tag</button>
      </div>
      <div class="selected-tags">
        <span v-for="(tag, index) in selectedTags" :key="index" class="tag">
          {{ tag }} <button @click="removeTag(index)">x</button>
        </span>
      </div>
      <div>
        <label for="image">Image:</label>
        <input type="file" @change="onFileChange" />
      </div>
      <div>
        <label for="meta_description">Meta Description:</label>
        <input type="text" v-model="meta_description" />
      </div>
      <div>
        <label for="post_status">Post Status:</label>
        <select v-model="post_status">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
      <button type="submit">Create Post</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import Quill from 'quill';
import Toastify from 'toastify-js'; // Import Toastify
import 'toastify-js/src/toastify.css'; // Import Toastify CSS

export default {
  data() {
    return {
      title: '',
      content: '',
      category_id: null,
      categories: [],
      tagsInput: '',
      filteredTags: [],
      allTags: [],
      selectedTags: [],
      image: null,
      meta_description: '',
      post_status: 'draft',
      message: '',
      newCategory: '',
      newTag: '',
      editor_image_ids: [],
    };
  },
  computed: {
    slug() {
      return this.generateSlug(this.title);
    }
  },
  created() {
    this.fetchCategoriesAndTags();
  },
  mounted() {
    this.initializeQuill();
    this.setupMutationObserver();
  },
  methods: {
    initializeQuill() {
      this.quill = new Quill(this.$refs.quillEditor, {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            ['link', 'image'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean'],
          ],
        },
      });

      this.quill.on('text-change', () => {
        this.content = this.quill.root.innerHTML;
      });

      this.quill.getModule('toolbar').addHandler('image', this.imageHandler.bind(this));
    },

    setupMutationObserver() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
            mutation.removedNodes.forEach(node => {
              if (node.nodeName === 'IMG') {
                const imageSrc = node.getAttribute('src');
                console.log(`Image removed: ${imageSrc}`);
                this.deleteImage(imageSrc);
              }
            });
          }
        });
      });

      observer.observe(this.quill.root, { childList: true, subtree: true });
    },

    imageHandler() {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.onchange = () => {
        const file = input.files[0];
        if (file) {
          this.uploadImage(file);
        }
      };
      input.click();
    },

    uploadImage(file) {
      const formData = new FormData();
      formData.append('file', file);

      fetch('https://blog.tourismofkashmir.com/imageandvideoupload.php', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            const range = this.quill.getSelection();
            const imagePath = `https://blog.tourismofkashmir.com/${data.filePath}`;
            this.quill.insertEmbed(range.index, 'image', imagePath);
            this.quill.setSelection(range.index + 1); // Move cursor after the image
            
            this.editor_image_ids.push(data.id); // Add the ID to the array
           // Correctly reference the ID from the response

            this.showToast('Image uploaded successfully!', 'success');
          } else {
            console.error('Image upload failed:', data.error);
            this.showToast('Image upload failed: ' + data.error, 'error');
          }
        })
        .catch(error => {
          console.error('Error uploading image:', error);
          this.showToast('Error uploading image: ' + error.message, 'error');
        });
    },

    deleteImage(imagePath) {
      fetch('https://blog.tourismofkashmir.com/deleteimageandvideo.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: imagePath }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('Image deleted successfully from server.');
          } else {
            console.error('Error deleting image from server:', data.error);
          }
        })
        .catch(error => console.error('Error deleting image:', error));
    },

    fetchCategoriesAndTags() {
      fetch('https://blog.tourismofkashmir.com/getcategoryandtags.php')
        .then(response => response.json())
        .then(data => {
          this.categories = data.categories || [];
          this.allTags = data.tags || [];
        })
        .catch(error => console.error('Error fetching categories and tags:', error));
    },

    filterTags() {
      const query = this.tagsInput.toLowerCase();
      this.filteredTags = this.allTags.filter(tag =>
        tag.name.toLowerCase().includes(query)
      );
    },

    addTag(tag) {
      if (!this.selectedTags.includes(tag)) {
        this.selectedTags.push(tag);
      }
      this.tagsInput = '';
      this.filteredTags = [];
    },

    createTag() {
      if (this.newTag.trim() === '') {
        this.showToast('Tag name cannot be empty.', 'error');
        return;
      }

      fetch('https://blog.tourismofkashmir.com/tagandcatgroy_create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'tag',
          name: this.newTag,
        }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.allTags.push({ id: Date.now(), name: this.newTag }); // Simulate ID
          this.selectedTags.push(this.newTag);
          this.newTag = '';
          this.showToast(data.message, 'success');
        } else {
          this.showToast(data.message, 'error');
        }
      })
      .catch(error => {
        console.error('Error creating tag:', error);
        this.showToast('Error creating tag: ' + error.message, 'error');
      });
    },

    removeTag(index) {
      this.selectedTags.splice(index, 1);
    },

    addCategory() {
      if (this.newCategory) {
        fetch('https://blog.tourismofkashmir.com/tagandcatgroy_create.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'category',
            name: this.newCategory,
          }),
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            const newCategoryObj = { id: Date.now(), name: this.newCategory }; 
            this.categories.push(newCategoryObj); // Add to categories
            this.category_id = newCategoryObj.id; // Automatically select the new category
            this.newCategory = ''; // Clear the input
            this.showToast(data.message, 'success');
          } else {
            this.showToast(data.message, 'error');
          }
        })
        .catch(error => {
          console.error('Error creating category:', error);
          this.showToast('Error creating category: ' + error.message, 'error');
        });
      }
    },

    onFileChange(event) {
      this.image = event.target.files[0];
    },

    submitPost() {
      const formData = new FormData();
      formData.append('title', this.title);
      formData.append('content', this.content);
      formData.append('category_id', this.category_id);
      formData.append('user_id', 1);
      formData.append('meta_description', this.meta_description);
      formData.append('post_status', this.post_status);
      formData.append('slug', this.slug); // Use live slug here
      if (this.image) {
        formData.append('image', this.image);
      }
      formData.append('tags', this.selectedTags.join(', '));

 // Add the editor image ID if it exists
 // In the submitPost method, adjust how editor_image_id is handled
 if (this.editor_image_ids && this.editor_image_ids.length > 0) {
    console.log("Editor Image IDs:", this.editor_image_ids); // Log the IDs to the console
    this.editor_image_ids.forEach(id => {
        formData.append('editor_image_ids[]', id); // Sending as an array
    });
}


      fetch('https://blog.tourismofkashmir.com/post_create_api.php', {
        method: 'POST',
        body: formData,
      })
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
          }
          return response.json();
        })
        .then(data => {
          if (data.status === 'success') {
            this.showToast('Post created successfully!', 'success');
            this.resetForm();
          } else {
            this.showToast(data.message || 'Failed to create post.', 'error');
          }
        })
        .catch(error => {
          this.showToast('An error occurred during post creation: ' + error.message, 'error');
        });
    },

    generateSlug(title) {
      return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    },

    resetForm() {
      this.title = '';
      this.content = '';
      this.category_id = null;
      this.tagsInput = '';
      this.selectedTags = [];
      this.image = null;
      this.meta_description = '';
      this.post_status = 'draft';
      this.message = '';
      this.filteredTags = [];
      this.newCategory = '';
      this.newTag = '';
    },

    showToast(message, type) {
      Toastify({
        text: message,
        duration: 3000,
        gravity: 'top', // 'top' or 'bottom'
        position: 'right', // 'left', 'center' or 'right'
        backgroundColor: type === 'success' ? '#28a745' : '#dc3545', // Green for success, red for error
      }).showToast();
    },
  },
};
</script>

<style scoped>
.create-post {
  max-width: 600px;
  margin: 20px auto;
  padding: 30px;
  background: #f7f9fc; /* Light background */
  border-radius: 15px; /* Softer corners */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
  font-family: 'Roboto', sans-serif; /* More modern font */
  margin-bottom: 20px; /* Space below heading */
}

label {
  display: block;
  margin: 15px 0 5px;
  font-weight: bold;
  color: #555;
  font-size: 14px; /* Slightly smaller text */
}

input[type="text"],
input[type="file"],
select {
  width: 100%;
  padding: 12px;
  margin-bottom: 20px; /* Increased space between inputs */
  border: 1px solid #ddd;
  border-radius: 8px; /* Softer corners */
  box-sizing: border-box;
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s; /* Smooth transition */
}

input[type="text"]:focus,
select:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* Shadow on focus */
  outline: none;
}

button {
  width: 100%;
  padding: 12px;
  background: #007bff;
  border: none;
  border-radius: 8px; /* Softer corners */
  color: white;
  font-size: 18px; /* Slightly larger text */
  cursor: pointer;
  transition: background 0.3s, transform 0.2s; /* Scale effect on hover */
}

button:hover {
  background: #0056b3;
  transform: translateY(-2px); /* Lift effect */
}

.selected-tags {
  margin: 20px 0; /* Increased space */
}

.tag {
  display: inline-block;
  background: #28a745;
  color: white;
  border-radius: 20px; /* Rounded tags */
  padding: 8px 12px;
  margin-right: 8px;
  font-size: 14px;
}

.tag button {
  background: transparent;
  color: white;
  border: none;
  margin-left: 5px;
  cursor: pointer;
  font-weight: bold; /* Emphasize the button */
}

.tag button:hover {
  color: #ffdddd;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 12px; /* Increased padding */
  background: #ffffff;
  border: 1px solid #e2e6ea;
  border-radius: 8px;
  margin-top: 10px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s; /* Scale effect */
}

li:hover {
  background: #e2e6ea;
  transform: translateY(-1px); /* Lift effect */
}

p {
  text-align: center;
  color: #dc3545;
  margin-top: 20px;
  font-size: 16px;
}
.quill-editor {
    height: 400px; /* Set a height for the editor */
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 10px;
    overflow-y: auto;
}

</style>
