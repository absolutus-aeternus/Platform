const loading = ref(false)</template>

<script setup>
import { ref } from 'vue'

const loans = ref([])
const loading = ref(false)
</template>

</script>

<style scoped>
body, html { overflow-x: hidden; }
header { z-index: 2; }
h1 { margin-bottom: 25px; }
.loading { text-align: center; padding: 40px; color: #999; }
.empty-state { text-align: center; padding: 60px 0; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
.btn-primary { background: var(--brand-primary, #FF9900); color: #fff; padding: 10px 25px; border-radius: 25px; text-decoration: none; display: inline-block; margin-top: 15px; }
.loan-card { background: #fff; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
.loan-header { display: flex; justify-content: space-between; padding: 15px 20px; background: #f8f8f8; }
.status { padding: 4px 12px; border-radius: 12px; font-size: 12px; }
.status.pending { background: #fff3cd; color: #856404; }
.status.approved { background: #d4edda; color: #155724; }
.loan-info { padding: 15px 20px; }
.loan-info p { margin-bottom: 5px; }
</style>


<script setup>
import { ref } from 'vue'

const loans = ref([])
const loading = ref(false)</template>

<script setup>
import { ref } from 'vue'

const loans = ref([])
const loading = ref(false)
</template>

</script>

<style scoped>
body, html { overflow-x: hidden; }
header { z-index: 2; }
h1 { margin-bottom: 25px; }
.loading { text-align: center; padding: 40px; color: #999; }
.empty-state { text-align: center; padding: 60px 0; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
.btn-primary { background: var(--brand-primary, #FF9900); color: #fff; padding: 10px 25px; border-radius: 25px; text-decoration: none; display: inline-block; margin-top: 15px; }
.loan-card { background: #fff; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
.loan-header { display: flex; justify-content: space-between; padding: 15px 20px; background: #f8f8f8; }
.status { padding: 4px 12px; border-radius: 12px; font-size: 12px; }
.status.pending { background: #fff3cd; color: #856404; }
.status.approved { background: #d4edda; color: #155724; }
.loan-info { padding: 15px 20px; }
.loan-info p { margin-bottom: 5px; }
</style>