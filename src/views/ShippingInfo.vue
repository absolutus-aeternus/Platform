]</template>

<script setup>
import { ref } from 'vue'
const openFaq = ref(-1)
const carriers = [
  { name: 'FedEx', icon: 'fas fa-box', color: '#4D148C' },
  { name: 'UPS', icon: 'fas fa-box', color: '#351C15' },
  { name: 'DHL', icon: 'fas fa-box', color: '#FFCC00' },
  { name: 'USPS', icon: 'fas fa-box', color: '#333366' },
  { name: 'J&T Express', icon: 'fas fa-box', color: '#E60012' },
  { name: 'JNE', icon: 'fas fa-box', color: '#CC0000' },
]
const faqs = [
  { q: 'Do you ship internationally?', a: 'Yes, we ship to 50+ countries worldwide. Shipping rates and delivery times vary by destination.' },
  { q: 'How can I track my order?', a: 'Once your order is shipped, you will receive a tracking number. Use our Track Order page to check the status.' },
  { q: 'What if my package is lost?', a: 'Contact our customer service within 30 days of the expected delivery date. We will investigate and provide a full refund if confirmed lost.' },
  { q: 'Can I change my shipping address after ordering?', a: 'You can change the address within 1 hour of placing the order. After that, please contact customer service.' },
]
</template>

</script>

<style scoped>
body, html { overflow-x: hidden; }
.container { max-width: 1000px; margin: 0 auto; padding: 2rem 1rem; }
h1 { font-size: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
h1 i { color: var(--brand-primary); }
h2 { font-size: 1.125rem; margin: 2rem 0 1rem; }
.info-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
.info-card { background: #fff; padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); text-align: center; }
.info-card i { font-size: 2rem; margin-bottom: 0.75rem; }
.info-card h3 { font-size: 0.9375rem; margin-bottom: 0.5rem; }
.info-card p { font-size: 0.8125rem; color: var(--text-secondary); margin: 0; }
.rates-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); }
.rates-table th, .rates-table td { padding: 0.875rem 1rem; text-align: left; border-bottom: 1px solid var(--border-light); font-size: 0.8125rem; }
.rates-table th { background: #f8f9fa; font-weight: 600; color: var(--text-secondary); }
.carriers-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; }
.carrier-card { background: #fff; padding: 1.25rem; border-radius: var(--radius-md); box-shadow: var(--shadow-xs); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.carrier-card i { font-size: 1.5rem; }
.carrier-card span { font-size: 0.75rem; font-weight: 600; }
.faq-item { background: #fff; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-xs); margin-bottom: 0.5rem; cursor: pointer; }
.faq-q { display: flex; justify-content: space-between; padding: 1rem 1.25rem; font-weight: 600; font-size: 0.875rem; }
.faq-q i { color: var(--text-muted); font-size: 0.75rem; }
.faq-a { padding: 0 1.25rem 1rem; font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.6; }
@media (max-width: 768px) { .info-cards { grid-template-columns: 1fr; } .carriers-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 480px) { .carriers-grid { grid-template-columns: repeat(2, 1fr); } }
</style>


<script setup>
import { ref } from 'vue'
const openFaq = ref(-1)
const carriers = [
  { name: 'FedEx', icon: 'fas fa-box', color: '#4D148C' },
  { name: 'UPS', icon: 'fas fa-box', color: '#351C15' },
  { name: 'DHL', icon: 'fas fa-box', color: '#FFCC00' },
  { name: 'USPS', icon: 'fas fa-box', color: '#333366' },
  { name: 'J&T Express', icon: 'fas fa-box', color: '#E60012' },
  { name: 'JNE', icon: 'fas fa-box', color: '#CC0000' },
]
const faqs = [
  { q: 'Do you ship internationally?', a: 'Yes, we ship to 50+ countries worldwide. Shipping rates and delivery times vary by destination.' },
  { q: 'How can I track my order?', a: 'Once your order is shipped, you will receive a tracking number. Use our Track Order page to check the status.' },
  { q: 'What if my package is lost?', a: 'Contact our customer service within 30 days of the expected delivery date. We will investigate and provide a full refund if confirmed lost.' },
  { q: 'Can I change my shipping address after ordering?', a: 'You can change the address within 1 hour of placing the order. After that, please contact customer service.' },
]</template>

<script setup>
import { ref } from 'vue'
const openFaq = ref(-1)
const carriers = [
  { name: 'FedEx', icon: 'fas fa-box', color: '#4D148C' },
  { name: 'UPS', icon: 'fas fa-box', color: '#351C15' },
  { name: 'DHL', icon: 'fas fa-box', color: '#FFCC00' },
  { name: 'USPS', icon: 'fas fa-box', color: '#333366' },
  { name: 'J&T Express', icon: 'fas fa-box', color: '#E60012' },
  { name: 'JNE', icon: 'fas fa-box', color: '#CC0000' },
]
const faqs = [
  { q: 'Do you ship internationally?', a: 'Yes, we ship to 50+ countries worldwide. Shipping rates and delivery times vary by destination.' },
  { q: 'How can I track my order?', a: 'Once your order is shipped, you will receive a tracking number. Use our Track Order page to check the status.' },
  { q: 'What if my package is lost?', a: 'Contact our customer service within 30 days of the expected delivery date. We will investigate and provide a full refund if confirmed lost.' },
  { q: 'Can I change my shipping address after ordering?', a: 'You can change the address within 1 hour of placing the order. After that, please contact customer service.' },
]
</template>

</script>

<style scoped>
body, html { overflow-x: hidden; }
.container { max-width: 1000px; margin: 0 auto; padding: 2rem 1rem; }
h1 { font-size: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
h1 i { color: var(--brand-primary); }
h2 { font-size: 1.125rem; margin: 2rem 0 1rem; }
.info-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
.info-card { background: #fff; padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); text-align: center; }
.info-card i { font-size: 2rem; margin-bottom: 0.75rem; }
.info-card h3 { font-size: 0.9375rem; margin-bottom: 0.5rem; }
.info-card p { font-size: 0.8125rem; color: var(--text-secondary); margin: 0; }
.rates-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); }
.rates-table th, .rates-table td { padding: 0.875rem 1rem; text-align: left; border-bottom: 1px solid var(--border-light); font-size: 0.8125rem; }
.rates-table th { background: #f8f9fa; font-weight: 600; color: var(--text-secondary); }
.carriers-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; }
.carrier-card { background: #fff; padding: 1.25rem; border-radius: var(--radius-md); box-shadow: var(--shadow-xs); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.carrier-card i { font-size: 1.5rem; }
.carrier-card span { font-size: 0.75rem; font-weight: 600; }
.faq-item { background: #fff; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-xs); margin-bottom: 0.5rem; cursor: pointer; }
.faq-q { display: flex; justify-content: space-between; padding: 1rem 1.25rem; font-weight: 600; font-size: 0.875rem; }
.faq-q i { color: var(--text-muted); font-size: 0.75rem; }
.faq-a { padding: 0 1.25rem 1rem; font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.6; }
@media (max-width: 768px) { .info-cards { grid-template-columns: 1fr; } .carriers-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 480px) { .carriers-grid { grid-template-columns: repeat(2, 1fr); } }
</style>