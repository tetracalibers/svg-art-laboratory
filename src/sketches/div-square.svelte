<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import * as Gen from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // 長方形の正方形による分割でユークリッドの互除法を可視化
  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)

    // viewbox size
    const vbs = 500

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({ viewBox: `0 0 ${vbs} ${vbs}`, width: svgSize, height: svgSize })

    // 縦横比が numA : numB の長方形を正方形で分割
    const numA = 17
    const numB = 29

    // 比率
    const r = numA / numB

    // 許容誤差（epsilon）
    const e = 0.1

    svg.create('rect').set({
      x: 0,
      y: 0,
      width: vbs,
      height: vbs,
      fill: 'white',
    })

    const divGroup = svg.create('g')

    // viewboxの横幅を初期値とする
    let w = vbs

    // 正方形の位置
    let x = 0
    let y = 0

    // 分割の繰り返し回数
    let i = 0

    // 幅が許容誤差より大きければ実行
    while (w > e) {
      i++

      // 奇数回目では、x軸方向へ正方形を増やす
      if (i % 2 === 1) {
        // 幅を足したとき、viewboxからはみ出さない限り
        while (x + w * r < vbs + e) {
          // 横幅が w 、縦横比が r の長方形を描画
          divGroup.create('rect').set({
            x: x,
            y: y,
            width: w * r - 1,
            height: w - 1,
            fill: `hsl(${Gen.random(0, 360)} 80% 80%)`,
          })
          x += w * r
        }
        w = vbs - x
      }
      // 偶数回目では、y軸方向へ正方形を増やす
      else {
        // 幅を足したとき、viewboxからはみ出さない限り
        while (y + w / r < vbs + e) {
          // 横幅が w 、縦横比が r の長方形を描画
          divGroup.create('rect').set({
            x: x,
            y: y,
            width: w - 1,
            height: w / r - 1,
            fill: `hsl(${Gen.random(0, 360)} 80% 80%)`,
          })
          y += w / r
        }
        w = vbs - y
      }
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
