-- IP Logger: Track all login sessions with device/browser/IP/GPS
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  role TEXT,
  
  -- Network
  ip_address TEXT,
  ip_country TEXT,
  ip_city TEXT,
  ip_region TEXT,
  ip_isp TEXT,
  ip_org TEXT,
  ip_as TEXT,
  ip_lat DECIMAL(10,6),
  ip_lon DECIMAL(10,6),
  
  -- Device
  device_type TEXT,        -- mobile, tablet, desktop
  device_vendor TEXT,      -- Apple, Samsung, etc
  device_model TEXT,       -- iPhone 15, Galaxy S24, etc
  os_name TEXT,            -- Windows, macOS, iOS, Android
  os_version TEXT,         -- 10, 14.2, 13, etc
  
  -- Browser
  browser_name TEXT,       -- Chrome, Safari, Firefox, Edge
  browser_version TEXT,    -- 120.0, 17.2, etc
  browser_engine TEXT,     -- Blink, WebKit, Gecko
  user_agent TEXT,         -- Full UA string
  screen_resolution TEXT,  -- 1920x1080
  language TEXT,           -- en-US, zh-CN
  timezone TEXT,           -- Asia/Shanghai
  platform TEXT,           -- Win32, MacIntel, Linux
  
  -- GPS (if permitted)
  gps_lat DECIMAL(10,6),
  gps_lon DECIMAL(10,6),
  gps_accuracy INT,        -- meters
  
  -- Session
  login_type TEXT,         -- login, register, logout
  login_status TEXT,       -- success, failed, blocked
  session_duration INT,    -- seconds (for logout events)
  page_url TEXT,
  referrer TEXT,
  
  -- Security
  is_vpn BOOLEAN DEFAULT FALSE,
  is_proxy BOOLEAN DEFAULT FALSE,
  is_tor BOOLEAN DEFAULT FALSE,
  threat_score INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

