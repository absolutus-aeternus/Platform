<template>
  <div class="user-layout">
    <header class="header">
      <div class="container">
        <router-link to="/" class="logo">TikTok Shop</router-link>
        <nav>
          <router-link to="/user">Dashboard</router-link>
          <router-link to="/user/orders">Orders</router-link>
          <router-link to="/user/wallet">Wallet</router-link>
          <router-link to="/user/favorites">Favorites</router-link>
          <router-link to="/user/settings">Settings</router-link>
        </nav>
      </div>
    </header>
    <div class="container main">
      <aside class="sidebar">
        <router-link to="/user" class="menu-item"><i class="fas fa-tachometer-alt"></i> Dashboard</router-link>
        <router-link to="/user/orders" class="menu-item"><i class="fas fa-box"></i> My Orders</router-link>
        <router-link to="/user/wallet" class="menu-item"><i class="fas fa-wallet"></i> My Wallet</router-link>
        <router-link to="/user/favorites" class="menu-item"><i class="fas fa-heart"></i> Favorites</router-link>
        <router-link to="/user/addresses" class="menu-item"><i class="fas fa-map-marker-alt"></i> Addresses</router-link>
        <router-link to="/user/notifications" class="menu-item"><i class="fas fa-bell"></i> Notifications</router-link>
        <router-link to="/user/settings" class="menu-item"><i class="fas fa-cog"></i> Settings</router-link>
      </aside>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.header { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 15px 0; }
.header .container { display: flex; align-items: center; gap: 30px; }
.logo { font-size: 20px; font-weight: 800; color: #fe2c55; text-decoration: none; }
nav { display: flex; gap: 20px; }
nav a { color: #666; text-decoration: none; }
nav a:hover { color: #fe2c55; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }
.main { display: grid; grid-template-columns: 200px 1fr; gap: 30px; padding: 20px 0; }
.sidebar { display: flex; flex-direction: column; gap: 5px; }
.menu-item { padding: 12px 15px; color: #333; text-decoration: none; border-radius: 8px; }
.menu-item:hover, .menu-item.router-link-active { background: #fe2c55; color: #fff; }
.menu-item i { margin-right: 10px; width: 20px; }
.content { min-height: 60vh; }
</style>
