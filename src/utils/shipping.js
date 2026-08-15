// ==================== SHIPPING SERVICE ====================
export const CARRIERS = [
  { id: 'fedex', name: 'FedEx', logo: '📦', trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr=' },
  { id: 'ups', name: 'UPS', logo: '📦', trackingUrl: 'https://www.ups.com/track?tracknum=' },
  { id: 'dhl', name: 'DHL', logo: '📦', trackingUrl: 'https://www.dhl.com/en/express/tracking.html?AWB=' },
  { id: 'usps', name: 'USPS', logo: '📦', trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=' },
  { id: 'jne', name: 'JNE', logo: '📦', trackingUrl: 'https://www.jne.co.id/en/tracking/trace/' },
  { id: 'jnt', name: 'J&T Express', logo: '📦', trackingUrl: 'https://www.jtexpress.com/tracking?waybill=' },
  { id: 'sicepat', name: 'SiCepat', logo: '📦', trackingUrl: 'https://www.sicepat.com/checkawb/' },
]

export const SHIPPING_RATES = [
  { carrier: 'Standard', service: 'Economy', rate: 0, days: '7-14', tracking: true, free_above: 30 },
  { carrier: 'Standard', service: 'Regular', rate: 4.99, days: '5-7', tracking: true, free_above: 50 },
  { carrier: 'Express', service: 'Express', rate: 12.99, days: '2-3', tracking: true, free_above: 100 },
  { carrier: 'Premium', service: 'Next Day', rate: 24.99, days: '1', tracking: true, free_above: null },
]

export function calculateShipping(subtotal, method = 'standard') {
  const rate = SHIPPING_RATES.find(r => r.service.toLowerCase() === method.toLowerCase()) || SHIPPING_RATES[0]
  
  if (rate.free_above && subtotal >= rate.free_above) {
    return { ...rate, cost: 0, label: 'FREE' }
  }
  
  return { ...rate, cost: rate.rate, label: `$${rate.rate.toFixed(2)}` }
}

export function getEstimatedDelivery(method = 'standard') {
  const rate = SHIPPING_RATES.find(r => r.service.toLowerCase() === method.toLowerCase()) || SHIPPING_RATES[0]
  const days = parseInt(rate.days.split('-').pop() || rate.days)
  const delivery = new Date()
  delivery.setDate(delivery.getDate() + days)
  return delivery.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function getCarrierInfo(carrierId) {
  return CARRIERS.find(c => c.id === carrierId) || CARRIERS[0]
}

export function getTrackingUrl(carrierId, trackingNumber) {
  const carrier = getCarrierInfo(carrierId)
  return `${carrier.trackingUrl}${trackingNumber}`
}
