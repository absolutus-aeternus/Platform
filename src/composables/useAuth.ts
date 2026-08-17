import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

export function useAuth() {
  const user = ref<any>(null)
  const session = ref<any>(null)
  const loading = ref(true)
  const error = ref<any>(null)

  const isAuthenticated = computed(() => !!user.value)

  onMounted(async () => {
    await getSession()
    supabase.auth.onAuthStateChange((_event: any, newSession: any) => {
      session.value = newSession
      user.value = newSession?.user ?? null
      loading.value = false
    })
  })

  async function getSession() {
    try {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      session.value = currentSession
      user.value = currentSession?.user ?? null
    } catch (err) {
      error.value = err
      console.error('Error getting session:', err)
    } finally {
      loading.value = false
    }
  }

  async function signUp(email: string, password: string, fullName?: string) {
    try {
      loading.value = true
      error.value = null
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: fullName } },
      })
      if (signupError) throw signupError
      return { success: true, data }
    } catch (err) {
      error.value = err
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string) {
    try {
      loading.value = true
      error.value = null
      const { data, error: signinError } = await supabase.auth.signInWithPassword({ email, password })
      if (signinError) throw signinError
      session.value = data.session
      user.value = data.user
      return { success: true, data }
    } catch (err) {
      error.value = err
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    try {
      loading.value = true
      const { error: signoutError } = await supabase.auth.signOut()
      if (signoutError) throw signoutError
      session.value = null
      user.value = null
      return { success: true }
    } catch (err) {
      error.value = err
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(email: string) {
    try {
      loading.value = true
      error.value = null
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/reset-password`,
      })
      if (resetError) throw resetError
      return { success: true }
    } catch (err) {
      error.value = err
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(updates: { username?: string; avatar?: string; phone?: string }) {
    try {
      loading.value = true
      error.value = null
      if (!user.value) throw new Error('No user logged in')
      const { error: profileError } = await supabase.from('profiles').update(updates).eq('id', user.value.id)
      if (profileError) throw profileError
      return { success: true }
    } catch (err) {
      error.value = err
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  async function getProfile(userId?: string) {
    try {
      const targetUserId = userId || user.value?.id
      if (!targetUserId) throw new Error('No user ID provided')
      const { data, error: profileError } = await supabase.from('profiles').select('*').eq('id', targetUserId).single()
      if (profileError) throw profileError
      return { success: true, data }
    } catch (err) {
      error.value = err
      return { success: false, error: err }
    }
  }

  return {
    user, session, loading, error, isAuthenticated,
    signUp, signIn, signOut, resetPassword, updateProfile, getProfile, getSession,
  }
}
