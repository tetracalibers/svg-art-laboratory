<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import { gaussian, random } from '@/lib/sksvg/generative'
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

    // Run a loop 10,000 times.
    for (let i = 0; i < 10000; i += 1) {
      // Generate x and y co-ordinates with a gaussian distribution.
      // The coordinates are based around the center of the viewBox (i.e., 500), with a standard deviation of 150.
      const gaussianX = gaussian(500, 150)
      const gaussianY = gaussian(500, 150)

      // Create the lines based on the gaussian co-ordinates.
      svg.create('line').set({
        x1: gaussianX,
        y1: gaussianY,
        x2: gaussianX + random(-10, 10),
        y2: gaussianY + random(-10, 10),
        stroke: `hsl(${random(150, 270)} 80% 80% / 0.8)`,
      })
    }

    // Create a series of circles to frame the distribution.
    // (subtly emphasize the shape of the distribution with a series of fading circular strokes)
    for (let i = 0; i < 10; i += 1) {
      svg.create('circle').set({
        cx: 500,
        cy: 500,
        r: 25 + i * 25,
        fill: 'none',
        stroke: `hsl(0 0% 0% / ${0.25 - i / 50})`,
        stroke_width: 15,
      })
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
