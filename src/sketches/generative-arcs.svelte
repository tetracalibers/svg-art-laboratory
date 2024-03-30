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

    // Set up a container group for our arc curves.
    const arcs = svg.create('g')

    // Randomise some variables.
    const rx = Gen.random(5, 350)
    const ry = Gen.random(5, 350)
    let hue = Gen.random(0, 360)

    for (let i = 0; i < 360; i += 1) {
      // the arc’s rotation, which will have the effect of distending the curve in a particular direction
      const rotation = Gen.random(0, 180)
      // the large-arc-flag, which, thanks to our Gen.chance() function, will have a 50% chance of being either 0 or 1
      const largeArc = Gen.chance() ? 1 : 0

      // Create a first set of clockwise arc curves (sweep = 1).
      arcs.create('path').set({
        fill: 'none',
        stroke: `hsl(${hue} 75% 75% / 0.05)`,
        // A [rx ry rotation large-arc-flag sweep-flag x y] ...
        // - The rotation defines the angle of rotation along the x axis.
        // - With the large-arc-flag set to 1, a large arc will be chosen.
        // - With the sweep-flag set to 1, the arc will be drawn in a clockwise direction.
        d: `M 275 500 A ${rx} ${ry} ${rotation} ${largeArc} 1 725 500`,
      })

      // Create a second set of counter-clockwise arc curves (sweep = 0).
      arcs.create('path').set({
        fill: 'none',
        // The hue we’ll offset by 60, just to add a bit of contrast to the colors.
        stroke: `hsl(${hue + 60} 75% 75% / 0.05)`,
        // The sweep-flag we’ll set to 0, making this set anticlockwise.
        d: `M 275 500 A ${rx} ${ry} ${rotation} ${largeArc} 0 725 500`,
      })

      // Increment the hue.
      hue = (hue % 360) + 0.5

      // If you want to inject a little more dynamism though...
      // Apply a random rotation.
      arcs.rotate(Gen.random(0, 360))
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
