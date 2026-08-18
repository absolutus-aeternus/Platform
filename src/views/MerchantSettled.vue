<template>
  <div class="merchant-settled">
    <!-- Hero -->
    <section class="settled-hero">
      <div class="container">
        <h1>Become a Seller on AllianceHub</h1>
        <p>Start your dropshipping business with zero inventory. List products, set your price, and we handle fulfillment.</p>
        <div class="settled-features">
          <div class="sf-item"><i class="fas fa-box-open"></i><h3>No Inventory</h3><p>List thousands of products without stocking anything</p></div>
          <div class="sf-item"><i class="fas fa-tags"></i><h3>Auto Pricing</h3><p>Your seller level determines your cost automatically</p></div>
          <div class="sf-item"><i class="fas fa-shipping-fast"></i><h3>Global Shipping</h3><p>We ship to 112+ countries worldwide</p></div>
          <div class="sf-item"><i class="fas fa-headset"></i><h3>24/7 Support</h3><p>Live chat support for all sellers</p></div>
        </div>
      </div>
    </section>

    <!-- Registration Form -->
    <section class="settled-form-section">
      <div class="container" style="max-width:680px">
        <!-- Progress Steps -->
        <div class="progress-steps">
          <div v-for="(s, i) in steps" :key="i" class="step" :class="{ active: step === i, done: step > i }">
            <div class="step-num">
              <i v-if="step > i" class="fas fa-check"></i>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span class="step-label">{{ s }}</span>
          </div>
        </div>

        <div class="auth-card">
          <!-- STEP 1: Account -->
          <form v-if="step === 0" @submit.prevent="nextStep" class="step-form">
            <div class="card-header">
              <div class="card-icon">👤</div>
              <h2>Create Your Account</h2>
              <p>Enter your credentials to get started</p>
            </div>

            <template v-if="!isLoggedIn">
              <div class="form-group">
                <label>Full Name *</label>
                <div class="input-wrap"><i class="fas fa-user"></i><input v-model="form.fullName" placeholder="John Doe" required></div>
              </div>
              <div class="form-group">
                <label>Email Address *</label>
                <div class="input-wrap"><i class="fas fa-envelope"></i><input v-model="form.email" type="email" placeholder="seller@example.com" required></div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Password *</label>
                  <div class="input-wrap"><i class="fas fa-lock"></i><input v-model="form.password" type="password" placeholder="Min 6 characters" required minlength="6"></div>
                </div>
                <div class="form-group">
                  <label>Confirm Password *</label>
                  <div class="input-wrap"><i class="fas fa-lock"></i><input v-model="form.confirmPassword" type="password" placeholder="Re-enter" required></div>
                </div>
              </div>
              <div class="form-group">
                <label>Phone Number *</label>
                <div class="input-wrap"><i class="fas fa-phone"></i><input v-model="form.phone" type="tel" placeholder="+62 812 3456 7890" required></div>
              </div>
            </template>
            <div v-else class="notice-logged">
              <i class="fas fa-check-circle"></i>
              Logged in as <strong>{{ userStore.supabaseUser?.email }}</strong>
            </div>

            <button type="submit" class="btn-submit">
              Continue <i class="fas fa-arrow-right"></i>
            </button>
          </form>

          <!-- STEP 2: Identity Verification -->
          <form v-if="step === 1" @submit.prevent="nextStep" class="step-form">
            <div class="card-header">
              <div class="card-icon">🪪</div>
              <h2>Identity Verification</h2>
              <p>Upload your government-issued ID to verify your identity</p>
            </div>

            <div class="form-group">
              <label>ID Type *</label>
              <div class="input-wrap">
                <i class="fas fa-id-card"></i>
                <select v-model="form.idType" required>
                  <option value="">Select ID type</option>
                  <option value="ktp">KTP (Indonesia)</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="national_id">National ID Card</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>ID Number *</label>
              <div class="input-wrap"><i class="fas fa-hashtag"></i><input v-model="form.idNumber" placeholder="Enter your ID number" required></div>
            </div>

            <div class="form-group">
              <label>Full Name (as on ID) *</label>
              <div class="input-wrap"><i class="fas fa-user"></i><input v-model="form.idName" placeholder="Exactly as on your ID card" required></div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Date of Birth *</label>
                <div class="input-wrap"><i class="fas fa-calendar"></i><input v-model="form.dob" type="date" required></div>
              </div>
              <div class="form-group">
                <label>Gender *</label>
                <div class="input-wrap">
                  <i class="fas fa-venus-mars"></i>
                  <select v-model="form.gender" required>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Upload ID Front -->
            <div class="form-group">
              <label>ID Card - Front Side *</label>
              <div class="upload-area" :class="{ uploaded: form.idFront }" @click="triggerUpload('idFront')">
                <input type="file" :ref="el => fileRefs.idFront = el" accept="image/*" @change="handleUpload($event, 'idFront')" hidden>
                <div v-if="!form.idFront" class="upload-placeholder">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>Click to upload front of ID</p>
                  <span>JPG, PNG up to 5MB</span>
                </div>
                <div v-else class="upload-preview">
                  <img loading="lazy" :src="form.idFront" alt="ID Front">
                  <button type="button" class="btn-remove" @click.stop="form.idFront = ''"><i class="fas fa-times"></i></button>
                </div>
              </div>
            </div>

            <!-- Upload ID Back -->
            <div class="form-group">
              <label>ID Card - Back Side *</label>
              <div class="upload-area" :class="{ uploaded: form.idBack }" @click="triggerUpload('idBack')">
                <input type="file" :ref="el => fileRefs.idBack = el" accept="image/*" @change="handleUpload($event, 'idBack')" hidden>
                <div v-if="!form.idBack" class="upload-placeholder">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>Click to upload back of ID</p>
                  <span>JPG, PNG up to 5MB</span>
                </div>
                <div v-else class="upload-preview">
                  <img loading="lazy" :src="form.idBack" alt="ID Back">
                  <button type="button" class="btn-remove" @click.stop="form.idBack = ''"><i class="fas fa-times"></i></button>
                </div>
              </div>
            </div>

            <!-- Selfie with ID -->
            <div class="form-group">
              <label>Selfie with ID *</label>
              <div class="upload-area" :class="{ uploaded: form.idSelfie }" @click="triggerUpload('idSelfie')">
                <input type="file" :ref="el => fileRefs.idSelfie = el" accept="image/*" capture="user" @change="handleUpload($event, 'idSelfie')" hidden>
                <div v-if="!form.idSelfie" class="upload-placeholder">
                  <i class="fas fa-camera"></i>
                  <p>Take a selfie holding your ID</p>
                  <span>Make sure both face and ID are clearly visible</span>
                </div>
                <div v-else class="upload-preview">
                  <img loading="lazy" :src="form.idSelfie" alt="Selfie with ID">
                  <button type="button" class="btn-remove" @click.stop="form.idSelfie = ''"><i class="fas fa-times"></i></button>
                </div>
              </div>
            </div>

            <div class="btn-row">
              <button type="button" class="btn-back" @click="step = 0"><i class="fas fa-arrow-left"></i> Back</button>
              <button type="submit" class="btn-submit">Continue <i class="fas fa-arrow-right"></i></button>
            </div>
          </form>

          <!-- STEP 3: Store Details -->
          <form v-if="step === 2" @submit.prevent="handleSubmit" class="step-form">
            <div class="card-header">
              <div class="card-icon">🏪</div>
              <h2>Store Details</h2>
              <p>Set up your store profile</p>
            </div>

            <div class="form-group">
              <label>Store Name *</label>
              <div class="input-wrap"><i class="fas fa-store"></i><input v-model="form.storeName" placeholder="Your store name" required></div>
            </div>

            <div class="form-group">
              <label>Store Description</label>
              <textarea v-model="form.storeDesc" rows="3" placeholder="Describe what products you sell..."></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Business Category *</label>
                <div class="input-wrap">
                  <i class="fas fa-th-large"></i>
                  <select v-model="form.category" required>
                    <option value="">Select category</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.icon }} {{ cat.name }}</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Country *</label>
                <div class="input-wrap"><i class="fas fa-globe"></i><input v-model="form.country" placeholder="Your country" required></div>
              </div>
            </div>

            <div class="form-group">
              <label>Address *</label>
              <textarea v-model="form.address" rows="2" placeholder="Your business address" required></textarea>
            </div>

            <!-- Terms -->
            <div class="form-check">
              <input type="checkbox" v-model="form.agree" id="terms" required>
              <label for="terms">I agree to the <router-link to="/terms">Seller Terms & Conditions</router-link>, <router-link to="/privacy">Privacy Policy</router-link>, and consent to identity verification.</label>
            </div>

            <div class="btn-row">
              <button type="button" class="btn-back" @click="step = 1"><i class="fas fa-arrow-left"></i> Back</button>
              <button type="submit" class="btn-submit btn-submit-green" :disabled="loading || !form.agree">
                <span v-if="loading" class="spinner"></span>
                <i v-else class="fas fa-rocket"></i>
                {{ loading ? 'Submitting...' : 'Submit Registration' }}
              </button>
            </div>
          </form>

          <!-- STEP 4: Success -->
          <div v-if="step === 3" class="step-form success-step">
            <div class="success-icon">✅</div>
            <h2>Registration Submitted!</h2>
            <p>Your seller application and identity documents have been submitted for review.</p>
            <div class="success-info">
              <div class="info-row"><span>Store Name:</span><strong>{{ form.storeName }}</strong></div>
              <div class="info-row"><span>ID Type:</span><strong>{{ form.idType?.toUpperCase() }}</strong></div>
              <div class="info-row"><span>Status:</span><strong class="status-pending">Pending Review</strong></div>
            </div>
            <p class="success-note">Our team will verify your identity within 24-48 hours. You'll receive an email notification once approved.</p>
            <div class="success-actions">
              <router-link to="/seller/login" class="btn-primary"><i class="fas fa-sign-in-alt"></i> Go to Seller Login</router-link>
              <router-link to="/" class="btn-secondary"><i class="fas fa-home"></i> Back to Home</router-link>
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="error-msg"><i class="fas fa-exclamation-triangle"></i> {{ error }}</div>

          <!-- Footer -->
          <div class="card-footer" v-if="step < 3">
            <p>Already have a seller account? <router-link to="/seller/login">Sign In</router-link></p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const error = ref('')
