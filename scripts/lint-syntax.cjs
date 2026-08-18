#!/usr/bin/env node
const { readFileSync } = require('node:fs')
const { extname, relative } = require('node:path')
const { execFileSync } = require('node:child_process')
const { transformSync } = require('esbuild')

const root = process.cwd()
const files = execFileSync('git', ['ls-files', 'src/**/*.js', 'src/**/*.vue', 'tests/**/*.js', 'scripts/**/*.js', 'scripts/**/*.cjs'], {
  cwd: root,
  encoding: 'utf8',
})
  .split('\n')
  .filter(Boolean)

const scriptBlockPattern = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
let failed = false

function check(code, file, loader = 'js') {
  try {
    transformSync(code, {
      loader,
      format: 'esm',
      logLevel: 'silent',
      sourcemap: false,
    })
  } catch (error) {
    failed = true
    const message = error.errors?.map((item) => item.text).join('\n') || error.message
    console.error(`\n${relative(root, file)}\n${message}`)
  }
}

for (const file of files) {
  const code = readFileSync(file, 'utf8')
  if (extname(file) === '.vue') {
    const blocks = [...code.matchAll(scriptBlockPattern)]
    for (const block of blocks) check(block[1], file)
    continue
  }

  check(code, file)
}

if (failed) process.exit(1)
console.log(`Syntax lint passed for ${files.length} files.`)
