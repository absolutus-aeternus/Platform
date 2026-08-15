import { ref } from 'vue'

export function useApi(fetchFn) {
  const data = ref(null)
  const loading = ref(true)
  const error = ref(null)
  let _args = []

  const execute = async (...args) => {
    _args = args
    loading.value = true
    error.value = null
    try {
      const result = await fetchFn(...args)
      data.value = result?.data !== undefined ? result.data : result
      return result
    } catch (e) {
      error.value = e.message || 'An error occurred'
      console.error('[API Error]', e)
    } finally {
      loading.value = false
    }
  }

  const retry = () => execute(..._args)
  return { data, loading, error, execute, retry }
}
