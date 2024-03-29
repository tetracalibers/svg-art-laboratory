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
  let nY = 0
  // the noise speed that will determine the rate at which we’ll increment the noise coordinates
  const noiseSpeed = 0.5

  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({ viewBox: '0 0 1000 1000', width: svgSize, height: svgSize })

    const noiseGrid = svg.create('g')
    // the gridSize to cover the entire viewBox
    const gridSize = 1000
    const rows = 80
    const increment = gridSize / rows

    // Create the noise matrix.
    // - Instead of starting with the y coordinate in the outer loop, we’re going to start with the x coordinate.
    // - What this will do is construct our grid from top to bottom and then left to right.
    // - In other words, we’ll fill out our columns first rather than the rows, which will allow our noise values to flow in a downward motion.
    for (let x = 0; x < gridSize; x += increment) {
      for (let y = 0; y < gridSize; y += increment) {
        // Fetch the noise value.
        let noiseValue = noise.get(nX, nY)
        // Map the noise value to a useful range.
        // - we call the noise.get() method, the value returned is a float between -1 and 1 (with some occasional outliers).
        // - The lightness component of the hsl() function, however, should have values between 0 and 100%, so in its raw state, the noise value isn’t very useful here.
        noiseValue = Gen.map(noiseValue, -1, 1, 0, 100, false)

        // Create text displaying either 0 or 1 (50% chance).
        // - We want a series of ones and zeros to fill the grid, with a 50% chance of either digit being chosen.
        const text = noiseGrid.create('text')
        text.content(Gen.chance() ? '1' : '0')

        text.set({
          // set the position of the digit with respect to the x and y loop iterator values
          x: x,
          y: y,
          // set the intensity of the fill color (i.e., the lightness component of the hsl() function) with the noiseValue variable
          fill: `hsl(120 20% ${noiseValue}%)`,
        })

        // In total, we have 2,500 text elements in this sketch, and for each of these elements, the font-size and font-family attributes remain static throughout.
        // This seems quite wasteful.

        // Set some text styling.
        // - taking this measure resulted in a 40% reduction in the rendered markup – not bad!
        svg.create('style').content(`
          text {
            font-size: 16px;
            font-family: serif;
          }
        `)

        nX += noiseSpeed
        nY += noiseSpeed
      }
    }

    // Centre the grid within the viewBox.
    noiseGrid.moveTo(500, 500)
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
