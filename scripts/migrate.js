#!/usr/bin/env node
/**
 * AllianceHub Database Migration Runner
 * Reads credentials from environment variables:
 *   SUPABASE_ACCESS_TOKEN - Supabase personal access token
 *   SUPABASE_PROJECT_REF - Project reference ID
 * 
 * Usage: SUPABASE_ACCESS_TOKEN=xxx SUPABASE_PROJECT_REF=xxx node scripts/migrate.js
 */

const fs = require('fs')
const path = require('path')

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF

if (!ACCESS_TOKEN || !PROJECT_REF) {
  console.error('❌ Missing environment variables:')
  console.error('   SUPABASE_ACCESS_TOKEN=your-personal-access-token')
  console.error('   SUPABASE_PROJECT_REF=your-project-ref')
  process.exit(1)
}

async function execSQL(query, label) {
  const resp = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  })
  const text = await resp.text()
  if (resp.ok) {
    console.log(`  ✅ ${label}`)
    return JSON.parse(text)
  } else {
    const msg = text.slice(0, 300)
    if (msg.includes('already exists') || msg.includes('duplicate_object') || msg.includes('duplicate')) {
      console.log(`  ⚠️  ${label} (already exists)`)
    } else {
      console.log(`  ❌ ${label}: ${msg}`)
    }
    return null
  }
}

async function run() {
  console.log('🚀 AllianceHub Database Migration\n')

  // Read the migration SQL file
  const sqlFile = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql')
  if (!fs.existsSync(sqlFile)) {
    console.error('❌ Migration file not found:', sqlFile)
    process.exit(1)
  }

  const fullSQL = fs.readFileSync(sqlFile, 'utf8')

  // Split by semicolons (simple split - works for most SQL)
  // Better approach: split on double newlines or use a proper SQL parser
  // For now, execute the full SQL
  console.log('📄 Executing migration SQL...')
  await execSQL(fullSQL, 'Full migration')

  console.log('\n🎉 Migration complete!')
}

run().catch(err => {
  console.error('❌ Fatal:', err.message)
  process.exit(1)
})
