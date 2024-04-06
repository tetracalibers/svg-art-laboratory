<script lang="ts">
  import { SkSVG, type SVGTagName } from '@/lib/sksvg'
  import * as Gen from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // floatの許容誤差
  const FLOAT_MARGIN = 0.1

  // --- 確率的に色を決定する ---
  const probColor = () => {
    let color: string

    if (Gen.chance(15)) {
      color = 'rgb(170, 56, 135)' // 15%の確率で赤
    } else if (Gen.chance(15)) {
      color = 'rgb(71, 158, 221)' // 15%の確率で青
    } else if (Gen.chance(15)) {
      color = 'rgb(252, 239, 79)' // 15%の確率で黄
    } else if (Gen.chance(5)) {
      color = '#ccc' // 5%の確率で黒
    } else if (Gen.chance(20)) {
      color = 'rgb(190, 210, 67)' // 20%の確率で緑
    } else {
      color = '#FFFFFF' // 30%の確率で白
    }

    return color
  }

  // --- rect要素を描画する ---
  interface DrawRectArgs {
    x: number
    y: number
    width: number
    height: number
    fill?: string
    strokeWidth?: number
  }
  const drawRect = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    { x, y, width, height, fill, strokeWidth }: DrawRectArgs
  ) => {
    ctx.create('rect').set({
      x: x,
      y: y,
      width: width,
      height: height,
      fill: fill || probColor(),
      stroke: 'black',
      'stroke-width': strokeWidth || 2,
    })
  }

  // --- 再帰的な長方形の分割（長方形の分割 -> 正方形の分割 -> 長方形の分割 -> ...） ---
  interface DivRectArgs {
    width: number // 幅
    ratio: number // 縦横比
    threshold: number // 再帰処理の閾値
    redivProb: number // 再分割の確率
  }
  const divRect = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    [startX, startY]: [number, number], // 左上座標
    { width, ratio, threshold, redivProb }: DivRectArgs
  ) => {
    // 長方形の右下の位置
    const endX = startX + width
    const endY = startY + width / ratio

    // 分割の繰り返し回数
    let i = 0

    let x = startX
    let y = startY

    let w = width

    while (w > threshold) {
      i++

      if (i % 2 === 0) {
        // 幅を足したとき、はみ出さない限り
        while (x + w < endX + FLOAT_MARGIN) {
          drawRect(ctx, { x, y, width: w, height: w })
          if (Gen.chance(redivProb)) {
            divSquare(ctx, [x, y], { width: w, ratio, threshold, redivProb })
          }
          x += w
        }
        w = endX - x
      } else {
        // 幅を足したとき、はみ出さない限り
        while (y + w < endY + FLOAT_MARGIN) {
          drawRect(ctx, { x, y, width: w, height: w })
          if (Gen.chance(redivProb)) {
            divSquare(ctx, [x, y], { width: w, ratio, threshold, redivProb })
          }
          y += w
        }
        w = endY - y
      }
    }
  }

  // --- 正方形の分割 ---
  interface DivSquareArgs {
    width: number // 1辺の長さ
    ratio: number // 縦横比
    threshold: number // 再帰処理の閾値
    redivProb: number // 再分割の確率
  }
  const divSquare = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    [startX, startY]: [number, number], // 左上座標
    { width, ratio, threshold, redivProb }: DivSquareArgs
  ) => {
    // 正方形の右下の位置
    const endX = startX + width
    const endY = startY + width

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
        while (x + w * ratio < endX + FLOAT_MARGIN) {
          drawRect(ctx, { x, y, width: w * ratio, height: w })
          if (Gen.chance(redivProb)) {
            divRect(ctx, [x, y], {
              width: w * ratio,
              ratio,
              threshold,
              redivProb,
            })
          }
          x += w * ratio
        }
        w = endX - x
      }
      // 偶数回目では、y軸方向へ正方形を増やす
      else {
        // 幅を足したとき、はみ出さない限り
        while (y + w / ratio < endY + FLOAT_MARGIN) {
          drawRect(ctx, { x, y, width: w, height: w / ratio })
          if (Gen.chance(redivProb)) {
            divRect(ctx, [x, y], { width: w, ratio, threshold, redivProb })
          }
          y += w / ratio
        }
        w = endY - y
      }
    }
  }

  // -- 正方形の再帰的な黄金分割を使ってモンドリアンもどきを描画 ---
  onMount(() => {
    // --- settings ---

    // 黄金数
    const ratio = (Math.sqrt(5) + 1) / 2

    // 分割する大きさに関する閾値
    const sizeThreshold = 20

    // 確率を決定する閾値
    const probThreshold = 80

    // --- initialize elements ---

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

    drawRect(divGroup, { x: 0, y: 0, width: canvasSize, height: canvasSize })
    divSquare(divGroup, [0, 0], {
      width: canvasSize,
      ratio,
      threshold: sizeThreshold,
      redivProb: probThreshold,
    })
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
