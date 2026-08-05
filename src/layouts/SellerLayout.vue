<template>
  <div class="seller-layout">
    <header class="header">
      <div class="container">
        <router-link to="/" class="logo">TikTok Shop - Seller</router-link>
        <nav>
          <router-link to="/seller">Dashboard</router-link>
          <router-link to="/seller/products">Products</router-link>
          <router-link to="/seller/orders">Orders</router-link>
          <router-link to="/seller/analytics">Analytics</router-link>
        </nav>
      </div>
    </header>
    <div class="container main">
      <aside class="sidebar">
        <router-link to="/seller" class="menu-item"><i class="fas fa-tachometer-alt"></i> Dashboard</router-link>
        <router-link to="/seller/products" class="menu-item"><i class="fas fa-box"></i> Products</router-link>
        <router-link to="/seller/orders" class="menu-item"><i class="fas fa-clipboard-list"></i> Orders</router-link>
        <router-link to="/seller/analytics" class="menu-item"><i class="fas fa-chart-bar"></i> Analytics</router-link>
      </aside>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.header { background: #333; padding: 15px 0; }
.header .container { display: flex; align-items: center; gap: 30px; }
.logo { font-size: 18px; font-weight: 800; color: #fe2c55; text-decoration: none; }
nav { display: flex; gap: 20px; }
nav a { color: #ccc; text-decoration: none; }
nav a:hover { color: #fff; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }
.main { display: grid; grid-template-columns: 200px 1fr; gap: 30px; padding: 20px 0; }
.sidebar { display: flex; flex-direction: column; gap: 5px; }
.menu-item { padding: 12px 15px; color: #333; text-decoration: none; border-radius: 8px; }
.menu-item:hover, .menu-item.router-link-active { background: #fe2c55; color: #fff; }
.menu-item i { margin-right: 10px; width: 20px; }
.content { min-height: 60vh; }
</style>
