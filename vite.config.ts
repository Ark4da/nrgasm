/// <reference types="vitest/config" />
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const SKIN_DIR = resolve('public/cans')
const SKIN_LIST = resolve('src/data/skinFiles.json')

/**
 * Keeps src/data/skinFiles.json in step with the files in public/cans/, so a
 * skin named after a can id shows up without editing cans.ts. The folder is
 * git-ignored (the images are not ours to publish); the list of names is
 * committed, so a build without the folder (on Vercel) still knows which
 * skins exist and loads them from Supabase Storage.
 */
function skinList(): Plugin {
  function write() {
    if (!existsSync(SKIN_DIR)) return // no local skins: keep the committed list
    const files = readdirSync(SKIN_DIR)
      .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
      .sort()
    const json = `${JSON.stringify(files, null, 2)}\n`
    if (!existsSync(SKIN_LIST) || readFileSync(SKIN_LIST, 'utf8') !== json) {
      writeFileSync(SKIN_LIST, json)
    }
  }

  return {
    name: 'nrgasm-skin-list',
    buildStart: write,
    configureServer(server) {
      write()
      server.watcher.add(SKIN_DIR)
      const onChange = (file: string) => {
        if (resolve(file).startsWith(SKIN_DIR)) write()
      }
      server.watcher.on('add', onChange)
      server.watcher.on('unlink', onChange)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), skinList()],
  build: {
    // The lazy 3D chunk (three.js) is big by nature; it loads only on the home page
    chunkSizeWarningLimit: 1100,
  },
  test: {
    // Only pure logic is tested (see CLAUDE.md)
    include: ['src/lib/**/*.test.ts'],
  },
})
