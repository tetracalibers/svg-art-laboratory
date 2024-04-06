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
    // widthやheightが負の値の場合、逆方向に描画
    ctx.create('path').set({
      d: `M ${x} ${y} h ${width} v ${height} h ${-width} Z`,
      fill: fill || `hsl(${Gen.random(0, 360)} 80% 80%)`,
      stroke: 'white',
    })
  }

  // --- フィボナッチ数列の配列から、長方形を回り込むように敷き詰める関数 ---
  interface FiboRectSpiralOption {
    width: number
  }
  const fiboRectSpiral = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    fibo: number[],
    { width }: FiboRectSpiralOption
  ) => {
    // 敷き詰める方向を決めるための符号
    const SGN = [-1, 1, 1, -1]

    // フィボナッチ数列の要素数
    const n = fibo.length

    // フィボナッチ数列の要素数が2未満の場合は終了
    if (n < 2) return

    // 最後の2つの要素を取り出す
    const [a, b] = fibo.slice(-2)
    // 次のフィボナッチ数
    const f = a + b

    // widthに収まるように拡大
    const scale = width / f

    // 長方形の位置
    let x = 0
    let y = 0

    for (let i = 1; i < n - 1; i++) {
      const hue = Gen.map(i, 0, n, 0, 360)

      drawRect(ctx, {
        x: x * scale,
        y: y * scale,

        // 長方形を描く方向を符号の配列に従って変える
        // 符号が負の場合、逆方向に長方形が描画される
        width: fibo[i - 1] * scale * SGN[(i + 1) % 4], //横が短辺
        height: fibo[i] * scale * SGN[i % 4], //縦が長辺（次の項のフィボナッチ数）

        fill: `hsl(${hue} 80% 80%)`,
      })

      // 長方形の位置を符号の配列に従って変える
      if (i % 2 === 1) {
        x += SGN[i % 4] * (fibo[i - 1] + fibo[i])
      } else {
        y += SGN[i % 4] * (fibo[i] + fibo[i + 1])
      }
    }
  }

  // -- フィボナッチ長方形の敷き詰め ---
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
    const fibo = [0, 1]

    const initCount = 6
    for (let i = 0; i < initCount; i++) {
      const [a, b] = fibo.slice(-2)
      fibo.push(a + b)
    }

    fiboRectSpiral(group, fibo, { width: canvasSize })

    // --- events ---

    const dispose = svg.addEventListener('click', () => {
      // フィボナッチ数列を更新
      const [a, b] = fibo.slice(-2)
      fibo.push(a + b)

      // 描画をクリア
      group.clear()
      fiboRectSpiral(group, fibo, { width: canvasSize })
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
