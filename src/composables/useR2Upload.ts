import { ref } from 'vue'
import { workerFetch } from './useSupabase'

export function useR2Upload() {
  const uploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  async function uploadFile(file: File, folder = 'products'): Promise<string | null> {
    uploading.value = true
    progress.value = 0
    error.value = null

    try {
      // 1. Get presigned URL from Worker
      const presign = await workerFetch('/api/upload/presign', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          content_type: file.type,
          folder,
        }),
      })

      // 2. Upload directly to R2 using presigned URL
      const formData = new FormData()
      Object.entries(presign.fields || {}).forEach(([key, value]) => {
        formData.append(key, value as string)
      })
      formData.append('file', file)

      const uploadRes = await fetch(presign.url, {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) throw new Error('Upload failed')

      progress.value = 100
      return presign.publicUrl || presign.key
    } catch (e: any) {
      error.value = e.message
      console.error('R2 upload error:', e)
      return null
    } finally {
      uploading.value = false
    }
  }

  async function uploadMultiple(files: File[], folder = 'products'): Promise<string[]> {
    const urls: string[] = []
    for (const file of files) {
      const url = await uploadFile(file, folder)
      if (url) urls.push(url)
    }
    return urls
  }

  return { uploading, progress, error, uploadFile, uploadMultiple }
}
