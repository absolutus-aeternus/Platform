}</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const amount = ref(0)
const purpose = ref('')
const period = ref('6')
const income = ref(0)

const submitApplication = () => {
  window.__toast?.show('Credit application submitted! We will review your application within 24 hours.')
  router.push('/credit/myLoan')
}
</template>

</script>

<style scoped>
h1 { margin-bottom: 25px; }
.application-form { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); max-width: 500px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.btn-submit { padding: 12px 30px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 4px; cursor: pointer; width: 100%; }
.btn-submit:disabled { background: #ccc; }
</style>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const amount = ref(0)
const purpose = ref('')
const period = ref('6')
const income = ref(0)

const submitApplication = () => {
  window.__toast?.show('Credit application submitted! We will review your application within 24 hours.')
  router.push('/credit/myLoan')
}</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const amount = ref(0)
const purpose = ref('')
const period = ref('6')
const income = ref(0)

const submitApplication = () => {
  window.__toast?.show('Credit application submitted! We will review your application within 24 hours.')
  router.push('/credit/myLoan')
}
</template>

</script>

<style scoped>
h1 { margin-bottom: 25px; }
.application-form { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); max-width: 500px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.btn-submit { padding: 12px 30px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 4px; cursor: pointer; width: 100%; }
.btn-submit:disabled { background: #ccc; }
</style>