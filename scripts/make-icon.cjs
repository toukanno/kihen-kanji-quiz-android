/*
 * make-icon.js — 木へん漢字クイズのアプリアイコン素材を生成する。
 *
 * 「木」の字をベクターパス（フォント非依存）で描き、緑背景に白い木を配置する。
 * 出力:
 *   assets/icon-foreground.png … アダプティブアイコン前景（透明背景 + 白い木）
 *   assets/icon-background.png … アダプティブアイコン背景（緑グラデーション）
 *   assets/icon.png            … レガシー/丸アイコン用（緑背景 + 白い木）
 *
 * このあと `npx @capacitor/assets generate --android` で全密度に展開する。
 */

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const ASSETS = path.resolve(__dirname, '..', 'assets')
const SIZE = 1024

// 「木」をストロークで描く（フォント非依存）。安全領域内に収める座標。
function kanjiStrokes (color) {
  const w = 78
  const common = `stroke="${color}" stroke-width="${w}" stroke-linecap="round" fill="none"`
  return `
    <line x1="512" y1="268" x2="512" y2="762" ${common} />
    <line x1="322" y1="420" x2="702" y2="420" ${common} />
    <line x1="512" y1="452" x2="332" y2="756" ${common} />
    <line x1="512" y1="452" x2="692" y2="756" ${common} />
  `
}

const greenBackground = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#37b06a" />
        <stop offset="1" stop-color="#1f7a45" />
      </linearGradient>
    </defs>
    <rect width="${SIZE}" height="${SIZE}" fill="url(#g)" />
  </svg>
`

const foreground = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    ${kanjiStrokes('#ffffff')}
  </svg>
`

// レガシーアイコン: 緑背景 + 白い木（角丸は launcher 側でマスクされる）
const legacy = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#37b06a" />
        <stop offset="1" stop-color="#1f7a45" />
      </linearGradient>
    </defs>
    <rect width="${SIZE}" height="${SIZE}" fill="url(#g)" />
    ${kanjiStrokes('#ffffff')}
  </svg>
`

async function render (svg, outName) {
  const out = path.join(ASSETS, outName)
  await sharp(Buffer.from(svg)).png().toFile(out)
  console.log('✅ ' + outName)
}

async function main () {
  if (!fs.existsSync(ASSETS)) fs.mkdirSync(ASSETS, { recursive: true })
  await render(foreground, 'icon-foreground.png')
  await render(greenBackground, 'icon-background.png')
  await render(legacy, 'icon.png')
  console.log('アイコン素材を assets/ に生成しました。')
}

main().catch((e) => { console.error(e); process.exit(1) })
