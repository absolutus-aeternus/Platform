<template>
  <div class="container" style="padding:40px 20px;max-width:600px">
    <h2 style="margin-bottom:24px"><i class="fas fa-user-circle"></i> Choose Avatar</h2>
    <div style="background:white;padding:32px;border-radius:16px;border:1px solid #e2e8f0">
      <div class="avatar-grid">
        <div v-for="n in 10" :key="n" style="width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;cursor:pointer;border:3px solid transparent;transition:all 0.2s" :style="{ background: colors[n-1], borderColor: selected === n ? '#ff6b35' : 'transparent' }" @click="selectAvatar(n)">
          {{ emojis[n-1] }}
        </div>
      </div>
      <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:24px" @click="saveAvatar"><i class="fas fa-check"></i> Save Avatar</button>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const router = useRouter()
const selected = ref(1)
const emojis = ['😊','😎','🤩','😇','🥳','🐶','🐱','🦊','🐼','🦁']
const colors = ['#fef3c7','#dbeafe','#d1fae5','#fce7f3','#ede9fe','#fee2e2','#e0e7ff','#ccfbf1','#f0fdf4','#fdf2f8']
const selectAvatar = (n) => { selected.value = n }
const saveAvatar = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { router.push('/login'); return }
  try { await supabase.from('users').update({ avatar: String(selected.value) }).eq('id', user.id) } catch(_e) { console.error('AvatarSelection.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  router.push('/user/settings')
}
</script>
<style scoped>
.avatar-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
@media (max-width: 768px) { .avatar-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; } }
@media (max-width: 480px) { .avatar-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
</style>
