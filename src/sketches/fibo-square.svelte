<script lang="ts">
  import { SkSVG, type SVGTagName } from '@/lib/sksvg'
  import * as Gen from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // --- rect要素を描画する関数 ---
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

  // --- フィボナッチ数列の配列から、正方形を敷き詰める関数 ---
  interface FiboSquareOption {
    width: number
  }
  const fiboSquare = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    fibo: number[],
    { width }: FiboSquareOption
  ) => {
    // フィボナッチ数列の要素数
    const n = fibo.length

    // フィボナッチ数列の要素数が2未満の場合は終了
    if (n < 2) return

    // 最後の2つの要素を取り出す
    const [a, b] = fibo.slice(-2)
    // 次のフィボナッチ数
    const f = a + b

    // 長方形がwidthに収まるように拡大
    const scale = width / f

    // 正方形の位置
    let x = 0
    let y = 0

    for (let i = 1; i < n; i++) {
      const hue = Gen.map(i, 0, n, 0, 360)
      const size = fibo[i] * scale
      drawRect(ctx, {
        x: x * scale,
        y: y * scale,
        width: size,
        height: size,
        fill: `hsl(${hue} 80% 80%)`,
      })

      // 正方形の位置は順にフィボナッチ数を足す or 引くことで移動させる
      // 数列の順番に従って交互に符号を変える
      if (i % 2 === 1) {
        x += fibo[i]
        y -= fibo[i - 1]
      } else {
        x -= fibo[i - 1]
        y += fibo[i]
      }
    }
  }

  // -- クリックするごとに増える正方形の敷き詰めでフィボナッチ数列を可視化 ---
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

    // --- main process ---
    const fibo = [0, 1]

    const initCount = 5
    for (let i = 0; i < initCount; i++) {
      const [a, b] = fibo.slice(-2)
      fibo.push(a + b)
    }

    fiboSquare(group, fibo, { width: canvasSize })

    // --- events ---

    const dispose = svg.addEventListener('click', () => {
      // フィボナッチ数列を更新
      const [a, b] = fibo.slice(-2)
      fibo.push(a + b)

      // 描画をクリア
      group.clear()
      fiboSquare(group, fibo, { width: canvasSize })
    })

    return () => {
      dispose()
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
