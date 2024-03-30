<script lang="ts">
  import { SkSVG } from '@/lib/sksvg'
  import * as Gen from '@/lib/sksvg/generative'
  import { onMount } from 'svelte'

  let container: HTMLElement

  let winInnerWidth: number
  let winInnerHeight: number

  // Set up a blend modes array.
  const blendModes = [
    'screen',
    'overlay',
    'lighten',
    'color-dodge',
    'soft-light',
    'color',
  ]

  onMount(() => {
    // Viewport size (1:1 aspect ratio).
    const svgSize = Math.min(winInnerWidth, winInnerHeight)

    const svg = new SkSVG()
    svg.addTo(container)
    svg.set({ viewBox: '0 0 1000 1000', width: svgSize, height: svgSize })

    // Create our grid container group.
    const grid = svg.create('g')

    const gridSize = 700
    const rows = 15
    const spacing = 5

    const increment = gridSize / rows
    // The Math.abs() function just ensures our cellSize is always a positive value,
    // which can prevent errors if we go crazy with our rows and spacing values.
    const cellSize = Math.abs(increment - spacing)

    // A nested loop to visualise the grid.
    for (let y = 0; y < gridSize; y += increment) {
      for (let x = 0; x < gridSize; x += increment) {
        if (Gen.chance(55)) {
          grid.create('rect').set({
            x: x,
            y: y,
            width: cellSize,
            height: cellSize,
            // This time we’re unleashing the full rgb color spectrum, so the results can range from dramatic and dynamic to garish and grating.
            // There is something I like about these results; the coloring, however, can get a little too incongruous at times.
            fill: `rgb(
              ${[Gen.random(0, 255), Gen.random(0, 255), Gen.random(0, 255)]}
            )`,
          })
        }
      }
    }

    // Initialise the filter.
    const filter = svg.createFilter('colourise')

    // De-saturate the input.
    filter.create('feColorMatrix').set({
      type: 'saturate',
      // To drain the colors from our input, we need to set the values to 0.
      values: 0,
      result: 'desaturate',
    })

    // This should result in a grayscale grid.
    // Next, we want to choose a color to mix into it.

    // Set a flood colour.
    filter.create('feFlood').set({
      flood_color: '#7F462C',
      result: 'flood',
    })

    // Randomise the blend mode.
    filter.create('feBlend').set({
      mode: Gen.pickRandom(blendModes),
      // The first input, in, acts as our top color
      in: 'flood',
      // the second input, in2, acts as our background color
      in2: 'desaturate',
      result: 'blend',
    })

    // Our grid should have re-appeared at this point in colorized form, but we’ve still got our flood color in the foreground.
    // We need a way to strip this out.

    // Composite the blend 'atop' the original.
    filter.create('feComposite').set({
      in: 'blend',
      in2: 'SourceGraphic',
      // atop: The portion of the foreground that overlaps with the background is retained; the rest of the foreground is clipped.
      operator: 'atop',
    })

    // Apply the filter.
    grid.set({ filter: 'url(#colourise)' })

    // Centre the grid within the viewBox.
    grid.moveTo(500, 500)
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
