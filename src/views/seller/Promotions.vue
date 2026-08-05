<template>
  <div class="promotions">
    <h1>Promotions</h1>
    <button class="btn-add" @click="showAdd = true">+ Create Promotion</button>
    
    <div v-if="promotions.length === 0" class="empty">No promotions yet</div>
    <div v-else class="promo-grid">
      <div v-for="promo in promotions" :key="promo.id" class="promo-card">
        <h3>{{ promo.name }}</h3>
        <p>{{ promo.description }}</p>
        <div class="promo-value">{{ promo.discount }}% OFF</div>
        <p class="promo-dates">{{ promo.start }} - {{ promo.end }}</p>
      </div>
    </div>
    
    <div v-if="showAdd" class="modal-overlay" @click.self="showAdd = false">
      <div class="modal">
        <h2>Create Promotion</h2>
        <form @submit.prevent="createPromo">
          <div class="form-group">
            <label>Name</label>
            <input v-model="newPromo.name" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newPromo.description"></textarea>
          </div>
          <div class="form-group">
            <label>Discount %</label>
            <input v-model.number="newPromo.discount" type="number" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Start Date</label>
              <input v-model="newPromo.start" type="date" required>
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input v-model="newPromo.end" type="date" required>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAdd = false">Cancel</button>
            <button type="submit" class="btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const promotions = ref([])
const showAdd = ref(false)
const newPromo = ref({ name: '', description: '', discount: 0, start: '', end: '' })

const createPromo = () => {
  promotions.value.push({ ...newPromo.value, id: Date.now() })
  showAdd.value = false
  newPromo.value = { name: '', description: '', discount: 0, start: '', end: '' }
}
</script>

<style scoped>
h1 { margin-bottom: 25px; display: inline-block; }
.btn-add { float: right; padding: 10px 20px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.empty { text-align: center; padding: 40px; color: #999; clear: both; }
.promo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; clear: both; }
.promo-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.promo-value { font-size: 24px; font-weight: 700; color: #fe2c55; margin: 10px 0; }
.promo-dates { color: #999; font-size: 12px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; padding: 30px; border-radius: 12px; width: 500px; }
.modal h2 { margin-bottom: 20px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 600; }
.form-group input, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.modal-actions button { padding: 10px 20px; border-radius: 4px; cursor: pointer; }
.btn-primary { background: #fe2c55; color: #fff; border: none; }
</style>