const step = ref(0)
const categories = ref([])
const fileRefs = reactive({})

const steps = ['Account', 'Identity', 'Store', 'Done']

const form = ref({
  fullName: '', email: '', password: '', confirmPassword: '', phone: '',
  idType: '', idNumber: '', idName: '', dob: '', gender: '',
  idFront: '', idBack: '', idSelfie: '',
  storeName: '', storeDesc: '', category: '', country: '', address: '',
  agree: false
})

const isLoggedIn = computed(() => userStore.isLoggedIn)

onMounted(async () => {
  const { data } = await supabase.from('categories').select('id, name, icon').order('sort_order')
  if (data) categories.value = data
  if (userStore.supabaseUser?.email) form.value.email = userStore.supabaseUser.email
})

const nextStep = () => {
  error.value = ''

  if (step.value === 0 && !isLoggedIn.value) {
    if (form.value.password !== form.value.confirmPassword) { error.value = 'Passwords do not match'; return }
    if (form.value.password.length < 6) { error.value = 'Password must be at least 6 characters'; return }
    if (!form.value.fullName || !form.value.email || !form.value.phone) { error.value = 'Please fill all required fields'; return }
  }

  if (step.value === 1) {
    if (!form.value.idType || !form.value.idNumber || !form.value.idName) { error.value = 'Please fill all ID details'; return }
    if (!form.value.idFront || !form.value.idBack) { error.value = 'Please upload both sides of your ID'; return }
  }

  step.value++
}

