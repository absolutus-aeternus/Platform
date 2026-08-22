/**
 * v-img-fallback Directive
 * Automatically replaces broken images with a placeholder.
 * Usage: <img v-img-fallback src="..." alt="..." />
 * Or with custom fallback: <img v-img-fallback="'/images/custom-placeholder.png'" src="..." />
 */
export const imgFallback = {
  mounted(el, binding) {
    const fallback = binding.value || '/images/placeholder-product.svg'
    
    el.addEventListener('error', function handler() {
      // Prevent infinite loop if fallback also fails
      el.removeEventListener('error', handler)
      
      // If it's an <img> tag
      if (el.tagName === 'IMG') {
        el.src = fallback
        el.classList.add('img-fallback')
      }
    }, { once: false })
  }
}

/**
 * Global image error handler for inline @error usage
 * Usage: <img @error="handleImgError($event)" src="..." />
 */
export function handleImgError(event, fallbackSrc) {
  const el = event.target
  const fallback = fallbackSrc || '/images/placeholder-product.svg'
  if (el.src !== fallback) {
    el.src = fallback
    el.classList.add('img-fallback')
  }
}
