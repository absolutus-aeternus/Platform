// Upstash Redis client for Cloudflare Workers
// Uses REST API — no native dependencies needed

export class UpstashRedis {
  constructor(url, token) {
    this.url = url
    this.token = token
  }

  async command(...args) {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    })
    if (!res.ok) throw new Error(`Redis error: ${res.status}`)
    const data = await res.json()
    return data.result
  }

  // ─── Basic Operations ───
  async get(key) {
    return this.command('GET', key)
  }

  async set(key, value, exSeconds) {
    if (exSeconds) return this.command('SET', key, value, 'EX', exSeconds)
    return this.command('SET', key, value)
  }

  async del(key) {
    return this.command('DEL', key)
  }

  async exists(key) {
    return this.command('EXISTS', key)
  }

  async ttl(key) {
    return this.command('TTL', key)
  }

  // ─── Atomic Counters ───
  async incr(key) {
    return this.command('INCR', key)
  }

  async incrby(key, amount) {
    return this.command('INCRBY', key, amount)
  }

  async decr(key) {
    return this.command('DECR', key)
  }

  // ─── Hash Operations ───
  async hset(key, field, value) {
    return this.command('HSET', key, field, value)
  }

  async hget(key, field) {
    return this.command('HGET', key, field)
  }

  async hgetall(key) {
    return this.command('HGETALL', key)
  }

  async hincrby(key, field, amount) {
    return this.command('HINCRBY', key, field, amount)
  }

  // ─── List Operations ───
  async lpush(key, ...values) {
    return this.command('LPUSH', key, ...values)
  }

  async rpush(key, ...values) {
    return this.command('RPUSH', key, ...values)
  }

  async lrange(key, start, stop) {
    return this.command('LRANGE', key, start, stop)
  }

  async llen(key) {
    return this.command('LLEN', key)
  }

  // ─── Sorted Sets (for leaderboards, rate limiting) ───
  async zadd(key, score, member) {
    return this.command('ZADD', key, score, member)
  }

  async zrange(key, start, stop, withScores) {
    if (withScores) return this.command('ZRANGE', key, start, stop, 'WITHSCORES')
    return this.command('ZRANGE', key, start, stop)
  }

  async zremrangebyscore(key, min, max) {
    return this.command('ZREMRANGEBYSCORE', key, min, max)
  }

  async zcard(key) {
    return this.command('ZCARD', key)
  }

  async zincrby(key, increment, member) {
    return this.command('ZINCRBY', key, increment, member)
  }

  // ─── Rate Limiting ───
  async rateLimit(ip, maxRequests = 50, windowSeconds = 60) {
    const key = `rl:${ip}`
    const now = Date.now()
    const windowStart = now - (windowSeconds * 1000)

    // Remove old entries
    await this.zremrangebyscore(key, 0, windowStart)

    // Count current requests
    const count = await this.zcard(key)

    if (count >= maxRequests) {
      return { allowed: false, remaining: 0, resetIn: windowSeconds }
    }

    // Add current request
    await this.zadd(key, now, `${now}:${Math.random().toString(36).slice(2)}`)
    await this.command('EXPIRE', key, windowSeconds)

    return { allowed: true, remaining: maxRequests - count - 1, resetIn: windowSeconds }
  }

  // ─── Caching with TTL ───
  async cacheGet(key) {
    const data = await this.get(`cache:${key}`)
    if (!data) return null
    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  }

  async cacheSet(key, value, ttlSeconds = 3600) {
    return this.set(`cache:${key}`, JSON.stringify(value), ttlSeconds)
  }

  async cacheDelete(key) {
    return this.del(`cache:${key}`)
  }

  async cacheFlush(pattern) {
    // For Upstash, we track keys manually
    const keys = await this.get(`cache_keys:${pattern}`)
    if (keys) {
      const keyList = JSON.parse(keys)
      for (const k of keyList) {
        await this.del(`cache:${k}`)
      }
      await this.del(`cache_keys:${pattern}`)
    }
  }

  // ─── Session Store ───
  async sessionSet(userId, data, ttlSeconds = 86400) {
    return this.set(`session:${userId}`, JSON.stringify(data), ttlSeconds)
  }

  async sessionGet(userId) {
    const data = await this.get(`session:${userId}`)
    if (!data) return null
    try {
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  async sessionDelete(userId) {
    return this.del(`session:${userId}`)
  }

  // ─── Product View Counter ───
  async trackProductView(productId) {
    const key = `views:${productId}`
    const count = await this.incr(key)
    // Expire after 30 days
    if (count === 1) {
      await this.command('EXPIRE', key, 2592000)
    }
    return count
  }

  async getProductViews(productId) {
    const count = await this.get(`views:${productId}`)
    return parseInt(count) || 0
  }

  // ─── Popular Products (sorted by views) ───
  async getPopularProducts(limit = 20) {
    return this.zrange('popular_products', 0, limit - 1, true)
  }

  async trackPopularProduct(productId) {
    return this.zincrby('popular_products', 1, productId)
  }

  // ─── Keep-alive for Supabase ───
  async keepAlive() {
    const key = 'supabase_keepalive'
    const lastPing = await this.get(key)
    const now = Date.now()

    // Only ping if last ping was > 5 minutes ago
    if (lastPing && (now - parseInt(lastPing)) < 300000) {
      return { skipped: true }
    }

    await this.set(key, String(now), 600)
    return { pinged: true, timestamp: now }
  }
}
