<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import * as Gen from '@/lib/sksvg/generative'
  import { PerlinNoise2D } from '@/lib/sksvg/noise'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // Create our noise.
  const noise = new PerlinNoise2D()
  // the noise x and y co-ordinates
  let nX = 0
  // the noise speed that will determine the rate at which we’ll increment the noise coordinates
  const noiseSpeed = 0.025

  onMount(() => {
    // Parent SVG.
    const svg = new SkSVG().addTo(container)
    // Viewport and viewBox (1:1 aspect ratio).
    const svgSize = Math.min(window.innerWidth, window.innerHeight)
    svg.set({ width: svgSize, height: svgSize, viewBox: '0 0 1000 1000' })

    const lines = svg.create('g')
    const hue = Gen.random(0, 360)
    const iterations = Gen.random(60, 100)

    // Start the dance.
    for (let i = 10; i < iterations; i += 1) {
      const noiseValue = noise.get(nX)
      const hueShift = Gen.map(noiseValue, -1, 1, -180, 180)
      const lineLength = Gen.map(noiseValue, -1, 1, 0, 1000)

      const l1 = lines.create('line').set({
        x1: 0,
        y1: 0,
        x2: 0,
        y2: lineLength,
        // wrap this in the Gen.constrain() function to keep the values between 0 and 360, and inside this, the hue will increment by the hueShift
        // set both the opacity (within the hsl() function) and the stroke-width to 0.5, which will keep the line nice and delicate
        stroke: `hsl(${Gen.constrain(hue + hueShift, 0, 360)} 80% 80% / 0.5)`,
        stroke_width: 0.5,
      })

      const l2 = lines.create('line').set({
        x1: 0,
        y1: 0,
        x2: 0,
        // this time we’ll stretch the lineLength a little, shift the hue in the opposite direction, and also reduce its opacity
        y2: lineLength * 1.1,
        stroke: `hsl(${Gen.constrain(hue - hueShift, 0, 360)} 80% 80% / 0.25)`,
        stroke_width: 0.5,
      })

      // rotate the first line positively in a clockwise direction and the second line negatively in an anticlockwise direction
      l1.rotate(i)
      l2.rotate(-i)

      nX += noiseSpeed
    }

    // move the lines to the center of the canvas and rotate them by a random amount between 0 and 360
    lines.moveTo(500, 500)
    lines.rotate(Gen.random(0, 360))
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
