<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  onMount(() => {
    const svg = new SkSVG().addTo(container)

    // Viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)
    svg.set({ width: svgSize, height: svgSize, viewBox: '0 0 1000 1000' })

    // Circle overlay loop.
    for (let i = 1; i <= 6; i += 1) {
      // Vary the radius, and the two vertical centre points.
      const r = 50 * i
      const cx = 500
      const cy1 = 800 - r
      const cy2 = 200 + r
      // Create the blueish circle set.
      svg.create('circle').set({
        cx: cx,
        cy: cy1,
        r: r,
        fill: '#99eeff',
        fill_opacity: 0.1,
      })
      // Create the greenish circle set.
      svg.create('circle').set({
        cx: cx,
        cy: cy2,
        r: r,
        fill: '#aaffee',
        fill_opacity: 0.1,
      })
    }
    // Create a subtle outline.
    svg.create('circle').set({
      cx: 500,
      cy: 500,
      r: 320,
      fill: 'none',
      stroke: '#aaffee',
      stroke_width: 2,
      stroke_opacity: 0.1,
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
