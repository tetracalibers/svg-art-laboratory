<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize =
      winInnerWidth < winInnerHeight ? winInnerWidth : winInnerHeight

    const svg = new SkSVG()

    svg.addTo(container)
    svg.set({ viewBox: '0 0 1000 1000', width: svgSize, height: svgSize })

    // Create our pattern.
    const pattern = svg.createPattern('illusion', 100, 200)

    for (let i = 0; i < 4; i += 1) {
      // Create 4 x white squares within the pattern.
      pattern.create('rect').set({
        // 最後の反復（i === 3）を除いて、各反復でxを20ずつ増やしたい
        x: i === 3 ? 20 : i * 20,
        // y座標は実行ごとに50ずつ増加する
        y: i * 50,
        width: 50,
        height: 50,
        fill: '#eee',
      })

      // Create 4 x thin grey rectangles to separate the squares.
      pattern.create('rect').set({
        x: 0,
        y: 45 + i * 50,
        width: 100,
        height: 5,
        fill: '#666',
      })
    }

    // Apply our pattern to a rect the size of the viewBox.
    svg.create('rect').set({
      x: 0,
      y: 0,
      width: 1000,
      height: 1000,
      fill: 'url(#illusion)',
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
