})</template>

<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const reviews = ref([])
onMounted(async () => {
  try {
    const { data } = await supabase.from('evaluations').select('*, users(email)').order('created_at', { ascending: false }).limit(50)
    if (data) reviews.value = data
  loading.value = false
  } catch (e) { console.error('All reviews error:', e) }
})
</template>

</script>

<style scoped>
.page-wrapper { position: relative; z-index: 1; }
.page-wrapper { padding: 2rem; max-width: 1200px; margin: 0 auto; }
</style>


<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const reviews = ref([])
onMounted(async () => {
  try {
    const { data } = await supabase.from('evaluations').select('*, users(email)').order('created_at', { ascending: false }).limit(50)
    if (data) reviews.value = data
  loading.value = false
  } catch (e) { console.error('All reviews error:', e) }
})</template>

<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const reviews = ref([])
onMounted(async () => {
  try {
    const { data } = await supabase.from('evaluations').select('*, users(email)').order('created_at', { ascending: false }).limit(50)
    if (data) reviews.value = data
  loading.value = false
  } catch (e) { console.error('All reviews error:', e) }
})
</template>

</script>

<style scoped>
.page-wrapper { position: relative; z-index: 1; }
.page-wrapper { padding: 2rem; max-width: 1200px; margin: 0 auto; }
</style>