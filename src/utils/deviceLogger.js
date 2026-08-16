import { supabase } from '@/services/supabase'

export function getDeviceInfo() {
  const ua = navigator.userAgent;
  const browser = detectBrowser(ua);
  const os = detectOS(ua);
  const device = detectDevice(ua);
  return {
    device_type: device.type, device_vendor: device.vendor, device_model: device.model,
    os_name: os.name, os_version: os.version,
    browser_name: browser.name, browser_version: browser.version, browser_engine: browser.engine,
    user_agent: ua, screen_resolution: screen.width + 'x' + screen.height,
    language: navigator.language || '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    platform: navigator.platform || '',
  };
}

function detectBrowser(ua) {
  let name = 'Unknown', version = '', engine = '';
  if (ua.includes('Edg/')) { name = 'Edge'; version = (ua.match(/Edg\/([\d.]+)/) || [])[1] || ''; engine = 'Blink'; }
  else if (ua.includes('Chrome/')) { name = 'Chrome'; version = (ua.match(/Chrome\/([\d.]+)/) || [])[1] || ''; engine = 'Blink'; }
  else if (ua.includes('Firefox/')) { name = 'Firefox'; version = (ua.match(/Firefox\/([\d.]+)/) || [])[1] || ''; engine = 'Gecko'; }
  else if (ua.includes('Safari/')) { name = 'Safari'; version = (ua.match(/Version\/([\d.]+)/) || [])[1] || ''; engine = 'WebKit'; }
  return { name, version, engine };
}

function detectOS(ua) {
  let name = 'Unknown', version = '';
  if (ua.includes('Windows')) { name = 'Windows'; }
  else if (ua.includes('Mac OS X')) { name = 'macOS'; }
  else if (ua.includes('iPhone')) { name = 'iOS'; }
  else if (ua.includes('Android')) { name = 'Android'; }
  else if (ua.includes('Linux')) { name = 'Linux'; }
  return { name, version };
}

function detectDevice(ua) {
  let type = 'desktop', vendor = '', model = '';
  if (/Mobile|iPhone|Android.*Phone/i.test(ua)) { type = 'mobile'; }
  else if (/iPad|Android/i.test(ua)) { type = 'tablet'; }
  return { type, vendor, model };
}

export async function logLoginEvent(data) {
  try {
    const deviceInfo = getDeviceInfo();
    let gps = { gps_lat: null, gps_lon: null, gps_accuracy: null };
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
      });
      gps = { gps_lat: pos.coords.latitude, gps_lon: pos.coords.longitude, gps_accuracy: Math.round(pos.coords.accuracy) };
    } catch {}

    const record = {
      ...deviceInfo, ...gps, ...data,
      login_type: data.login_type || 'login',
      login_status: data.login_status || 'success',
      page_url: window.location.href,
      logged_at: new Date().toISOString()
    };

    // Store in system_params (always available)
    const logKey = 'ip_log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    await supabase.from('system_params').insert({
      code: logKey,
      value: JSON.stringify(record),
      description: 'IP Log: ' + (record.email || 'unknown')
    });

    return true;
  } catch { return false; }
}
