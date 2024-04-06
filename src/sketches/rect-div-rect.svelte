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
    })
  }

  // --- 左上座標が(x,y)で1辺がwidthの正方形を、縦横比ratioで分割する ---
  interface DivSquareArgs {
    width: number
    ratio: number
  }
  const divSquare = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    [startX, startY]: [number, number],
    { width, ratio }: DivSquareArgs
  ) => {
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

    // 幅が許容誤差より大きければ実行
    while (w > e) {
      i++

      // 奇数回目では、x軸方向へ正方形を増やす
      if (i % 2 === 1) {
        // 幅を足したとき、はみ出さない限り
        while (x + w * ratio < endX + e) {
          drawRect(ctx, { x, y, width: w * ratio, height: w })
          x += w * ratio
        }
        w = endX - x
      }
      // 偶数回目では、y軸方向へ正方形を増やす
      else {
        // 幅を足したとき、はみ出さない限り
        while (y + w / ratio < endY + e) {
          drawRect(ctx, { x, y, width: w, height: w / ratio })
          y += w / ratio
        }
        w = endY - y
      }
    }
  }

  // --- 長方形の正方形の分割によって得た正方形を、さらに長方形によって分割 ---
  onMount(() => {
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

    // 縦横比が numA : numB の長方形を
    const numA = 10
    const numB = 7
    // その逆の比率で分割する
    const ratio = numB / numA

    const divGroup = svg.create('g')

    // floatの許容誤差
    const e = 0.1

    // 位置
    let x = 0
    let y = 0
    // 幅
    let w = canvasSize * ratio
    // 分割の繰り返し回数
    let i = 0

    while (w > e) {
      i++

      // 奇数回目では、x軸方向へ正方形を増やす
      if (i % 2 === 1) {
        // 幅を足したとき、はみ出さない限り、
        while (x + w < canvasSize + e) {
          divSquare(divGroup, [x, y], { width: w, ratio })
          x += w
        }
        w = canvasSize - x
      }
      // 偶数回目では、y軸方向へ正方形を増やす
      else {
        // 幅を足したとき、はみ出さない限り、
        while (y + w < canvasSize * ratio + e) {
          divSquare(divGroup, [x, y], { width: w, ratio })
          y += w
        }
        w = canvasSize * ratio - y
      }
    }

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
