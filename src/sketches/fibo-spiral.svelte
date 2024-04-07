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
      fill: fill || 'none',
      stroke: '#556FB5',
    })
  }

  // --- 円弧を描画する関数 ---
  interface DrawArcArgs {
    x: number
    y: number
    radius: number
    startAngle: number // radian
    endAngle: number // radian
    fill?: string
  }
  const drawArc = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    { x, y, radius, startAngle, endAngle, fill }: DrawArcArgs
  ) => {
    const start = Gen.polarToCartesian(x, y, radius, endAngle)
    const end = Gen.polarToCartesian(x, y, radius, startAngle)
    const largeArcFlag =
      Gen.radianToDegree(endAngle) - Gen.radianToDegree(startAngle) <= 180
        ? '0'
        : '1'
    const d = [
      `M ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    ].join(' ')
    ctx.create('path').set({
      d,
      fill: fill || 'none',
      stroke: '#E4508F',
    })
  }

  // --- 正方形の敷き詰めをもとにフィボナッチ螺旋を描く ---
  interface FiboSquareSpiralOption {
    width: number
  }
  const fiboSpiral = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    fibo: number[],
    { width }: FiboSquareSpiralOption
  ) => {
    // 敷き詰める方向を決めるための符号
    const SGN = [-1, 1, 1, -1]

    // フィボナッチ数列の要素数
    const n = fibo.length

    // フィボナッチ数列の要素数が2未満の場合は終了
    if (n < 2) return

    // widthに収まるように拡大
    const scale = width / (2 * fibo[n - 1])

    // 正方形の位置
    let x = 0
    let y = 0

    for (let i = 1; i < n - 1; i++) {
      drawRect(ctx, {
        x: x * scale,
        y: y * scale,
        // 正方形を描く方向を符号の配列に従って変える
        // 符号が負の場合、逆方向に正方形が描画される
        width: fibo[i] * scale * SGN[(i + 1) % 4],
        height: fibo[i] * scale * SGN[i % 4],
        fill: 'white',
      })

      // 円の中心
      const cx = x + SGN[(i + 1) % 4] * fibo[i]
      const cy = y + SGN[i % 4] * fibo[i]

      drawArc(ctx, {
        x: cx * scale,
        y: cy * scale,
        radius: scale * fibo[i],
        // ラジアン
        startAngle: ((i + 1) * Math.PI) / 2,
        endAngle: ((i + 2) * Math.PI) / 2,
      })

      // 正方形の位置を符号の配列に従って変える
      if (i % 2 === 1) {
        x += SGN[i % 4] * (fibo[i] + fibo[i + 1])
      } else {
        y += SGN[i % 4] * (fibo[i] + fibo[i + 1])
      }
    }
  }

  // -- フィボナッチ螺旋 ---
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
    const fibo = [0, 1, 1]

    const initCount = 5
    for (let i = 0; i < initCount; i++) {
      const [a, b] = fibo.slice(-2)
      fibo.push(a + b)
    }

    fiboSpiral(group, fibo, { width: canvasSize })

    // --- events ---

    const dispose = svg.addEventListener('click', () => {
      // フィボナッチ数列を更新
      const [a, b] = fibo.slice(-2)
      fibo.push(a + b)

      // 描画をクリア
      group.clear()
      fiboSpiral(group, fibo, { width: canvasSize })
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
