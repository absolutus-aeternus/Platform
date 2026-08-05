<template>
  <div class="seller-products">
    <h1>My Products</h1>
    <button class="btn-add">+ Add Product</button>
    <div class="empty-state">
      <i class="fas fa-box-open"></i>
      <p>No products yet</p>
    </div>
  </div>
</template>

<style scoped>
h1 { margin-bottom: 25px; display: inline-block; }
.btn-add { float: right; padding: 10px 20px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.empty-state { text-align: center; padding: 60px 0; clear: both; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
</style>
