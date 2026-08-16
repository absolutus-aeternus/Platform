/**
 * Device, Browser, and GPS detection for IP Logger
 */

export function getDeviceInfo() {
  const ua = navigator.userAgent;
  
  // Browser detection
  const browser = detectBrowser(ua);
  
  // OS detection
  const os = detectOS(ua);
  
  // Device detection
  const device = detectDevice(ua);
  
  return {
    // Device
    device_type: device.type,
    device_vendor: device.vendor,
    device_model: device.model,
    
    // OS
    os_name: os.name,
    os_version: os.version,
    
    // Browser
    browser_name: browser.name,
    browser_version: browser.version,
    browser_engine: browser.engine,
    
    // System
    user_agent: ua,
    screen_resolution: `${screen.width}x${screen.height}`,
    language: navigator.language || navigator.userLanguage || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    platform: navigator.platform || '',
    
    // Connection
    connection_type: navigator.connection?.effectiveType || '',
    connection_downlink: navigator.connection?.downlink || '',
    device_memory: navigator.deviceMemory || '',
    hardware_concurrency: navigator.hardwareConcurrency || '',
    
    // Touch
    touch_support: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    max_touch_points: navigator.maxTouchPoints || 0,
    
    // Canvas fingerprint (simple)
    canvas_hash: getCanvasHash(),
  };
}

function detectBrowser(ua) {
  let name = 'Unknown', version = '', engine = '';
  
  if (ua.includes('Edg/')) {
    name = 'Edge'; version = ua.match(/Edg\/([\d.]+)/)?.[1] || ''; engine = 'Blink';
  } else if (ua.includes('OPR/') || ua.includes('Opera/')) {
    name = 'Opera'; version = ua.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] || ''; engine = 'Blink';
  } else if (ua.includes('Chrome/') && !ua.includes('Chromium')) {
    name = 'Chrome'; version = ua.match(/Chrome\/([\d.]+)/)?.[1] || ''; engine = 'Blink';
  } else if (ua.includes('Firefox/')) {
    name = 'Firefox'; version = ua.match(/Firefox\/([\d.]+)/)?.[1] || ''; engine = 'Gecko';
  } else if (ua.includes('Safari/') && ua.includes('Version/')) {
    name = 'Safari'; version = ua.match(/Version\/([\d.]+)/)?.[1] || ''; engine = 'WebKit';
  }
  
  return { name, version, engine };
}

function detectOS(ua) {
  let name = 'Unknown', version = '';
  
  if (ua.includes('Windows NT 10')) { name = 'Windows'; version = '10/11'; }
  else if (ua.includes('Windows NT 6.3')) { name = 'Windows'; version = '8.1'; }
  else if (ua.includes('Windows NT 6.2')) { name = 'Windows'; version = '8'; }
  else if (ua.includes('Windows NT 6.1')) { name = 'Windows'; version = '7'; }
  else if (ua.includes('Mac OS X')) {
    name = 'macOS'; version = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '';
  } else if (ua.includes('iPhone OS')) {
    name = 'iOS'; version = ua.match(/iPhone OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '';
  } else if (ua.includes('iPad; CPU OS')) {
    name = 'iPadOS'; version = ua.match(/CPU OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '';
  } else if (ua.includes('Android')) {
    name = 'Android'; version = ua.match(/Android ([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Linux')) { name = 'Linux'; version = ''; }
  else if (ua.includes('CrOS')) { name = 'Chrome OS'; version = ''; }
  
  return { name, version };
}

function detectDevice(ua) {
  let type = 'desktop', vendor = '', model = '';
  
  // Mobile detection
  if (/Mobile|Android.*Phone|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    type = 'mobile';
    
    if (ua.includes('iPhone')) { vendor = 'Apple'; model = 'iPhone'; }
    else if (ua.includes('Pixel')) { vendor = 'Google'; model = ua.match(/Pixel ([^;]+)/)?.[1] || 'Pixel'; }
    else if (ua.includes('Samsung')) { vendor = 'Samsung'; model = ua.match(/SM-([^;]+)/)?.[1] || 'Galaxy'; }
    else if (ua.includes('Xiaomi')) { vendor = 'Xiaomi'; model = ua.match(/Mi ([^;]+)/)?.[1] || 'Xiaomi'; }
    else if (ua.includes('HUAWEI')) { vendor = 'Huawei'; model = ua.match(/HUAWEI ([^;]+)/)?.[1] || 'Huawei'; }
  }
  // Tablet detection
  else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
    type = 'tablet';
    if (ua.includes('iPad')) { vendor = 'Apple'; model = 'iPad'; }
    else if (ua.includes('Samsung')) { vendor = 'Samsung'; model = 'Galaxy Tab'; }
  }
  // Desktop
  else {
    type = 'desktop';
    if (ua.includes('Macintosh') || ua.includes('Mac OS')) { vendor = 'Apple'; model = 'Mac'; }
    else if (ua.includes('Windows')) { vendor = 'Microsoft'; model = 'PC'; }
    else if (ua.includes('Linux')) { vendor = ''; model = 'Linux PC'; }
  }
  
  return { type, vendor, model };
}

function getCanvasHash() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('AllianceHub', 2, 15);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.fillText('AllianceHub', 4, 17);
    const data = canvas.toDataURL();
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  } catch {
    return 'unsupported';
  }
}

export async function getGPSLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ gps_lat: null, gps_lon: null, gps_accuracy: null });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          gps_lat: pos.coords.latitude,
          gps_lon: pos.coords.longitude,
          gps_accuracy: Math.round(pos.coords.accuracy),
        });
      },
      () => {
        resolve({ gps_lat: null, gps_lon: null, gps_accuracy: null });
      },
      { timeout: 5000, maximumAge: 300000 }
    );
  });
}

export async function logLoginEvent(data) {
  try {
    const deviceInfo = getDeviceInfo();
    const gps = await getGPSLocation();
    
    const payload = {
      ...deviceInfo,
      ...gps,
      ...data,
      login_type: data.login_type || 'login',
      login_status: data.login_status || 'success',
      page_url: window.location.href,
    };
    
    const workerUrl = import.meta.env.VITE_WORKER_URL || 'https://alliancehub-api.absolutus-aeternus.workers.dev';
    
    // Fire and forget (don't block login)
    fetch(workerUrl + '/api/log/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
    
    return true;
  } catch {
    return false;
  }
}
