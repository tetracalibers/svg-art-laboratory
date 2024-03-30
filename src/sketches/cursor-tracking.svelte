<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import * as Gen from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // Randomise some variables.
  let hue = Gen.random(0, 360)
  const rotation = Gen.random(0, 360)
  const iterations = Gen.random(50, 100)

  // This array will allow us to iterate through our ellipses later.
  const ellipses: SkSVG<'ellipse'>[] = []

  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({ viewBox: '0 0 1000 1000', width: svgSize, height: svgSize })

    // Run a loop a random number of times to create the ellipses.
    for (let i = 0; i < iterations; i += 1) {
      // Create our ellipse.
      const ellipse = svg.create('ellipse')
      ellipse.set({
        cx: 500,
        cy: 500,
        rx: 100 + i * 3,
        ry: 300 + i * 2,
        fill: 'none',
        stroke: `hsl(${hue} 80% 80% / 0.6)`,
        transform: `rotate(${rotation + i * 2} 500 500)`,
      })
      // Add the ellipse to the array.
      ellipses.push(ellipse)

      // Increment the hue.
      hue = (hue % 360) + 2
    }

    // Adjust the centre point of each ellipse relative to our cursor.
    const unobserve = svg.trackCursor(() => {
      ellipses.forEach((ellipse) => {
        ellipse.set({
          cx: svg.cursorX,
          cy: svg.cursorY,
        })
      })
    })

    return () => {
      unobserve()
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