const triggerUpload = (field) => {
  fileRefs[field]?.click()
}

const handleUpload = (e, field) => {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { error.value = 'File size must be under 5MB'; return }
  if (!file.type.startsWith('image/')) { error.value = 'Only image files are allowed'; return }

  const reader = new FileReader()
  reader.onload = (ev) => { form.value[field] = ev.target.result }
  reader.readAsDataURL(file)
}

const handleSubmit = async () => {
  if (!form.value.agree) { error.value = 'Please agree to the terms'; return }
  if (!form.value.storeName || !form.value.category || !form.value.country) { error.value = 'Please fill all required fields'; return }

  loading.value = true
  error.value = ''

  try {
    let userId = null

    if (isLoggedIn.value) {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id
    } else {
      // Create account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.value.email,
        password: form.value.password,
        options: { data: { username: form.value.fullName } }
      })
      if (authError) throw new Error(authError.message)
      userId = authData.user?.id

      if (authData.session) {
        userStore.token = authData.session.access_token
        userStore.supabaseUser = authData.user
        userStore.isLoggedIn = true
        await userStore.fetchRole()
      }
    }

    if (!userId) throw new Error('Failed to create account')

    // Check if already a seller
    const { data: existing } = await supabase.from('sellers').select('id').eq('user_id', userId).maybeSingle()
    if (existing) { error.value = 'You already have a seller account.'; loading.value = false; return }

    // Upload ID images to Supabase Storage (or store as base64 for now)
    const idDocs = {
      id_type: form.value.idType,
      id_number: form.value.idNumber,
      id_name: form.value.idName,
      dob: form.value.dob,
      gender: form.value.gender,
      id_front: form.value.idFront ? 'uploaded' : null,
      id_back: form.value.idBack ? 'uploaded' : null,
      id_selfie: form.value.idSelfie ? 'uploaded' : null,
    }

    // Create seller profile
    const { error: sellerError } = await supabase.from('sellers').insert({
      user_id: userId,
      name: form.value.storeName,
      store_name: form.value.storeName,
      description: form.value.storeDesc,
      goods_count: 0,
      sales_count: 0,
      is_recommended: false,
      status: 'pending'
    })
    if (sellerError) throw sellerError

    // Update user role via server-side API (not client-side Supabase call)
    const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://alliancehub-api.absolutus-aeternus.workers.dev'
    try {
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      if (token) {
        const roleResp = await fetch(`${WORKER_URL}/api/seller/register`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ sellerId: seller.data?.id })
        })
        const roleData = await roleResp.json()
        if (roleData.success) {
          userStore.role = 'SELLER'
        } else {
          console.error('Role update failed:', roleData.error)
        }
      }
    } catch (_e) { console.error('MerchantSettled role update:', _e) }

    step.value = 3
  } catch (e) {
    error.value = e.message || 'An error occurred'
  }
  loading.value = false
}
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

