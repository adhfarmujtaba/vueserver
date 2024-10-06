<template>
    <div class="custom-editor">
        <div class="toolbar">
            <button @click="formatText('bold')">Bold</button>
            <button @click="formatText('italic')">Italic</button>
            <button @click="formatText('underline')">Underline</button>
            <button @click="formatText('insertOrderedList')">Ordered List</button>
            <button @click="formatText('insertUnorderedList')">Unordered List</button>
            <select @change="changeHeading" v-model="currentHeading">
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="normal">Normal</option>
            </select>
            <input type="color" @input="changeColor" />
            <button @click="uploadImage">Insert Image</button>
            <button @click="uploadVideo">Insert Video</button>
        </div>
        <div
            class="editor"
            contenteditable="true"
            @input="updateContent"
            @keydown="handleKeyDown"
            ref="editor"
        ></div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            content: '',
            currentHeading: 'normal',
            images: [], // Track uploaded images
        };
    },
    methods: {
        formatText(command) {
            document.execCommand(command, false, null);
            this.$refs.editor.focus();
        },
        updateContent() {
            this.content = this.$refs.editor.innerHTML;
            this.$emit('input', this.content);
        },
        changeHeading() {
            const headingTag = this.currentHeading === 'normal' ? 'div' : this.currentHeading;
            document.execCommand('formatBlock', false, headingTag);
            this.$refs.editor.focus();
        },
        changeColor(event) {
            const color = event.target.value;
            document.execCommand('foreColor', false, color);
            this.$refs.editor.focus();
        },
        async uploadImage() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = async (event) => {
                const file = event.target.files[0];
                if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('type', 'image');

                    try {
                        const response = await fetch('https://blog.tourismofkashmir.com/imageandvideoupload.php', {
                            method: 'POST',
                            body: formData,
                        });
                        const result = await response.json();
                        if (result.success) {
                            this.insertImage(result.filePath, result.id); // Pass image ID
                            this.images.push({ path: result.filePath, id: result.id }); // Store both path and ID
                            console.log('Uploaded image ID:', result.id); // Print image ID to console
                        } else {
                            alert('Image upload failed: ' + result.error);
                        }
                    } catch (error) {
                        console.error('Error uploading image:', error);
                    }
                }
            };
            fileInput.click();
        },
        insertImage(filePath, imageId) {
            const fullPath = `https://blog.tourismofkashmir.com/${filePath.replace(/ /g, '%20')}`;
            const imgTag = `<img src="${fullPath}" alt="Uploaded Image" style="max-width: 100%; height: auto;" data-path="${filePath}" data-id="${imageId}" />`;

            console.log('Inserting image with path:', filePath);
            this.$refs.editor.innerHTML += imgTag;
            this.updateContent();
            this.setCaretAfterLastChild();
        },
        handleKeyDown(event) {
            console.log('Key pressed:', event.key);
            const selection = window.getSelection();
            console.log('Current selection:', selection);
            
            if (event.key === 'Backspace') {
                const range = selection.getRangeAt(0);
                const container = range.startContainer;

                console.log('Range start container:', container);
                console.log('Container type:', container.nodeType);

                let img;
                if (container.nodeType === Node.TEXT_NODE) {
                    img = container.parentNode.querySelector('img');
                } else if (container.nodeType === Node.ELEMENT_NODE) {
                    img = container.tagName === 'IMG' ? container : container.querySelector('img');
                }

                if (img) {
                    const imagePath = img.getAttribute('data-path');
                    const imageId = img.getAttribute('data-id'); // Get image ID
                    console.log('Deleting image:', imagePath);

                    this.deleteImageFromBackend(imagePath, imageId);
                    img.remove();
                    this.updateContent();
                } else {
                    console.log('No image found for deletion.');
                }
            }
        },
        deleteImageFromBackend(imagePath, imageId) {
            console.log('Requesting deletion for:', imagePath);
            fetch('https://blog.tourismofkashmir.com/deleteimageandvideo.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path: imagePath, id: imageId }) // Include ID if needed
            })
            .then(response => response.json())
            .then(result => {
                console.log('Deletion response:', result);
                if (!result.success) {
                    console.error('Error deleting image:', result.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        },
        async uploadVideo() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'video/*';
            fileInput.onchange = async (event) => {
                const file = event.target.files[0];
                if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('type', 'video');

                    try {
                        const response = await fetch('https://blog.tourismofkashmir.com/imageandvideoupload.php', {
                            method: 'POST',
                            body: formData,
                        });
                        const result = await response.json();
                        if (result.success) {
                            this.insertVideo(result.filePath);
                        } else {
                            alert('Video upload failed: ' + result.error);
                        }
                    } catch (error) {
                        console.error('Error uploading video:', error);
                    }
                }
            };
            fileInput.click();
        },
        insertVideo(filePath) {
            const fullPath = `https://blog.tourismofkashmir.com/${filePath}`;
            const videoTag = `<video width="320" height="240" controls>
                                <source src="${fullPath}" type="video/mp4">
                                Your browser does not support the video tag.
                              </video>`;
            document.execCommand('insertHTML', false, videoTag);
            this.$refs.editor.focus();
            this.setCaretAfterLastChild();
        },
        setCaretAfterLastChild() {
            const range = document.createRange();
            const selection = window.getSelection();
            const lastChild = this.$refs.editor.lastChild;

            if (lastChild) {
                range.setStartAfter(lastChild);
            } else {
                range.setStart(this.$refs.editor, this.$refs.editor.childNodes.length);
            }

            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    },
    mounted() {
        this.$refs.editor.innerHTML = this.content;
    },
};
</script>

<style scoped>
.custom-editor {
    border: 1px solid #ccc;
    padding: 10px;
}
.editor {
    min-height: 200px;
    border: 1px solid #ccc;
    padding: 10px;
}
.toolbar {
    margin-bottom: 10px;
}
</style>
