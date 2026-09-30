// Genera artifact/roadmap-lpa.html: pagina unica, JS e CSS inline, pubblicabile come Artifact claude.ai.
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const out = 'dist-artifact'
await build({
  configFile: false,
  plugins: [react(), tailwindcss()],
  logLevel: 'warn',
  build: {
    outDir: out,
    emptyOutDir: true,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      input: 'src/artifact.tsx',
      output: { entryFileNames: 'app.js', assetFileNames: 'app[extname]', codeSplitting: false },
    },
  },
})

const files = readdirSync(out)
const js = readFileSync(join(out, files.find((f) => f.endsWith('.js'))), 'utf8').replace(/<\/script/gi, '<\\/script')
const css = readFileSync(join(out, files.find((f) => f.endsWith('.css'))), 'utf8').replace(/<\/style/gi, '<\\/style')

// Il contenitore dell'artifact applica un reset proprio (sfondo chiaro, font 14px):
// queste regole non-layer lo sovrascrivono. Pagina volutamente solo dark.
const shell = `:root{color-scheme:dark;background:#0a0a0a}body{background:#0a0a0a;color:#fff;font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;font-size:16px;line-height:1.5}`

const html = `<title>Roadmap LPA 2026/2027</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">
<style>${css}
${shell}</style>
<div id="root"></div>
<script type="module">${js}</script>
`
mkdirSync('artifact', { recursive: true })
writeFileSync('artifact/roadmap-lpa.html', html)
console.log(`artifact/roadmap-lpa.html — ${(html.length / 1024).toFixed(1)} KB`)
