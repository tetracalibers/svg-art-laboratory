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
      stroke: 'black',
    })
  }

  // --- 再帰的な長方形の分割（長方形の分割 -> 正方形の分割 -> 長方形の分割 -> ...） ---
  interface DivRectRecursiveArgs {
    width: number // 幅
    ratio: number // 縦横比
    threshold: number // 再帰処理の閾値
  }
  const divRectRecursive = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    [startX, startY]: [number, number], // 左上座標
    { width, ratio, threshold }: DivRectRecursiveArgs
  ) => {
    drawRect(ctx, { x: startX, y: startY, width, height: width / ratio })

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

    while (w > threshold) {
      i++

      if (i % 2 === 0) {
        // 幅を足したとき、はみ出さない限り
        while (x + w < endX + e) {
          divSquareRecursive(ctx, [x, y], { width: w, ratio, threshold })
          x += w
        }
        w = endX - x
      } else {
        // 幅を足したとき、はみ出さない限り
        while (y + w < endY + e) {
          divSquareRecursive(ctx, [x, y], { width: w, ratio, threshold })
          y += w
        }
        w = endY - y
      }
    }
  }

  // --- 再帰的な正方形の分割（正方形の分割 -> 長方形の分割 -> 正方形の分割 -> ...） ---
  interface DivSquareRecursiveArgs {
    width: number // 1辺の長さ
    ratio: number // 縦横比
    threshold: number // 再帰処理の閾値
  }
  const divSquareRecursive = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    [startX, startY]: [number, number], // 左上座標
    { width, ratio, threshold }: DivSquareRecursiveArgs
  ) => {
    drawRect(ctx, { x: startX, y: startY, width, height: width })

    // 正方形の右下の位置
    const endX = startX + width
    const endY = startY + width

    // floatの許容誤差
    const e = 0.1

    // 分割の繰り返し回数
    let i = 0

    let x = startX
    let y = startY

    let w = width

    while (w > threshold) {
      i++

      // 奇数回目では、x軸方向へ正方形を増やす
      if (i % 2 === 1) {
        // 幅を足したとき、はみ出さない限り
        while (x + w * ratio < endX + e) {
          divRectRecursive(ctx, [x, y], { width: w * ratio, ratio, threshold })
          x += w * ratio
        }
        w = endX - x
      }
      // 偶数回目では、y軸方向へ正方形を増やす
      else {
        // 幅を足したとき、はみ出さない限り
        while (y + w / ratio < endY + e) {
          divRectRecursive(ctx, [x, y], { width: w, ratio, threshold })
          y += w / ratio
        }
        w = endY - y
      }
    }
  }

  // -- 正方形分割と長方形分割を再帰的に繰り返す ---
  onMount(() => {
    // --- setting elements ---

    // viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)
    // viewbox size
    const canvasSize = 500

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({
      viewBox: `0 0 ${canvasSize} ${canvasSize}`,
      width: svgSize,
      height: svgSize,
    })

    const divGroup = svg.create('g')

    // --- main process ---

    // 縦横比が numA : numB の長方形
    const numA = 7
    const numB = 8
    const ratio = numA / numB

    // 再帰処理の閾値
    const threshold = 10

    divSquareRecursive(divGroup, [0, 0], {
      width: canvasSize,
      ratio,
      threshold,
    })

    // --- adjust position ---

    // 画面中央に移動
    divGroup.moveTo(canvasSize * 0.5, canvasSize * 0.5)
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
