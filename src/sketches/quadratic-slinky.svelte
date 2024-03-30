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

    // Style the slinky.
    svg.create('style').content(`
      #slinky path {
        fill: none;
        stroke-width: 0.75;
        stroke-linecap: round;
      }
    `)

    // Choose a random starting hue.
    let hue = Gen.random(0, 360)

    // Set up the slinky path group.
    const slinky = svg.create('g').set({ id: 'slinky' })

    // Start the loop.
    for (let i = 0; i < 500; i += 5) {
      // Create the control points.
      // - imagine a control point as a force of attraction, or pull, toward which a curve bends
      let cpx = Gen.random(200, 400)
      let cpy = i - 400

      // Create the quadratic curve.
      slinky.create('path').set({
        stroke: `hsl(${hue} 90% 80% / 0.85)`,
        // q [dcpx dcpy dx dy] ...
        // - For the curve coordinates, we’re taking advantage of the relative coordinates calculated by the lowercase q command, which allows us to keep the values in step with curve’s starting point.
        // dx: The width of our curve will be 600 units (relative to the viewBox), so our halfway point will be 300.
        // cpx: On the x axis, the cpx variable is picking a random integer value 100 units either side of the halfway point, to give our slinky some “wobble.”
        // cpy: The cpy variable is more straightforward; it moves down the screen on each iteration, with an offset of 400 units that will “pull” the curve upward.
        d: `M 0 ${i} q ${cpx} ${cpy} 600 0`,
      })

      // Increment the hue.
      // - modulo operator (%) can be useful to cycle within predefined ranges, such as the 0 to 360 constraints of a color’s hue.
      hue = (hue % 360) + 1.5
    }

    slinky.moveTo(500, 500)
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
