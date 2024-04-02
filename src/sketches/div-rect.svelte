<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import * as Gen from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // 長方形の分割によるユークリッドの互除法の可視化
  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({ viewBox: '0 0 500 500', width: svgSize, height: svgSize })

    // 縦横比が numA : numB の長方形を正方形で分割
    const numA = 10
    const numB = 7

    // 長方形の拡大倍率
    const scale = 500 / Math.max(numA, numB)

    // 数値の大きさを拡大
    const a = Math.floor(numA * scale)
    const b = Math.floor(numB * scale)

    const divGroup = svg.create('g')

    // まず分割対象となる長方形を描画
    divGroup.create('rect').set({
      x: 0,
      y: 0,
      width: a,
      height: b,
      fill: '#fff',
    })

    // 分割に使う正方形の幅の大きさ
    let w = Math.min(a, b)

    // 正方形の位置
    let x = 0
    let y = 0

    // 分割の繰り返し回数
    let i = 0

    // 幅が0になるまで実行
    while (w > 0) {
      i++

      // 奇数回目では、x軸方向へ正方形を増やす
      if (i % 2 === 1) {
        // 幅を足したとき、長方形からはみ出さない限り、正方形を描画
        while (x + w <= a) {
          divGroup.create('rect').set({
            x: x,
            y: y,
            width: w - 1,
            height: w - 1,
            fill: `hsl(${Gen.random(0, 360)} 80% 80%)`,
          })
          x += w
        }
        // 次の正方形の幅は、長方形の残りの幅
        w = a - x
      }
      // 偶数回目では、y軸方向へ正方形を増やす
      else {
        // 幅を足したとき、長方形からはみ出さない限り、正方形を描画
        while (y + w <= b) {
          divGroup.create('rect').set({
            x: x,
            y: y,
            width: w - 1,
            height: w - 1,
            fill: `hsl(${Gen.random(0, 360)} 80% 80%)`,
          })
          y += w
        }
        // 次の正方形の幅は、長方形の残りの幅
        w = b - y
      }
    }

    // 画面中央に移動
    divGroup.moveTo(250, 250)
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
