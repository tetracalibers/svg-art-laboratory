<script lang="ts">
  import { onMount } from 'svelte'
  import { SkSVG } from '@/lib/sksvg'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({ width: svgSize, height: svgSize })

    // 1列/1行に並べる円の数
    const lineCircles = 16

    // 円の直径
    // - canvas内にピッタリ収まるようにする
    const circleSize = svgSize / lineCircles

    // 縦横に円を並べる
    for (let i = 0; i < lineCircles; i++) {
      for (let j = 0; j < lineCircles; j++) {
        // 何番目の円か
        const index = j * lineCircles + i
        // とりうる最大の半径
        const maxRadius = circleSize / 2

        // --- 徐々に大きさを変える ---

        // scaleの増大を、lineCircles + 1単位で繰り返す
        const scaleRepeatUnit = index % (lineCircles + 1)
        // scale値は[0, 1]範囲
        const scale = scaleRepeatUnit / lineCircles
        // スケーリング後の半径
        const scaledRadius = maxRadius * scale

        // --- 円が大きくなるにつれて色を白くする ---

        // 半径を、[0, 1]範囲に変換
        const radiusRate = scaledRadius / maxRadius
        // 半径範囲を、[0, 255]範囲に変換
        const colorValue = radiusRate * 255

        // --- 描画 ---

        svg.create('circle').set({
          // + circleSize / 2 : 円の中心ではなく、左上を基準にする
          cx: i * circleSize + circleSize / 2,
          cy: j * circleSize + circleSize / 2,
          r: scaledRadius,
          fill: `rgb(${colorValue}, ${colorValue}, ${colorValue})`,
        })
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
