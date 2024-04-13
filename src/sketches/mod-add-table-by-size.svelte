<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import { Vector2 } from '@/lib/math/vector'
  import * as Gen from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // --- 合同算術の加法表を円の大きさに対応させて可視化 ---
  onMount(() => {
    // --- settings ---

    // viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)
    // viewbox size
    const canvasSize = 500

    // 法とする自然数
    const mod = 20

    // 拡大比率
    const scale = canvasSize / mod

    // --- initialize elements ---

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({
      viewBox: `0 0 ${canvasSize} ${canvasSize}`,
      width: svgSize,
      height: svgSize,
    })

    const id = 'cell'
    svg.createForUse('circle', id).set({ cx: 0, cy: 0, r: scale / 2 })

    for (let i = 0; i < mod; i++) {
      for (let j = 0; j < mod; j++) {
        // 円の中心位置
        const c = new Vector2(i + 0.5, j + 0.5).scale(scale)

        // 加法の結果
        const k = (i + j) % mod

        // 円の大きさに対応させる
        const s = (k + 1) / mod

        // 円の色相に対応させる
        const hue = Gen.map(k, 0, mod - 1, 0, 360)

        // 円を描画
        svg.create('use').set({
          href: `#${id}`,
          x: c.x,
          y: c.y,
          transform: `scale(${s * 0.8})`,
          'transform-origin': `${c.x}px ${c.y}px`,
          fill: `hsl(${hue} 90% 80%)`,
        })
      }
    }
  })
</script>

<svelte:window
  bind:innerWidth="{winInnerWidth}"
  bind:innerHeight="{winInnerHeight}"
/>

<div bind:this="{container}" class="sketch-container"></div>

<style>
  .sketch-container {
    display: flex;
  }
</style>
