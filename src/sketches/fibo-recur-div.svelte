<script lang="ts">
  import { SkSVG, type SVGTagName } from '@/lib/sksvg'
  import * as Gen from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // 敷き詰める方向を決めるための符号
  const SGN = [1, 1, -1, -1]

  // --- フィボナッチ数列を生成する ---
  interface FibonacciOptions {
    desc?: boolean // 降順か？
  }
  const fibonacci = (
    n: number,
    { desc = false }: FibonacciOptions
  ): number[] => {
    const fib = [0, 1]
    for (let i = 1; i < n; i++) {
      fib.push(fib[i - 1] + fib[i])
    }
    return desc ? fib.reverse() : fib
  }

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
    // widthやheightが負の値の場合、逆方向に描画
    ctx.create('path').set({
      d: `M ${x} ${y} h ${width} v ${height} h ${-width} Z`,
      fill: fill || `hsl(${Gen.random(0, 360)} 80% 80%)`,
      stroke: 'white',
    })
  }

  // --- 長方形を再帰的にフィボナッチ分割する ---
  interface DivFiboRectRecurArgs {
    pos: [number, number] // 左上座標
    threshold: number // 再帰処理の閾値
    iter: number // 繰り返し回数
    n: number // フィボナッチ数列の項数
    maxN: number // フィボナッチ数列の長さ
    sgn: [number, number] // 描画する方向
    fibo: number[] // フィボナッチ数列（降順）
    width: number // コンテナ幅
  }
  const divFiboRectRecur = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    { threshold, maxN, n, fibo, sgn, pos, iter, width }: DivFiboRectRecurArgs
  ) => {
    const [_sgnX, _sgnY] = sgn
    const [startX, startY] = pos

    // widthに収まるように拡大
    const scale = width / fibo[0]

    let x = startX
    let y = startY

    for (let i = 0; i < maxN - n; i++) {
      const f = fibo[i + n]

      const sgnX = _sgnX * SGN[(i + 1) % 4]
      const sgnY = _sgnY * SGN[i % 4]

      drawRect(ctx, {
        x: x * scale,
        y: y * scale,
        width: f * scale * sgnX,
        height: f * scale * sgnY,
        fill: `hsl(${Gen.map(n, 0, maxN, 0, 360)} 80% 80%)`,
      })

      x += sgnX * f
      y += sgnY * f

      if (iter < threshold) {
        divFiboSquareRecur(ctx, {
          pos: [x, y],
          n: i + n, // フィボナッチ数列の項数を渡す
          iter: iter + 1, // 繰り返し回数を1増やして渡す
          sgn: [-sgnX, -sgnY], // 敷き詰めの回り込みの向きを逆にする
          threshold,
          maxN,
          fibo,
          width,
        })
      }
    }
  }

  // --- 正方形を再帰的にフィボナッチ分割する ---
  interface DivFiboSquareRecurArgs {
    pos: [number, number] // 左上座標
    threshold: number // 再帰処理の閾値
    iter: number // 繰り返し回数
    n: number // フィボナッチ数列の項数
    maxN: number // フィボナッチ数列の長さ
    sgn: [number, number] // 描画する方向
    fibo: number[] // フィボナッチ数列（降順）
    width: number // コンテナ幅
  }
  const divFiboSquareRecur = <T extends SVGTagName>(
    ctx: SkSVG<T>,
    { threshold, pos, n, sgn, maxN, iter, fibo, width }: DivFiboSquareRecurArgs
  ) => {
    const [startX, startY] = pos
    const [_sgnX, _sgnY] = sgn

    // widthに収まるように拡大
    const scale = width / fibo[0]

    let x = startX
    let y = startY

    // (maxN - n)項目のフィボナッチ数（ = fibo[n]）を一辺とする正方形を順に分割
    for (let i = 0; i < maxN - n; i++) {
      // フィボナッチ数列が降順のため、iが大きいほどフィボナッチ長方形は小さくなる
      const f0 = fibo[i + n + 1] // 横幅（短辺）
      const f1 = fibo[i + n] // 縦幅（長辺）

      // 長方形を描画する方向
      const sgnX = _sgnX * SGN[i % 4]
      const sgnY = _sgnY * SGN[(i + 1) % 4]

      drawRect(ctx, {
        x: x * scale,
        y: y * scale,
        width: f0 * scale * sgnX,
        height: f1 * scale * sgnY,
        fill: `hsl(${Gen.map(n, 0, maxN, 0, 360)} 80% 80%)`,
      })

      x += sgnX * f0
      y += sgnY * f1

      if (iter < threshold) {
        divFiboRectRecur(ctx, {
          pos: [x, y],
          n: i + n + 1, // フィボナッチ長方形の短辺の項数を渡す
          iter: iter + 1, // 繰り返し回数を1増やして渡す
          sgn: [-sgnX, -sgnY], // 敷き詰めの回り込みの向きを逆にする
          threshold,
          maxN,
          fibo,
          width,
        })
      }
    }
  }

  // -- 再帰的なフィボナッチ分割 ---
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

    const divGroup = svg.create('g')

    // --- main process ---

    // フィボナッチ数列の長さ（偶数）
    const maxN = 12
    // 関数の繰り返し回数の閾値
    const threshold = 3

    // 降順のフィボナッチ数列
    const fibo = fibonacci(maxN, { desc: true })

    divFiboSquareRecur(divGroup, {
      pos: [0, 0],
      n: 0,
      iter: 0,
      threshold,
      maxN,
      sgn: [1, 1],
      fibo,
      width: canvasSize,
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
