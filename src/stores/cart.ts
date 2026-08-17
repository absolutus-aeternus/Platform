// Re-export cart functionality from the main user store
// to avoid duplicate cart state management
export { useUserStore as useCartStore } from '@/store/user'
