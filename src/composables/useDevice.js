import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Composable for device detection and responsive breakpoints
 * Uses window.matchMedia() for efficient breakpoint detection
 */
export function useDevice() {
  // Screen dimensions
  const screenWidth = ref(window.innerWidth)
  const screenHeight = ref(window.innerHeight)
  
  // Breakpoints using matchMedia
  const isMobile = ref(window.matchMedia('(max-width: 639px)').matches)
  const isTablet = ref(window.matchMedia('(min-width: 640px) and (max-width: 1023px)').matches)
  const isDesktop = ref(window.matchMedia('(min-width: 1024px)').matches)
  const isLargeDesktop = ref(window.matchMedia('(min-width: 1280px)').matches)
  
  // Orientation
  const isPortrait = ref(window.matchMedia('(orientation: portrait)').matches)
  const isLandscape = ref(window.matchMedia('(orientation: landscape)').matches)
  
  // Device type from user agent
  const ua = navigator.userAgent
  const isAndroid = /Android/i.test(ua)
  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  const isWindows = /Windows/i.test(ua)
  const isMac = /Macintosh|Mac OS/i.test(ua)
  const isLinux = /Linux/i.test(ua) && !isAndroid
  const isMobileDevice = /Mobile|Android.*Phone|iPhone|iPod/i.test(ua)
  const isTabletDevice = /iPad|Android(?!.*Mobile)|Tablet/i.test(ua)
  
  // Touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const maxTouchPoints = ref(navigator.maxTouchPoints || 0)
  
  // Connection info
  const connectionType = computed(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    return conn ? conn.effectiveType : 'unknown'
  })
  
  const isSlowConnection = computed(() => {
    return ['slow-2g', '2g'].includes(connectionType.value)
  })
  
  // Device pixel ratio
  const pixelRatio = ref(window.devicePixelRatio || 1)
  const isRetina = computed(() => pixelRatio.value >= 2)
  
  // Orientation string
  const orientation = computed(() => isPortrait.value ? 'portrait' : 'landscape')
  
  // Breakpoint string
  const breakpoint = computed(() => {
    if (isMobile.value) return 'mobile'
    if (isTablet.value) return 'tablet'
    if (isLargeDesktop.value) return 'large-desktop'
    return 'desktop'
  })
  
  // Media queries for listeners
  const mobileQuery = window.matchMedia('(max-width: 639px)')
  const tabletQuery = window.matchMedia('(min-width: 640px) and (max-width: 1023px)')
  const desktopQuery = window.matchMedia('(min-width: 1024px)')
  const largeQuery = window.matchMedia('(min-width: 1280px)')
  const portraitQuery = window.matchMedia('(orientation: portrait)')
  
  // Update handlers
  const updateScreen = () => {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
  }
  
  const updateMobile = (e) => { isMobile.value = e.matches }
  const updateTablet = (e) => { isTablet.value = e.matches }
  const updateDesktop = (e) => { isDesktop.value = e.matches }
  const updateLarge = (e) => { isLargeDesktop.value = e.matches }
  const updatePortrait = (e) => {
    isPortrait.value = e.matches
    isLandscape.value = !e.matches
  }
  
  onMounted(() => {
    window.addEventListener('resize', updateScreen)
    mobileQuery.addEventListener('change', updateMobile)
    tabletQuery.addEventListener('change', updateTablet)
    desktopQuery.addEventListener('change', updateDesktop)
    largeQuery.addEventListener('change', updateLarge)
    portraitQuery.addEventListener('change', updatePortrait)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateScreen)
    mobileQuery.removeEventListener('change', updateMobile)
    tabletQuery.removeEventListener('change', updateTablet)
    desktopQuery.removeEventListener('change', updateDesktop)
    largeQuery.removeEventListener('change', updateLarge)
    portraitQuery.removeEventListener('change', updatePortrait)
  })
  
  return {
    // Screen
    screenWidth,
    screenHeight,
    pixelRatio,
    isRetina,
    
    // Breakpoints
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    breakpoint,
    
    // Orientation
    isPortrait,
    isLandscape,
    orientation,
    
    // OS
    isAndroid,
    isIOS,
    isWindows,
    isMac,
    isLinux,
    
    // Device type
    isMobileDevice,
    isTabletDevice,
    
    // Touch
    hasTouch,
    maxTouchPoints,
    
    // Connection
    connectionType,
    isSlowConnection,
  }
}
