<template><div class="page-wrapper">
  <div class="payment-methods-page">
    <div class="container">
      <h1><i class="fas fa-credit-card"></i> Payment Methods</h1>
      <p class="subtitle">We accept multiple cryptocurrency payment methods for secure, fast transactions.</p>

      <div class="methods-grid">
        <div class="method-card" v-for="method in methods" :key="method.id">
          <div class="method-icon" :style="{ background: method.color }"><i :class="method.icon"></i></div>
          <div class="method-info">
            <h3>{{ method.name }}</h3>
            <span class="method-type">{{ method.type }}</span>
            <p>{{ method.desc }}</p>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h2><i class="fas fa-shield-alt"></i> Payment Security</h2>
        <div class="security-grid">
          <div class="security-card">
            <i class="fas fa-lock"></i>
            <h4>Encrypted Transactions</h4>
            <p>All payment data is encrypted with 256-bit SSL encryption.</p>
          </div>
          <div class="security-card">
            <i class="fas fa-user-shield"></i>
            <h4>Buyer Protection</h4>
            <p>Full refund if your order doesn't arrive or match the description.</p>
          </div>
          <div class="security-card">
            <i class="fas fa-bolt"></i>
            <h4>Instant Processing</h4>
            <p>Crypto payments are confirmed within minutes, 24/7.</p>
          </div>
        </div>
      </div>

      <div class="how-section">
        <h2><i class="fas fa-info-circle"></i> How to Pay</h2>
        <div class="how-steps">
          <div class="how-step"><span class="how-num">1</span><p>Choose your products and proceed to checkout</p></div>
          <div class="how-step"><span class="how-num">2</span><p>Select your preferred crypto payment method</p></div>
          <div class="how-step"><span class="how-num">3</span><p>Complete the payment through the provider's interface</p></div>
          <div class="how-step"><span class="how-num">4</span><p>Receive instant confirmation and order tracking</p></div>
        </div>
      </div>
    </div>
  </div>
  </div>

<script setup>
const methods = [
  { id: 'binance', name: 'Binance Pay', icon: 'fab fa-bitcoin', color: '#F0B90B', type: 'Crypto', desc: 'Pay with Binance account. Supports 300+ cryptocurrencies with zero fees.' },
  { id: 'okx', name: 'OKX', icon: 'fas fa-exchange-alt', color: '#00C4B3', type: 'Crypto', desc: 'Fast and secure payments through OKX exchange wallet.' },
  { id: 'coinbase', name: 'Coinbase', icon: 'fas fa-coins', color: '#0052FF', type: 'Crypto', desc: 'Pay with Coinbase account. Easy setup for beginners.' },
  { id: 'metamask', name: 'MetaMask', icon: 'fab fa-ethereum', color: '#F6851B', type: 'Wallet', desc: 'Connect your MetaMask wallet directly for on-chain payments.' },
  { id: 'kucoin', name: 'KuCoin', icon: 'fas fa-chart-line', color: '#23AFDA', type: 'Crypto', desc: 'Pay through KuCoin exchange with multiple crypto options.' },
  { id: 'kraken', name: 'Kraken', icon: 'fas fa-water', color: '#7B61FF', type: 'Crypto', desc: 'Secure payments via Kraken exchange platform.' },
  { id: 'bitfinex', name: 'Bitfinex', icon: 'fas fa-link', color: '#16B979', type: 'Crypto', desc: 'Professional-grade payment through Bitfinex.' },
  { id: 'huobi', name: 'Huobi', icon: 'fas fa-fire', color: '#1B6BF0', type: 'Crypto', desc: 'Pay with Huobi global exchange account.' },
]</template>

<script setup>
const methods = [
  { id: 'binance', name: 'Binance Pay', icon: 'fab fa-bitcoin', color: '#F0B90B', type: 'Crypto', desc: 'Pay with Binance account. Supports 300+ cryptocurrencies with zero fees.' },
  { id: 'okx', name: 'OKX', icon: 'fas fa-exchange-alt', color: '#00C4B3', type: 'Crypto', desc: 'Fast and secure payments through OKX exchange wallet.' },
  { id: 'coinbase', name: 'Coinbase', icon: 'fas fa-coins', color: '#0052FF', type: 'Crypto', desc: 'Pay with Coinbase account. Easy setup for beginners.' },
  { id: 'metamask', name: 'MetaMask', icon: 'fab fa-ethereum', color: '#F6851B', type: 'Wallet', desc: 'Connect your MetaMask wallet directly for on-chain payments.' },
  { id: 'kucoin', name: 'KuCoin', icon: 'fas fa-chart-line', color: '#23AFDA', type: 'Crypto', desc: 'Pay through KuCoin exchange with multiple crypto options.' },
  { id: 'kraken', name: 'Kraken', icon: 'fas fa-water', color: '#7B61FF', type: 'Crypto', desc: 'Secure payments via Kraken exchange platform.' },
  { id: 'bitfinex', name: 'Bitfinex', icon: 'fas fa-link', color: '#16B979', type: 'Crypto', desc: 'Professional-grade payment through Bitfinex.' },
  { id: 'huobi', name: 'Huobi', icon: 'fas fa-fire', color: '#1B6BF0', type: 'Crypto', desc: 'Pay with Huobi global exchange account.' },
]
</template>

</script>

<style scoped>
.container { max-width: 1000px; margin: 0 auto; padding: 2rem 1rem; }
h1 { font-size: 1.5rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
h1 i { color: var(--brand-primary); }
.subtitle { color: var(--text-secondary); margin-bottom: 2rem; }
h2 { font-size: 1.125rem; margin: 2rem 0 1rem; display: flex; align-items: center; gap: 0.5rem; }
h2 i { color: var(--brand-primary); }
.methods-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.method-card { display: flex; gap: 1rem; padding: 1.25rem; background: #fff; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); transition: all 0.2s; }
.method-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.method-icon { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.25rem; flex-shrink: 0; }
.method-info h3 { font-size: 0.9375rem; margin-bottom: 0.125rem; }
.method-type { font-size: 0.6875rem; color: var(--brand-primary); font-weight: 600; text-transform: uppercase; }
.method-info p { font-size: 0.8125rem; color: var(--text-secondary); margin: 0.375rem 0 0; line-height: 1.5; }
.security-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.security-card { background: #fff; padding: 1.25rem; border-radius: var(--radius-md); box-shadow: var(--shadow-xs); text-align: center; }
.security-card i { font-size: 1.75rem; color: var(--brand-primary); margin-bottom: 0.75rem; }
.security-card h4 { font-size: 0.875rem; margin-bottom: 0.375rem; }
.security-card p { font-size: 0.8125rem; color: var(--text-secondary); margin: 0; }
.how-steps { display: flex; gap: 1.5rem; }
.how-step { flex: 1; display: flex; align-items: flex-start; gap: 0.75rem; }
.how-num { width: 28px; height: 28px; background: var(--brand-primary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; flex-shrink: 0; }
.how-step p { font-size: 0.8125rem; color: var(--text-secondary); margin: 0; }
@media (max-width: 768px) { .methods-grid { grid-template-columns: 1fr; } .security-grid { grid-template-columns: 1fr; } .how-steps { flex-direction: column; } }
</style>
