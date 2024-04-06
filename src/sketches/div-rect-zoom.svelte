<script lang="ts">
  import { SkSVG, type SVGTagName } from '@/lib/sksvg'
  import * as Gen from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // --- rect要素を描画する ---
  interface DrawRectArgs {
    x: number
    y: number
    width: number
    height: number
    fill?: string
  }
  const drawRect = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    { x, y, width, height, fill }: DrawRectArgs
  ) => {
    ctx.create('rect').set({
      x: x,
      y: y,
      width: width,
      height: height,
      fill: fill || `hsl(${Gen.random(0, 360)} 80% 80%)`,
      stroke: 'white',
      // scale時に線幅が変わらないようにする
      'vector-effect': 'non-scaling-stroke',
    })
  }

  // --- 長方形の分割 ---
  interface DivRectArgs {
    width: number // 幅
    ratio: number // 縦横比
  }
  const divRect = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    [startX, startY]: [number, number], // 左上座標
    { width, ratio }: DivRectArgs
  ) => {
    // 長方形の右下の位置
    const endX = startX + width
    const endY = startY + width / ratio

    // floatの許容誤差
    const e = 0.1

    // 分割の繰り返し回数
    let i = 0

    let x = startX
    let y = startY

    let w = width

    while (w > e) {
      i++

      if (i % 2 === 0) {
        // 幅を足したとき、はみ出さない限り
        while (x + w < endX + e) {
          drawRect(ctx, { x, y, width: w, height: w })
          x += w
        }
        w = endX - x
      } else {
        // 幅を足したとき、はみ出さない限り
        while (y + w < endY + e) {
          drawRect(ctx, { x, y, width: w, height: w })
          y += w
        }
        w = endY - y
      }
    }
  }

  // -- マウスによる長方形分割の拡大 ---
  onMount(() => {
    // 黄金長方形の縦横比
    const ratio = (1 + Math.sqrt(5)) / 2

    // --- setting elements ---

    // viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)
    // viewbox size
    const canvasSize = 500

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({
      viewBox: `0 0 ${canvasSize} ${canvasSize / ratio}`,
      width: svgSize,
      height: svgSize / ratio,
    })

    const divGroup = svg.create('g')

    // --- main process ---

    divRect(divGroup, [0, 0], { width: canvasSize, ratio })

    const unobserve = svg.trackCursor(() => {
      if (svg.cursorX === undefined) return

      // マウスのカーソルのX座標によって長方形を1～50倍まで拡大する
      // 拡大した長方形の右下頂点はSVGの右下に合わせる
      const s = Math.pow(50, svg.cursorX / canvasSize) * canvasSize
      divGroup.set({
        transform: `translate(${canvasSize - s} ${canvasSize / ratio - s / ratio}) scale(${s / canvasSize})`,
      })
    })

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
