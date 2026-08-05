<template>
  <div class="favorites">
    <h1>My Favorites</h1>
    <div class="empty-state">
      <i class="fas fa-heart"></i>
      <p>No favorites yet</p>
    </div>
  </div>
</template>

<style scoped>
h1 { margin-bottom: 25px; }
.empty-state { text-align: center; padding: 60px 0; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
</style>
