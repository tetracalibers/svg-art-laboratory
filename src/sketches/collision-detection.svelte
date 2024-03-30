<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import * as Gen from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  const frameSize = Gen.random(350, 700)

  // Randomise the number of circles and set up an empty array.
  const numCircles = Math.floor(frameSize / 20)
  const circles: SkSVG<'circle'>[] = []

  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({ viewBox: '0 0 1000 1000', width: svgSize, height: svgSize })

    // Create a frame to act as the boundary.
    const frame = svg.create('rect').set({
      x: (1000 - frameSize) / 2,
      y: (1000 - frameSize) / 2,
      width: frameSize,
      height: frameSize,
      fill: '#252525',
      stroke: `hsl(${Gen.random(0, 360)} 80% 80% / 0.25)`,
      stroke_width: frameSize / 10,
    })

    // Populate this array.
    for (let i = 0; i < numCircles; i += 1) {
      // Randomise the radius relative to the frame size.
      const radius = Gen.random(frameSize / 100, frameSize / 25)
      // Create variables to control the speed on the x and y axes.
      const velocityX = Gen.random(0.1, 5, true)
      const velocityY = Gen.random(0.1, 5, true)
      // Apply the above variables and randomise the hue.
      const circle = svg.create('circle').set({
        cx: 500,
        cy: 500,
        r: radius,
        vx: Gen.chance() ? velocityX : -velocityX,
        vy: Gen.chance() ? velocityY : -velocityY,
        fill: `hsl(${Gen.random(0, 360)} 80% 80% / 0.5)`,
      })
      // Store the circle in the array.
      circles.push(circle)
    }

    // Get the frame edge point (x or y) and the inset.
    const frameEdge = Number(frame.get('x'))
    const frameInset = Number(frame.get('stroke-width')) / 2
    // The animation loop.
    function animate() {
      // Check collisions for each circle.
      circles.forEach((circle) => {
        // Calculate the lower and upper bounds for each circle.
        const radius = Number(circle.get('r'))
        const lowerBound = frameEdge + radius + frameInset
        const upperBound = frameEdge + frameSize - radius - frameInset
        // Retrieve the position and velocity.
        let cx = Number(circle.get('cx'))
        let cy = Number(circle.get('cy'))
        let vx = Number(circle.get('vx'))
        let vy = Number(circle.get('vy'))
        // Check for collisions, and if found reverse the polarity.
        if (cx <= lowerBound || cx >= upperBound) vx = -vx
        if (cy <= lowerBound || cy >= upperBound) vy = -vy
        // Update the position.
        cx += vx
        cy += vy
        // Set the new values.
        circle.set({ cx: cx, cy: cy, vx: vx, vy: vy })
      })
      // The recursive bit.
      requestAnimationFrame(animate)
    }
    // Call the animation.
    animate()
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