/* Hero */
.settled-hero {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0a0a1a 100%);
  color: #fff; padding: 70px 0; text-align: center; position: relative; overflow: hidden;
}
.settled-hero::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 20% 50%, rgba(254,44,85,0.12), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(108,92,231,0.08), transparent 50%);
}
.settled-hero h1 { font-size: 34px; font-weight: 900; margin-bottom: 10px; position: relative; }
.settled-hero p { font-size: 16px; opacity: 0.85; max-width: 560px; margin: 0 auto 36px; position: relative; }
.settled-features { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; position: relative; }
.sf-item { background: rgba(255,255,255,0.07); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s; }
.sf-item:hover { background: rgba(255,255,255,0.12); transform: translateY(-2px); }
.sf-item i { font-size: 24px; color: var(--brand-primary, #FF9900); margin-bottom: 10px; display: block; }
.sf-item h3 { font-size: 14px; margin-bottom: 4px; }
.sf-item p { font-size: 12px; opacity: 0.7; }

/* Progress */
.settled-form-section { padding: 50px 0; background: #f5f5f5; }
.progress-steps { display: flex; justify-content: center; gap: 0; margin-bottom: 30px; }
.step { display: flex; align-items: center; gap: 8px; }
.step:not(:last-child)::after { content: ''; width: 40px; height: 2px; background: #ddd; margin: 0 8px; }
.step.done:not(:last-child)::after { background: var(--success, #067D62); }
.step-num {
  width: 32px; height: 32px; border-radius: 50%; background: #ddd; color: #999;
  display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700;
}
.step.active .step-num { background: var(--brand-primary, #FF9900); color: #fff; }
.step.done .step-num { background: var(--success, #067D62); color: #fff; }
.step-label { font-size: 12px; color: #999; font-weight: 600; }
.step.active .step-label { color: var(--brand-primary, #FF9900); }
.step.done .step-label { color: var(--success, #067D62); }

/* Card */
.auth-card { background: #fff; padding: 36px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }
.card-header { text-align: center; margin-bottom: 24px; }
.card-icon { font-size: 36px; margin-bottom: 6px; }
.card-header h2 { font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
.card-header p { color: #888; font-size: 13px; margin: 0; }

/* Notice */
.notice-logged { background: #e8f5e9; padding: 12px 16px; border-radius: 10px; margin-bottom: 20px; font-size: 13px; color: #2e7d32; display: flex; align-items: center; gap: 8px; }

/* Form */
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 600; font-size: 12px; color: #444; text-transform: uppercase; letter-spacing: 0.5px; }
.input-wrap { position: relative; display: flex; align-items: center; }
.input-wrap i { position: absolute; left: 12px; color: #bbb; font-size: 13px; z-index: 1; }
.input-wrap input, .input-wrap select {
  width: 100%; padding: 11px 12px 11px 36px; border: 2px solid #e8e8e8; border-radius: 10px;
  font-size: 14px; box-sizing: border-box; transition: all 0.2s; background: #fafafa; font-family: inherit;
}
.input-wrap input:focus, .input-wrap select:focus { outline: none; border-color: var(--brand-primary, #FF9900); box-shadow: 0 0 0 3px rgba(254,44,85,0.08); background: #fff; }
textarea {
  width: 100%; padding: 11px 12px; border: 2px solid #e8e8e8; border-radius: 10px;
  font-size: 14px; box-sizing: border-box; transition: all 0.2s; background: #fafafa; font-family: inherit; resize: vertical;
}
textarea:focus { outline: none; border-color: var(--brand-primary, #FF9900); box-shadow: 0 0 0 3px rgba(254,44,85,0.08); background: #fff; }

/* Upload */
.upload-area {
  border: 2px dashed #ddd; border-radius: 12px; padding: 24px; text-align: center;
  cursor: pointer; transition: all 0.2s; background: #fafafa;
}
.upload-area:hover { border-color: var(--brand-primary, #FF9900); background: #fff8f0; }
.upload-area.uploaded { border-style: solid; border-color: var(--success, #067D62); background: #f0fff4; }
.upload-placeholder i { font-size: 32px; color: #ccc; margin-bottom: 8px; }
.upload-placeholder p { font-size: 14px; color: #666; margin: 0 0 4px; }
.upload-placeholder span { font-size: 12px; color: #aaa; }
.upload-preview { position: relative; }
.upload-preview img { max-width: 100%; max-height: 180px; border-radius: 8px; }
.btn-remove {
  position: absolute; top: -8px; right: -8px; width: 24px; height: 24px;
  background: #ff4757; color: #fff; border: none; border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 11px;
}

/* Checkbox */
.form-check { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 20px; font-size: 12px; color: #666; }
.form-check input { margin-top: 3px; accent-color: var(--brand-primary, #FF9900); }
.form-check a { color: var(--brand-primary, #FF9900); text-decoration: none; font-weight: 600; }

/* Buttons */
.btn-row { display: flex; gap: 12px; margin-top: 4px; }
.btn-back {
  padding: 12px 20px; background: #f0f0f0; color: #666; border: none; border-radius: 10px;
  font-size: 14px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px; transition: all 0.2s;
}
.btn-back:hover { background: #e0e0e0; }
.btn-submit {
  flex: 1; padding: 12px; background: linear-gradient(135deg, var(--brand-primary, #FF9900), #ff6b81); color: #fff;
  border: none; border-radius: 10px; font-size: 14px; cursor: pointer; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(254,44,85,0.3);
}
.btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(254,44,85,0.4); }
.btn-submit:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-submit-green { background: linear-gradient(135deg, var(--success, #067D62), #20c997); box-shadow: 0 4px 15px rgba(40,167,69,0.3); }
.btn-submit-green:hover { box-shadow: 0 8px 25px rgba(40,167,69,0.4); }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Error */
.error-msg { color: #ff4757; text-align: center; margin-top: 14px; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; background: #fff8f0; border-radius: 8px; }

/* Success */
.success-step { text-align: center; padding: 20px 0; }
.success-icon { font-size: 48px; margin-bottom: 12px; }
.success-step h2 { color: var(--success, #067D62); margin-bottom: 8px; }
.success-step > p { color: #666; font-size: 14px; margin-bottom: 20px; }
.success-info { background: #f8f9fa; border-radius: 10px; padding: 16px; margin-bottom: 16px; text-align: left; }
.info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #eee; }
.info-row:last-child { border-bottom: none; }
.info-row span { color: #888; }
.status-pending { color: #ff9800; }
.success-note { font-size: 13px; color: #888; margin-bottom: 20px; }
.success-actions { display: flex; gap: 12px; justify-content: center; }
.btn-primary { padding: 10px 24px; background: var(--brand-primary, #FF9900); color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
.btn-primary:hover { background: #e6254d; }
.btn-secondary { padding: 10px 24px; background: #f0f0f0; color: #555; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
.btn-secondary:hover { background: #e0e0e0; }

/* Footer */
.card-footer { text-align: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
.card-footer p { margin: 0; font-size: 13px; color: #888; }
.card-footer a { color: var(--brand-primary, #FF9900); text-decoration: none; font-weight: 600; }

/* Responsive */
@media (max-width: 768px) {
  .settled-features { grid-template-columns: 1fr 1fr; }
  .settled-hero { padding: 50px 0; }
  .settled-hero h1 { font-size: 24px; }
  .form-row { grid-template-columns: 1fr; }
  .progress-steps { flex-wrap: wrap; gap: 4px; }
  .step:not(:last-child)::after { width: 20px; }
}
@media (max-width: 480px) {
  .settled-features { grid-template-columns: 1fr; }
  .auth-card { padding: 24px 18px; }
  .step-label { display: none; }
}
</style>
