<script lang="ts">
  import { SkSVG, type SVGTagName } from '@/lib/sksvg'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // 曲線の精度
  const CURVE_STEP = 2 * Math.PI * 0.01

  // --- 対数螺旋を描画する ---
  const drawLogSpiral = <T extends SVGTagName>(ctx: SkSVG<T>) => {
    // 対数螺旋の動径を計算する関数
    const radius = (t: number) => Math.pow(1.056, t)

    const points: number[] = []

    for (let t = 0; t < 100; t += CURVE_STEP) {
      const r = radius(t)
      const x = r * Math.cos(t)
      const y = r * Math.sin(t)
      points.push(x, y)
    }

    ctx.createCurve(points).set({
      stroke: '#D2E0FB',
      'vector-effect': 'non-scaling-stroke',
    })
  }

  // --- 対数螺旋の自己相似性をマウスによるズームで確認 ---
  onMount(() => {
    // --- settings ---

    // viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)
    // viewbox size
    const canvasSize = 500

    // --- initialize elements ---

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({
      viewBox: `0 0 ${canvasSize} ${canvasSize}`,
      width: svgSize,
      height: svgSize,
    })

    const group = svg.create('g')
    group.moveTo(canvasSize / 2, canvasSize / 2)

    // --- main process ---

    drawLogSpiral(group)

    // --- events ---

    const unobserve = svg.trackCursor(() => {
      if (svg.cursorX === undefined) return

      // マウスカーソルのX座標によって1~2倍まで拡大する
      const s = Math.pow(2, svg.cursorX / canvasSize)
      group.set({
        transform: `translate(${canvasSize / 2} ${canvasSize / 2}) scale(${s})`,
      })
    })

    // --- cleanup ---

    return () => {
      unobserve()
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
