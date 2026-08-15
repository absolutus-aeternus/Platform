<template>
  <div class="not-found-page">
    <div class="container">
      <div class="nf-content">
        <div class="nf-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div class="nf-actions">
          <router-link to="/" class="btn-primary"><i class="fas fa-home"></i> Back to Home</router-link>
          <button @click="$router.back()" class="btn-secondary"><i class="fas fa-arrow-left"></i> Go Back</button>
        </div>
        <div class="nf-suggestions">
          <h3>Popular Pages</h3>
          <div class="nf-links">
            <router-link to="/commodity">All Products</router-link>
            <router-link to="/discounts">Flash Sale</router-link>
            <router-link to="/search-store">Stores</router-link>
            <router-link to="/help">Help Center</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page { min-height: 60vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
.nf-content { text-align: center; max-width: 500px; }
.nf-code { font-size: 8rem; font-weight: 900; color: var(--border); line-height: 1; margin-bottom: 0.5rem; }
.nf-content h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary); }
.nf-content p { color: var(--text-secondary); margin-bottom: 1.5rem; }
.nf-actions { display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem; }
.nf-suggestions { padding-top: 1.5rem; border-top: 1px solid var(--border-light); }
.nf-suggestions h3 { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.75rem; }
.nf-links { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.nf-links a { color: var(--text-link); font-size: 0.875rem; }
.nf-links a:hover { color: var(--text-link-hover); text-decoration: underline; }
</style>
