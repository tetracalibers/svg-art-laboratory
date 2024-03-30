<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import * as Gen from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({ viewBox: '0 0 1000 1000', width: svgSize, height: svgSize })

    // Randomise some variables.
    const numCircles = Gen.random(20, 35)
    const baseRadius = Gen.random(5, 25, true)
    let hue = Gen.random(0, 360)

    // Set up the loop.
    for (let i = 0; i < numCircles; i += 1) {
      // Calculate the current angle.
      // - Math.PI radians is equivalent to 180°, meaning Math.PI * 2 gives us a full circle (360°).
      // - to ensure an equal distribution of our circles along the circumference, we’ll divide Math.PI * 2 by numCircles.
      // - each time the loop runs, we’ll multiply it by our iterator to move on to the next “slice,” so to speak.
      const angle = ((Math.PI * 2) / numCircles) * i

      // Get the sine and cosine of the angle.
      const sin = Math.sin(angle)
      const cos = Math.cos(angle)

      // Map the sine and cosine to the desired range.
      // - We’ll position our circles relative to the center of the viewBox (so 500 on both the x and y axes) and re-map them so that they span a range of 700.
      //   This gives us 150 and 850, that is, -350 and +350 either side of the center.
      const cx = Gen.map(sin, -1, 1, 200, 800, false)
      const cy = Gen.map(cos, -1, 1, 200, 800, false)

      // Create the circle, but don't set the position or radius yet.
      const circle = svg.create('circle').set({
        r: baseRadius,
        fill: 'none',
        stroke: `hsl(${hue} 80% 80% / 0.75)`,
        transform_origin: '500 500',
      })

      // Set the initial and target radii.
      const r1 = baseRadius * 2 + i * 10
      const r2 = baseRadius / (i + 10)

      // Move from (500, 500) to (cx, cy), reduce the radius, rotate.
      circle.animate(
        {
          cx: [500, cx, 500],
          cy: [500, cy, 500],
          r: [r1, r2, r1],
          transform: ['rotate(0deg)', 'rotate(360deg)'],
        },
        {
          duration: 10000,
          iterations: Infinity,
          easing: 'ease-in-out',
        }
      )

      // Increment the hue.
      hue = (hue % 360) + 180 / numCircles
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
