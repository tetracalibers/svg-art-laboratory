<script lang="ts">
  import { SkSVG } from '@/lib/sksvg/render'
  import { random } from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  const randomised = {
    hue: random(0, 360),
    rotation: random(-180, 180),
    iterations: random(10, 100),
  }

  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize =
      winInnerWidth < winInnerHeight ? winInnerWidth : winInnerHeight

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({ viewBox: '0 0 1000 1000', width: svgSize, height: svgSize })

    for (let i = 0; i < randomised.iterations; i += 1) {
      // Set the centre point, the x and y radii of our ellipse and its rotation.
      const center = 500
      const radiusX = 100 + i * 3
      const radiusY = 300 + i * 2
      const rotation = randomised.rotation + i * 2

      // If our random hue is less than 180, increment it. Otherwise decrement it.
      const hue =
        randomised.hue < 180 ? randomised.hue + i * 3 : randomised.hue - i * 3

      // Create our ellipse.
      const ellipse = svg.create('ellipse')
      ellipse.set({
        cx: center,
        cy: center,
        rx: radiusX,
        ry: radiusY,
        fill: 'none',
        stroke: `hsl(${hue} 80% 80% / 0.6)`,
        transform: `rotate(${rotation} ${center} ${center})`,
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
