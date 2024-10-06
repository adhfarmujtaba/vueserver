<template>
  <div class="skeleton-loader">
    <div class="header">
      <div class="avatar skeleton"></div>
      <div class="user-info">
        <div class="skeleton name"></div>
        <div class="skeleton username"></div>
        <div class="skeleton stats"></div>
        <div class="skeleton follow-button"></div>
      </div>
    </div>
    <div class="user-posts">
      <h3>User Posts</h3>
      <div class="skeleton posts-grid">
        <div class="skeleton post" v-for="n in 3" :key="n"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-loader {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.avatar.skeleton {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #e0e0e0;
  margin-right: 20px;
}

.user-info {
  flex: 1;
}

.skeleton {
  background-color: #e0e0e0;
  border-radius: 4px;
}

.skeleton.name {
  width: 60%;
  height: 24px;
  margin-bottom: 8px;
}

.skeleton.username {
  width: 30%;
  height: 16px;
  margin-bottom: 10px;
}

.skeleton.stats {
  width: 100%;
  height: 20px;
  margin-bottom: 10px;
}

.skeleton.follow-button {
  width: 100px;
  height: 36px;
}

.user-posts {
  margin-top: 20px;
}

.skeleton.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.skeleton.post {
  height: 180px;
  background-color: #f0f0f0;
  border-radius: 10px;
}
</style>
