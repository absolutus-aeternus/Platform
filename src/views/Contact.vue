const sendMessage = () => { sent.value = true; form.value = { name: '', email: '', subject: '', message: '' }; setTimeout(() => sent.value = false, 3000) }</template>

<script setup>
import { ref } from "vue"
const loading = ref(false)
const form = ref({ name: '', email: '', subject: '', message: '' })
const sent = ref(false)
const openChat = () => { const el = document.querySelector('.chat-widget button, [class*="chat-toggle"]'); if (el) el.click() }
const sendMessage = () => { sent.value = true; form.value = { name: '', email: '', subject: '', message: '' }; setTimeout(() => sent.value = false, 3000) }
</template>

</script>

<style scoped>
.contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
.contact-card { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }
@media (max-width: 768px) {
  .contact-grid { grid-template-columns: 1fr; gap: 12px; }
}
</style>


<script setup>
import { ref } from "vue"
const loading = ref(false)
const form = ref({ name: '', email: '', subject: '', message: '' })
const sent = ref(false)
const openChat = () => { const el = document.querySelector('.chat-widget button, [class*="chat-toggle"]'); if (el) el.click() }
const sendMessage = () => { sent.value = true; form.value = { name: '', email: '', subject: '', message: '' }; setTimeout(() => sent.value = false, 3000) }</template>

<script setup>
import { ref } from "vue"
const loading = ref(false)
const form = ref({ name: '', email: '', subject: '', message: '' })
const sent = ref(false)
const openChat = () => { const el = document.querySelector('.chat-widget button, [class*="chat-toggle"]'); if (el) el.click() }
const sendMessage = () => { sent.value = true; form.value = { name: '', email: '', subject: '', message: '' }; setTimeout(() => sent.value = false, 3000) }
</template>

</script>

<style scoped>
.contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
.contact-card { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }
@media (max-width: 768px) {
  .contact-grid { grid-template-columns: 1fr; gap: 12px; }
}
</style>